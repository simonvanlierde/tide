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

  it("shows cycle day as the primary information", () => {
    render(<TodayScreen today="2026-04-18" />);

    expect(screen.getByText(/day 17/i)).toBeInTheDocument();
    expect(screen.getByText(/fertile window/i)).toBeInTheDocument();
  });

  it("logs a period day from the primary action", () => {
    render(<TodayScreen today="2026-04-18" />);

    fireEvent.click(screen.getByRole("button", { name: /log period today/i }));
    expect(screen.getByText(/logged for today/i)).toBeInTheDocument();
  });
});
