import { act, fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadAppState } from "../../src/data/storage";
import type { IsoDate } from "../../src/domain/types";
import { REMINDER_STATUS_TIMEOUT_MS } from "../../src/features/settings/config";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import {
  createAppState,
  renderWithAppState,
} from "../support/app";

function renderSettings(
  today: IsoDate = "2026-04-19",
  state = createAppState(),
) {
  renderWithAppState(<SettingsScreen today={today} />, { state });
}

describe("SettingsScreen", () => {
  it("shows the privacy notice inside a grouped settings card", () => {
    renderSettings();
    expect(
      screen.getByRole("heading", { level: 2, name: /information/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/everything stays on this device/i)).toBeInTheDocument();
  });

  it("allows the reminder window to be adjusted with preset chips", () => {
    renderSettings();
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

  it("shows snooze controls and can turn reminders back on now", () => {
    vi.useFakeTimers();
    renderSettings(
      "2026-04-19",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-22",
          homeDisplayMode: "summary",
        },
      }),
    );

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

  it("shows reminder timing and persists home controls", () => {
    renderSettings(
      "2026-04-19",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    );

    expect(screen.getByText(/next reminder/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /circular/i }));

    expect(loadAppState().settings).toMatchObject({
      reminderWindowDays: 4,
      snoozedUntil: null,
      homeDisplayMode: "circular",
    });
  });

  it("shows concise information guidance", () => {
    renderSettings();

    expect(
      screen.getByText(/log a day only when you had menstrual bleeding/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });
});
