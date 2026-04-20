import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAppState } from "../../src/data/storage";
import { REMINDER_STATUS_TIMEOUT_MS } from "../../src/features/settings/config";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { createAppState } from "../support/appState";
import { renderWithAppState } from "./renderWithAppState";

describe("SettingsScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the privacy notice inside a grouped settings card", () => {
    renderWithAppState(<SettingsScreen />);
    expect(
      screen.getByRole("heading", { level: 2, name: /information/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/everything stays on this device/i)).toBeInTheDocument();
  });

  it("shows export and import actions", () => {
    renderWithAppState(<SettingsScreen />);
    expect(
      screen.getByRole("button", { name: /export backup/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup file/i)).toBeInTheDocument();
  });

  it("allows the reminder window to be adjusted with preset chips", () => {
    renderWithAppState(<SettingsScreen />);
    fireEvent.click(
      within(screen.getByRole("group", { name: /reminder window/i })).getByRole(
        "button",
        {
          name: /^5 days$/i,
        },
      ),
    );
    expect(
      screen.getByText(/5 days before your expected period/i),
    ).toBeInTheDocument();
  });

  it("shows a compact reminder summary", () => {
    renderWithAppState(<SettingsScreen today="2026-04-19" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    });

    expect(screen.getByText(/next reminder/i)).toBeInTheDocument();
  });

  it("shows snooze controls and can turn reminders back on now", () => {
    vi.useFakeTimers();
    renderWithAppState(<SettingsScreen today="2026-04-19" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-22",
          homeDisplayMode: "summary",
        },
      }),
    });

    expect(screen.getByText(/snoozed until 2026-04-22/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /turn reminders back on/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /turn reminders back on/i }),
    );
    expect(
      screen.queryByText(/snoozed until 2026-04-22/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/reminders turned back on/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(REMINDER_STATUS_TIMEOUT_MS);
    });
    expect(
      screen.queryByText(/reminders turned back on/i),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows compact home controls and persists them", () => {
    renderWithAppState(<SettingsScreen />);

    fireEvent.click(screen.getByRole("button", { name: /circular/i }));

    expect(loadAppState().settings).toMatchObject({
      reminderWindowDays: 4,
      snoozedUntil: null,
      homeDisplayMode: "circular",
    });
  });

  it("orders settings sections as home, reminders, data, information", () => {
    renderWithAppState(<SettingsScreen />);

    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Home", "Reminders", "Data", "Information"]);
  });

  it("shows concise information guidance", () => {
    renderWithAppState(<SettingsScreen />);

    expect(
      screen.getByText(/log a day only when you had menstrual bleeding/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });

  it("shows an inline error if import fails", async () => {
    renderWithAppState(<SettingsScreen />);

    const fileInput = screen.getByLabelText(
      /import backup file/i,
    ) as HTMLInputElement;
    const badFile = new File(["\uFEFFnot-json"], "bad.json", {
      type: "application/json",
    });
    Object.defineProperty(badFile, "text", {
      value: async () => "\uFEFFnot-json",
    });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/unexpected backup file format/i),
      ).toBeInTheDocument();
    });
  });
});
