import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";

const defaultSettings = {
  reminderWindowDays: 4,
  snoozedUntil: null,
  homeDisplayMode: "summary",
  homeCards: {
    showNextPeriodCard: true,
    showPhaseCard: true,
    showFertilityCard: true
  }
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

  it("renders the summary home without a duplicate today eyebrow", () => {
    render(<TodayScreen today="2026-04-18" />);

    expect(screen.getByRole("heading", { name: /day 17/i })).toBeInTheDocument();
    expect(screen.queryByText(/^today$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/currently in the luteal phase/i)).toBeInTheDocument();
    expect(screen.getByText(/period expected in 12 days/i)).toBeInTheDocument();
    expect(screen.getByText(/fertility estimate: lower chance today/i)).toBeInTheDocument();
    expect(screen.getByText(/informational only and not birth control/i)).toBeInTheDocument();
  });

  it("respects the summary card visibility preferences", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          homeCards: {
            showNextPeriodCard: false,
            showPhaseCard: true,
            showFertilityCard: false
          }
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);

    expect(screen.queryByText(/next period/i)).not.toBeInTheDocument();
    expect(screen.getByText(/current phase/i)).toBeInTheDocument();
    expect(screen.queryByText(/fertility estimate:/i)).not.toBeInTheDocument();
  });

  it("renders the linear cycle view when selected", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          homeDisplayMode: "linear"
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);
    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/circular cycle view/i)).not.toBeInTheDocument();
  });

  it("renders the circular cycle view when selected", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
        settings: {
          ...defaultSettings,
          homeDisplayMode: "circular"
        }
      })
    );

    render(<TodayScreen today="2026-04-18" />);
    expect(screen.getByLabelText(/circular cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/linear cycle view/i)).not.toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    render(<TodayScreen today="2026-04-15" />);

    expect(screen.getByText(/ovulation is likely around now/i)).toBeInTheDocument();
    expect(screen.getByText(/fertility estimate: higher chance today/i)).toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", () => {
    render(<TodayScreen today="2026-04-18" />);

    fireEvent.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(screen.getByRole("button", { name: /remove bleeding log/i })).toBeInTheDocument();
    expect(screen.getByText(/marked as a bleeding day/i)).toBeInTheDocument();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: defaultSettings
      })
    );

    render(<TodayScreen today="2026-04-21" />);
    expect(screen.getByText(/still learning your cycle from recent logs/i)).toBeInTheDocument();
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
    expect(screen.getByText(/period expected 1 day ago/i)).toBeInTheDocument();
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

});
