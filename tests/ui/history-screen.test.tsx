import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HistoryScreen } from "../../src/features/history/HistoryScreen";
import { createAppState, renderWithAppState } from "../support/app";

const originalAnimate = HTMLElement.prototype.animate;

describe("HistoryScreen", () => {
  afterEach(() => {
    HTMLElement.prototype.animate = originalAnimate;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function stubMatchMedia(matches: boolean) {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  }

  it("renders a month calendar with bleeding-day guidance", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.getByLabelText(/history calendar/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("shows fertility markers by default but hides them when turned off", () => {
    const shown = renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    expect(
      screen.getByRole("button", { name: /likely ovulation/i }),
    ).toBeInTheDocument();
    shown.unmount();

    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02"],
        settings: { showFertility: false },
      }),
    });
    expect(
      screen.queryByRole("button", { name: /likely ovulation/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /fertile window/i }),
    ).not.toBeInTheDocument();
    // The expected-period marker is not fertility data, so it stays.
    expect(
      screen.getByRole("button", { name: /expected period/i }),
    ).toBeInTheDocument();
  });

  it("uses the calendar as the main editor for logged days", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.queryByText(/remove 2026-04-02/i)).not.toBeInTheDocument();
  });

  it("logs a day at medium flow with a single tap", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    // One tap on an empty day logs it at the default flow, no picker needed.
    await user.click(
      screen.getByRole("button", { name: /log april 5, 2026/i }),
    );

    expect(
      screen.getByRole("button", { name: /edit april 5, 2026/i }),
    ).toHaveClass("is-logged", "is-flow-medium");
  });

  it("refines a logged day's flow from the picker on a second tap", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    // Tapping an already-logged day opens its picker to change the flow.
    await user.click(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    );
    await user.click(screen.getByRole("radio", { name: /heavy/i }));

    expect(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    ).toHaveClass("is-logged", "is-flow-heavy");
  });

  it("clears a logged day with the picker's remove action", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    await user.click(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: /not bleeding/i }));

    // Once cleared the day is empty again, so its label flips back to "Log".
    expect(
      screen.getByRole("button", { name: /log april 2, 2026/i }),
    ).not.toHaveClass("is-logged");
  });

  it("closes an open picker when another day is logged", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    );
    expect(
      screen.getByRole("button", { name: /^close$/i }),
    ).toBeInTheDocument();

    // Tapping an empty day logs it and moves selection off the old day.
    await user.click(
      screen.getByRole("button", { name: /log april 5, 2026/i }),
    );

    expect(
      screen.queryByRole("button", { name: /^close$/i }),
    ).not.toBeInTheDocument();
  });

  it("focuses the selected intensity when the picker opens", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    );

    // A logged day defaults to medium, so the arrow keys have a starting point.
    expect(screen.getByRole("radio", { name: /medium/i })).toHaveFocus();
  });

  it("closes the picker when interacting outside it", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(
      screen.getByRole("button", { name: /edit april 2, 2026/i }),
    );
    expect(
      screen.getByRole("button", { name: /^close$/i }),
    ).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(
      screen.queryByRole("button", { name: /^close$/i }),
    ).not.toBeInTheDocument();
  });

  it("changes month by swiping the calendar left and right", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/history calendar/i);

    fireEvent.touchStart(grid, { touches: [{ clientX: 240, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 90, clientY: 130 }],
    });
    expect(
      screen.getByRole("button", { name: /may 2026/i }),
    ).toBeInTheDocument();

    fireEvent.touchStart(grid, { touches: [{ clientX: 90, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 240, clientY: 130 }],
    });
    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("ignores incomplete, short, and vertical swipes", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/history calendar/i);

    fireEvent.touchStart(grid, { touches: [] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 90, clientY: 90 }],
    });
    fireEvent.touchStart(grid, { touches: [{ clientX: 240, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 210, clientY: 125 }],
    });
    fireEvent.touchStart(grid, { touches: [{ clientX: 240, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 170, clientY: 220 }],
    });

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("ignores unrelated calendar keyboard shortcuts", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/history calendar/i);

    fireEvent.keyDown(grid, { key: "End" });

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("changes month with PageDown and PageUp", () => {
    renderWithAppState(<HistoryScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/history calendar/i);

    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(
      screen.getByRole("button", { name: /may 2026/i }),
    ).toBeInTheDocument();

    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("leaves month input keyboard handling to the picker", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />);

    await user.click(screen.getByRole("button", { name: /april 2026/i }));
    fireEvent.keyDown(screen.getByLabelText(/select month and year/i), {
      key: "PageDown",
    });

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("changes the visible month from the month-year picker", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2025-03-10", "2026-04-20", "2024-12-03"],
      }),
    });

    await user.click(screen.getByRole("button", { name: /april 2026/i }));
    // Native <input type="month"> — set directly with fireEvent; userEvent
    // cannot reliably type into date/month inputs in jsdom.
    fireEvent.change(screen.getByLabelText(/select month and year/i), {
      target: { value: "2025-03" },
    });

    expect(screen.getByText(/march 2025/i)).toBeInTheDocument();
  });

  it("navigates months with previous, next, and today actions", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-03-10", "2026-04-02"],
      }),
    });

    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(
      screen.getByRole("button", { name: /march 2026/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(
      screen.getByRole("button", { name: /go to current month/i }),
    );

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("animates today after using the today action when motion is allowed", async () => {
    const user = userEvent.setup();
    const animate = vi.fn();
    stubMatchMedia(false);
    HTMLElement.prototype.animate =
      animate as typeof HTMLElement.prototype.animate;
    renderWithAppState(<HistoryScreen today="2026-04-21" />);

    await user.click(
      screen.getByRole("button", { name: /go to current month/i }),
    );

    expect(animate).toHaveBeenCalledWith(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.18)" },
        { transform: "scale(1)" },
      ],
      { duration: 460, easing: "ease-out" },
    );
  });

  it("skips the today animation when reduced motion is requested", async () => {
    const user = userEvent.setup();
    const animate = vi.fn();
    stubMatchMedia(true);
    HTMLElement.prototype.animate =
      animate as typeof HTMLElement.prototype.animate;
    renderWithAppState(<HistoryScreen today="2026-04-21" />);

    await user.click(
      screen.getByRole("button", { name: /go to current month/i }),
    );

    expect(animate).not.toHaveBeenCalled();
  });

  it("disables future days and does not toggle them", async () => {
    const user = userEvent.setup();
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-02"],
      }),
    });

    const futureDay = screen.getByRole("button", {
      name: /april 22, 2026 unavailable/i,
    });

    expect(futureDay).toBeDisabled();
    await user.click(futureDay);

    expect(futureDay).not.toHaveClass("is-logged");
  });

  it("shows a logged today state without losing the today marker", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-21"],
      }),
    });

    expect(
      screen.getByRole("button", { name: /edit april 21, 2026/i }),
    ).toHaveClass("is-logged", "is-today");
  });

  it("renders outside-month days as de-emphasized but still visible", () => {
    renderWithAppState(<HistoryScreen today="2026-04-21" />, {
      state: createAppState(),
    });

    expect(
      screen.getByRole("button", { name: /log march 30, 2026/i }),
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
    const helper = screen.getByText(
      /tap a day to log bleeding\. tap a logged day to change or remove it/i,
    );
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

  it("hides period day numbers when the setting is off", () => {
    const withNumbers = renderWithAppState(
      <HistoryScreen today="2026-04-18" />,
      { state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }) },
    );
    expect(
      withNumbers.container.querySelectorAll(".calendar-grid__period-day"),
    ).not.toHaveLength(0);
    withNumbers.unmount();

    const hidden = renderWithAppState(<HistoryScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { showPeriodDayNumbers: false },
      }),
    });
    expect(
      hidden.container.querySelectorAll(".calendar-grid__period-day"),
    ).toHaveLength(0);
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
