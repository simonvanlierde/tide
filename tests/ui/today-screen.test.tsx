import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";

describe("TodayScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );
  });

  it("shows the cycle day hero and secondary metric cards", () => {
    render(<TodayScreen today="2026-04-18" />);

    expect(screen.getByText(/day 17/i)).toBeInTheDocument();
    expect(screen.getByText(/next period/i)).toBeInTheDocument();
    expect(screen.getByText(/^Ovulation$/)).toBeInTheDocument();
  });

  it("logs a period day from the primary action", () => {
    render(<TodayScreen today="2026-04-18" />);

    fireEvent.click(screen.getByRole("button", { name: /log period today/i }));
    expect(screen.getByText(/logged for today/i)).toBeInTheDocument();
  });

  it("shows an early estimate note when fallback predictions are in use", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );

    render(<TodayScreen today="2026-04-21" />);
    expect(screen.getByText(/early estimate/i)).toBeInTheDocument();
  });

  it("hides the snooze action when reminders are not currently relevant", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );

    render(<TodayScreen today="2026-04-21" />);
    expect(screen.queryByRole("button", { name: /snooze reminders/i })).not.toBeInTheDocument();
  });
});
