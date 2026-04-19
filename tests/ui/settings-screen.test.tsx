import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";

describe("SettingsScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the privacy notice inside a grouped settings card", () => {
    render(<SettingsScreen />);
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/your cycle data stays on this device/i)).toBeInTheDocument();
  });

  it("shows export and import actions", () => {
    render(<SettingsScreen />);
    expect(screen.getByRole("button", { name: /export backup/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup file/i)).toBeInTheDocument();
  });

  it("allows the reminder window to be adjusted with preset chips", () => {
    render(<SettingsScreen />);
    fireEvent.click(
      within(screen.getByRole("group", { name: /reminder window/i })).getByRole("button", {
        name: /^7 days$/i
      })
    );
    expect(screen.getByText(/reminder window: 7 days/i)).toBeInTheDocument();
  });

  it("shows install guidance and a next reminder summary", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );

    render(<SettingsScreen today="2026-04-19" />);

    expect(screen.getByText(/next reminder/i)).toBeInTheDocument();
    expect(screen.getByText(/add to home screen/i)).toBeInTheDocument();
  });

  it("shows snooze controls and can turn reminders back on now", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { reminderWindowDays: 4, snoozedUntil: "2026-04-22" }
      })
    );

    render(<SettingsScreen today="2026-04-19" />);

    expect(screen.getByText(/snoozed until 2026-04-22/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /snooze 1 day/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /turn reminders back on now/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /turn reminders back on now/i }));
    expect(screen.queryByText(/snoozed until 2026-04-22/i)).not.toBeInTheDocument();
  });

  it("shows an inline error if import fails", async () => {
    render(<SettingsScreen />);

    const fileInput = screen.getByLabelText(/import backup file/i) as HTMLInputElement;
    const badFile = new File(["\uFEFFnot-json"], "bad.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getByText(/unexpected backup file format/i)).toBeInTheDocument();
    });
  });
});
