import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HistoryScreen } from "../../src/features/history/HistoryScreen";
import { createAppState } from "../support/appState";
import { renderWithAppState } from "./renderWithAppState";

describe("HistoryScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders a month calendar with bleeding-day guidance", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.getByLabelText(/history calendar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("uses the calendar as the main editor for logged days", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.queryByText(/remove 2026-04-02/i)).not.toBeInTheDocument();
  });

  it("allows toggling a day from the calendar", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    fireEvent.click(
      screen.getByRole("button", { name: /toggle april 5, 2026/i }),
    );
    expect(
      screen.getByRole("button", { name: /toggle april 5, 2026/i }),
    ).toHaveClass("is-logged");
  });

  it("changes the visible month from the month-year picker", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2025-03-10", "2026-04-20", "2024-12-03"],
      }),
    });

    fireEvent.click(screen.getByRole("button", { name: /april 2026/i }));
    fireEvent.change(screen.getByLabelText(/select month and year/i), {
      target: { value: "2025-03" },
    });

    expect(screen.getByText(/march 2025/i)).toBeInTheDocument();
  });

  it("shows a quiet empty state when no logs exist", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: [],
      }),
    });

    expect(
      screen.getByText(/no bleeding days logged yet/i),
    ).toBeInTheDocument();
  });
});
