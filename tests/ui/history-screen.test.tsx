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
        periodDays: ["2026-04-02"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );
  });

  it("renders history entries as grouped utility cards", () => {
    render(<HistoryScreen />);
    expect(screen.getByRole("heading", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByText("2026-04-02")).toBeInTheDocument();
  });

  it("allows retroactive removal of a logged day", () => {
    render(<HistoryScreen />);
    fireEvent.click(screen.getByRole("button", { name: /remove 2026-04-02/i }));
    expect(screen.queryByText(/2026-04-02/i)).not.toBeInTheDocument();
  });

  it("allows retroactive logging for a past day", () => {
    render(<HistoryScreen />);

    fireEvent.change(screen.getByLabelText(/period day/i), {
      target: { value: "2026-04-05" }
    });
    fireEvent.click(screen.getByRole("button", { name: /save period day/i }));

    expect(screen.getByText("2026-04-05")).toBeInTheDocument();
  });
});
