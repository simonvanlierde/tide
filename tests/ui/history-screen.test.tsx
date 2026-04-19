import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HistoryScreen } from "../../src/features/history/HistoryScreen";

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
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );
  });

  it("renders a month calendar and latest logs newest first", () => {
    render(<HistoryScreen today="2026-04-18" />);
    expect(screen.getByRole("heading", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/history calendar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2026-04-/i)[0]).toHaveTextContent("2026-04-20");
  });

  it("allows retroactive removal of a logged day", () => {
    render(<HistoryScreen today="2026-04-18" />);
    fireEvent.click(screen.getByRole("button", { name: /remove 2026-04-02/i }));
    expect(screen.queryByText(/2026-04-02/i)).not.toBeInTheDocument();
  });

  it("allows toggling a day from the calendar", () => {
    render(<HistoryScreen today="2026-04-18" />);
    fireEvent.click(screen.getByRole("button", { name: /toggle april 5, 2026/i }));
    expect(screen.getByText("2026-04-05")).toBeInTheDocument();
  });

  it("shows a quiet empty state when no logs exist", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: [],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );

    render(<HistoryScreen today="2026-04-18" />);
    expect(screen.getByText(/no period days logged yet/i)).toBeInTheDocument();
  });
});
