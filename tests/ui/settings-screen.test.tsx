import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadAppState } from "../../src/data/storage";
import type { AppSettings } from "../../src/domain/types";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { renderWithAppState } from "./renderWithAppState";

const defaultSettings: AppSettings = {
  reminderWindowDays: 4,
  snoozedUntil: null,
  homeDisplayMode: "summary",
  homeCards: {
    showNextPeriodCard: true,
    showPhaseCard: true,
    showFertilityCard: true,
  },
};

describe("SettingsScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the privacy notice inside a grouped settings card", () => {
    renderWithAppState(<SettingsScreen />);
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    expect(
      screen.getByText(/data stays on this device unless you export it/i),
    ).toBeInTheDocument();
  });

  it("shows export and import actions", () => {
    const { container } = renderWithAppState(<SettingsScreen />);
    expect(
      screen.getByRole("button", { name: /export backup/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup file/i)).toBeInTheDocument();
    expect(
      container.querySelector(".primary-action svg.lucide-download"),
    ).not.toBeNull();
    expect(
      container.querySelector(".file-input svg.lucide-upload"),
    ).not.toBeNull();
  });

  it("allows the reminder window to be adjusted with preset chips", () => {
    renderWithAppState(<SettingsScreen />);
    fireEvent.click(
      within(screen.getByRole("group", { name: /reminder window/i })).getByRole(
        "button",
        {
          name: /^7 days$/i,
        },
      ),
    );
    expect(screen.getByText(/window:\s*7\s*days/i)).toBeInTheDocument();
  });

  it("shows a compact reminder summary", () => {
    renderWithAppState(<SettingsScreen today="2026-04-19" />, {
      state: {
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: defaultSettings,
      },
    });

    expect(screen.getByText(/next reminder/i)).toBeInTheDocument();
  });

  it("shows snooze controls and can turn reminders back on now", () => {
    renderWithAppState(<SettingsScreen today="2026-04-19" />, {
      state: {
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { ...defaultSettings, snoozedUntil: "2026-04-22" },
      },
    });

    expect(screen.getByText(/snoozed until 2026-04-22/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /turn reminders back on now/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /turn reminders back on now/i }),
    );
    expect(
      screen.queryByText(/snoozed until 2026-04-22/i),
    ).not.toBeInTheDocument();
  });

  it("shows compact home controls and persists them", () => {
    renderWithAppState(<SettingsScreen />);

    fireEvent.click(screen.getByRole("button", { name: /linear/i }));
    fireEvent.click(screen.getByRole("button", { name: /^fertility$/i }));

    expect(loadAppState().settings).toMatchObject({
      reminderWindowDays: 4,
      snoozedUntil: null,
      homeDisplayMode: "linear",
      homeCards: {
        showFertilityCard: false,
      },
    });
  });

  it("orders settings sections as home, reminders, data, privacy", () => {
    renderWithAppState(<SettingsScreen />);

    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Home", "Reminders", "Data", "Privacy"]);
  });

  it("shows concise privacy guidance", () => {
    renderWithAppState(<SettingsScreen />);

    expect(
      screen.getByText(
        /logged bleeding day means menstrual bleeding on that date/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/data stays on this device unless you export it/i),
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
