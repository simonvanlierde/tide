import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoryScreen } from "../../src/features/history/HistoryScreen";
import { createAppState, renderWithAppState } from "../support/app";

describe("HistoryScreen", () => {
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

  it("navigates months with previous, next, and today actions", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-03-10", "2026-04-02"],
      }),
    });

    fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
    expect(
      screen.getByRole("button", { name: /march 2026/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next month/i }));
    fireEvent.click(screen.getByRole("button", { name: /go to current month/i }));

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("disables future days and does not toggle them", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-02"],
      }),
    });

    const futureDay = screen.getByRole("button", {
      name: /april 22, 2026 unavailable/i,
    });

    expect(futureDay).toBeDisabled();
    fireEvent.click(futureDay);

    expect(futureDay).not.toHaveClass("is-logged");
  });

  it("shows a logged today state without losing the today marker", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-21"],
      }),
    });

    expect(
      screen.getByRole("button", { name: /toggle april 21, 2026/i }),
    ).toHaveClass("is-logged", "is-today");
  });

  it("renders outside-month days as de-emphasized but still visible", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState(),
    });

    expect(
      screen.getByRole("button", { name: /toggle march 30, 2026/i }),
    ).toHaveClass("is-outside-month");
  });

  it("renders the history calendar with the new header controls", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />);

    const header = screen.getByTestId("history-calendar-header");
    const headerButtons = within(header).getAllByRole("button");

    expect(headerButtons[0]).toHaveAccessibleName(/previous month/i);
    expect(headerButtons[1]).toHaveAccessibleName(/april 2026/i);
    expect(headerButtons[2]).toHaveAccessibleName(/next month/i);
  });

  it("places helper copy and the today action below the calendar grid", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />);

    const grid = screen.getByLabelText(/history calendar/i);
    const helper = screen.getByText(/tap any day you had menstrual bleeding/i);
    const todayButton = screen.getByRole("button", {
      name: /go to current month/i,
    });

    expect(
      grid.compareDocumentPosition(helper) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      helper.compareDocumentPosition(todayButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(todayButton).toHaveClass("history-calendar__today");
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
