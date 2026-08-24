import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarScreen } from "../../src/features/calendar/CalendarScreen";
import { createAppState, renderWithAppState } from "../support/app";

const originalAnimate = HTMLElement.prototype.animate;

describe("CalendarScreen", () => {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.getByLabelText(/calendar/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("shows fertility markers by default but hides them when turned off", () => {
    const shown = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    expect(
      screen.getByRole("button", { name: /likely ovulation/i }),
    ).toBeInTheDocument();
    shown.unmount();

    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    // The expected-period run is not fertility data, so it stays.
    expect(
      screen.getAllByRole("button", { name: /expected period/i }).length,
    ).toBeGreaterThan(0);
  });

  it("uses the calendar as the main editor for logged days", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.queryByText(/remove 2026-04-02/i)).not.toBeInTheDocument();
  });

  it("logs a day at medium flow with a single tap", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    ).toHaveClass("is-logged");
    // One tap records the day, not a flow level it never asked about.
    expect(
      screen.getByRole("button", { name: /edit april 5, 2026/i }).className,
    ).not.toMatch(/is-flow-/);
    // The tap wrote data: say so, and offer a one-tap undo.
    expect(screen.getByRole("status")).toHaveTextContent(/logged .*apr 5/i);
    await user.click(screen.getByRole("button", { name: /^undo$/i }));
    expect(
      screen.getByRole("button", { name: /log april 5, 2026/i }),
    ).not.toHaveClass("is-logged");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("refines a logged day's flow from the picker on a second tap", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

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
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

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
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

    fireEvent.keyDown(grid, { key: "End" });

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("changes month with PageDown and PageUp", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(
      screen.getByRole("button", { name: /may 2026/i }),
    ).toBeInTheDocument();

    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("leaves picker keyboard handling to the dropdowns", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />);

    await user.click(screen.getByRole("button", { name: /april 2026/i }));
    // PageDown on the month dropdown moves its own options, not the calendar.
    fireEvent.keyDown(screen.getByLabelText("Month"), { key: "PageDown" });

    expect(
      screen.getByRole("button", { name: /april 2026/i }),
    ).toBeInTheDocument();
  });

  it("changes the visible month from the month-year picker", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2025-03-10", "2026-04-20", "2024-12-03"],
      }),
    });

    await user.click(screen.getByRole("button", { name: /april 2026/i }));
    // The panel stays open across both picks so month and year can be set apart.
    await user.selectOptions(screen.getByLabelText("Year"), "2025");
    await user.selectOptions(screen.getByLabelText("Month"), "March");

    expect(screen.getByText(/march 2025/i)).toBeInTheDocument();
  });

  it("navigates months with previous, next, and today actions", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-03-10", "2026-04-02"],
      }),
    });

    // On the current month, the Today reset would be a no-op, so it's hidden.
    expect(
      screen.queryByRole("button", { name: /go to current month/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(
      screen.getByRole("button", { name: /march 2026/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(
      screen.getByRole("button", { name: /may 2026/i }),
    ).toBeInTheDocument();

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
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    // The Today button only appears once you've left the current month.
    await user.click(screen.getByRole("button", { name: /previous month/i }));
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
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    // The Today button only appears once you've left the current month.
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    await user.click(
      screen.getByRole("button", { name: /go to current month/i }),
    );

    expect(animate).not.toHaveBeenCalled();
  });

  it("disables future days and does not toggle them", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
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
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-21"],
      }),
    });

    expect(
      screen.getByRole("button", { name: /edit april 21, 2026/i }),
    ).toHaveClass("is-logged", "is-today");
  });

  it("renders outside-month days as de-emphasized but still visible", () => {
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
      state: createAppState(),
    });

    expect(
      screen.getByRole("button", { name: /log march 30, 2026/i }),
    ).toHaveClass("is-outside-month");
  });

  it("renders the calendar with the new header controls", () => {
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    const header = screen.getByTestId("calendar-header");
    const headerButtons = within(header).getAllByRole("button");

    expect(headerButtons[0]).toHaveAccessibleName(/previous month/i);
    expect(headerButtons[1]).toHaveAccessibleName(/april 2026/i);
    expect(headerButtons[2]).toHaveAccessibleName(/next month/i);
  });

  it("places helper copy and the today action below the calendar grid", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    // Leave the current month so the Today reset button is shown.
    await user.click(screen.getByRole("button", { name: /previous month/i }));

    const grid = screen.getByLabelText(/calendar/i);
    const helper = screen.getByText(/tap a past day to log your first/i);
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
    expect(todayButton).toHaveClass("calendar__today");
  });

  it("hides cycle day numbers when the setting is off", () => {
    const withNumbers = renderWithAppState(
      <CalendarScreen today="2026-04-18" />,
      { state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }) },
    );
    expect(
      withNumbers.container.querySelectorAll(".calendar-grid__period-day"),
    ).not.toHaveLength(0);
    withNumbers.unmount();

    const hidden = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { showCycleDayNumbers: false },
      }),
    });
    expect(
      hidden.container.querySelectorAll(".calendar-grid__period-day"),
    ).toHaveLength(0);
  });

  it("tells a first-timer what to tap, and shows no legend for markers that aren't there", () => {
    const { container } = renderWithAppState(
      <CalendarScreen today="2026-04-18" />,
      { state: createAppState({ periodDays: [] }) },
    );

    expect(
      screen.getByText(/tap a past day to log your first bleeding day/i),
    ).toBeInTheDocument();
    expect(container.querySelector(".calendar-legend")).toBeNull();
  });

  it("is one tab stop, with arrow keys walking the grid", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });

    // Only today carries the tab stop; every other day is skipped by Tab.
    const today = screen.getByRole("button", { name: /log april 18, 2026/i });
    const neighbour = screen.getByRole("button", {
      name: /log april 17, 2026/i,
    });
    expect(today).toHaveAttribute("tabindex", "0");
    expect(neighbour).toHaveAttribute("tabindex", "-1");

    today.focus();
    await user.keyboard("{ArrowLeft}");
    expect(neighbour).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(
      screen.getByRole("button", { name: /log april 10, 2026/i }),
    ).toHaveFocus();

    // Arrows refuse to walk into days that can't be logged yet.
    screen.getByRole("button", { name: /log april 18, 2026/i }).focus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("button", { name: /log april 18, 2026/i }),
    ).toHaveFocus();
  });

  it("explains that a fully future month can't be logged", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });

    await user.click(screen.getByRole("button", { name: /next month/i }));

    expect(
      screen.getByText(/future days can't be logged yet/i),
    ).toBeInTheDocument();
  });
});
