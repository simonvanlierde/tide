import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";

const defaultSettings = {
  reminderWindowDays: 4,
  snoozedUntil: null,
  homeLayoutMode: "circular",
  showPhaseChip: true,
  showFertilityChip: true
};

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
        settings: defaultSettings
      })
    );
  });

  it("defaults to the circular cycle layout with phase and fertility chips", () => {
    render(<TodayScreen today="2026-04-18" />);

    expect(screen.getByRole("heading", { name: /day 17/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/circular cycle view/i)).toBeInTheDocument();
    expect(screen.getByText(/phase: luteal/i)).toBeInTheDocument();
    expect(screen.getByText(/fertility: lower chance of pregnancy/i)).toBeInTheDocument();
    expect(screen.getByText(/next period in 12 days/i)).toBeInTheDocument();
  });

  it("shows the ovulation phase at a glance without duplicate phase cards", () => {
    render(<TodayScreen today="2026-04-15" />);

    expect(screen.getByText(/phase: ovulation/i)).toBeInTheDocument();
    expect(screen.getByText(/fertility: ovulation likely now/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Cycle status$/)).not.toBeInTheDocument();
  });

  it("logs a period day from the primary action", () => {
    render(<TodayScreen today="2026-04-18" />);

    fireEvent.click(screen.getByRole("button", { name: /log period today/i }));
    expect(screen.getByRole("button", { name: /remove period log for today/i })).toBeInTheDocument();
  });

  it("shows an early estimate note when fallback predictions are in use", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: defaultSettings
      })
    );

    render(<TodayScreen today="2026-04-21" />);
    expect(screen.getByText(/early estimate/i)).toBeInTheDocument();
  });

  it("shows a calm late label instead of a negative next-period number", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: defaultSettings
      })
    );

    render(<TodayScreen today="2026-05-01" />);
    expect(screen.getByText(/next period 1 day late/i)).toBeInTheDocument();
    expect(screen.queryByText(/-1 day/i)).not.toBeInTheDocument();
  });

  it("hides the snooze action when reminders are not currently relevant", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: defaultSettings
      })
    );

    render(<TodayScreen today="2026-04-21" />);
    expect(screen.queryByRole("button", { name: /snooze reminders/i })).not.toBeInTheDocument();
  });

  it("shows the snooze action on the predicted start day and one day late", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: defaultSettings
      })
    );

    const { rerender } = render(<TodayScreen today="2026-04-30" />);
    expect(screen.getByRole("button", { name: /snooze 1 day/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /snooze 3 days/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /snooze 7 days/i })).toBeInTheDocument();

    rerender(<TodayScreen today="2026-05-01" />);
    expect(screen.getByRole("button", { name: /snooze 3 days/i })).toBeInTheDocument();
  });

  it("respects chip visibility preferences independently", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          showPhaseChip: false,
          showFertilityChip: true
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);
    expect(screen.queryByText(/phase:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/fertility:/i)).toBeInTheDocument();
  });

  it("renders the simple and linear layouts when selected", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          homeLayoutMode: "simple"
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);
    expect(screen.getByLabelText(/simple home view/i)).toBeInTheDocument();

    cleanup();

    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          homeLayoutMode: "linear"
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);
    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
  });
});
