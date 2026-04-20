import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HistoryScreen } from "../../src/features/history/HistoryScreen";

const defaultSettings = {
  reminderWindowDays: 4,
  snoozedUntil: null
};

describe("HistoryScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
        settings: defaultSettings
      })
    );
  });

  it("renders a month calendar with bleeding-day guidance", () => {
    render(<HistoryScreen today="2026-04-18" />);
    expect(screen.queryByRole("heading", { name: /^history$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/history calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/tap any day you had menstrual bleeding/i)).toBeInTheDocument();
  });

  it("uses the calendar as the main editor for logged days", () => {
    render(<HistoryScreen today="2026-04-18" />);
    expect(screen.queryByText(/remove 2026-04-02/i)).not.toBeInTheDocument();
  });

  it("allows toggling a day from the calendar", () => {
    render(<HistoryScreen today="2026-04-18" />);
    fireEvent.click(screen.getByRole("button", { name: /toggle april 5, 2026/i }));
    expect(screen.getByRole("button", { name: /toggle april 5, 2026/i })).toHaveClass("is-logged");
  });

  it("navigates months and jumps year", { timeout: 10000 }, () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2025-03-10", "2026-04-20", "2024-12-03"],
        settings: defaultSettings
      })
    );

    const { container } = render(<HistoryScreen today="2026-04-18" />);
    expect(container.querySelector(".calendar-toolbar svg.lucide-chevron-left")).not.toBeNull();
    expect(container.querySelector(".calendar-toolbar svg.lucide-chevron-right")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByText(/march 2026/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/jump to year/i), { target: { value: "2025" } });
    expect(screen.getByText(/march 2025/i)).toBeInTheDocument();
  });

  it("shows a quiet empty state when no logs exist", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: [],
        settings: defaultSettings
      })
    );

    render(<HistoryScreen today="2026-04-18" />);
    expect(screen.getByText(/no bleeding days logged yet/i)).toBeInTheDocument();
  });
});
