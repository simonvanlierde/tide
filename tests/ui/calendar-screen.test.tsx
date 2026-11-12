import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadStoredState } from "../../src/data/storage";
import { CalendarScreen } from "../../src/features/calendar/CalendarScreen";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, createLearnedCycleState, renderWithAppState } from "../support/app";

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
    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("drops the tap hint once something is logged, and keeps both actions on one row", () => {
    const { container } = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    expect(screen.queryByText(/tap a day to log or edit bleeding/i)).not.toBeInTheDocument();
    const row = container.querySelector(".calendar__actions");
    expect(row).toContainElement(screen.getByRole("button", { name: /log a past period/i }));
    expect(row).toContainElement(screen.getByRole("button", { name: /add details for/i }));
  });

  it("lays the month out as a table with a weekday header per column", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />);

    const table = screen.getByRole("table", { name: "Calendar" });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    // The visible label may be one letter; the header's name is the full day.
    expect(headers[0]).toHaveAccessibleName("Monday");
    // April 2026 starts on a Wednesday: header row plus five weeks.
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(6);
    for (const week of rows.slice(1)) {
      expect(within(week).getAllByRole("cell")).toHaveLength(7);
    }
    expect(
      within(rows[1] as HTMLElement).getByRole("button", {
        name: /april 1, 2026/i,
      }),
    ).toBeInTheDocument();
  });

  it("hides fertility markers until asked, shows them on yes, hides them on no", () => {
    const unasked = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    expect(screen.queryByRole("button", { name: /expected ovulation/i })).not.toBeInTheDocument();
    unasked.unmount();

    const shown = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02"],
        settings: { showFertility: true },
      }),
    });
    expect(screen.getByRole("button", { name: /expected ovulation/i })).toBeInTheDocument();
    shown.unmount();

    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02"],
        settings: { showFertility: false },
      }),
    });
    expect(screen.queryByRole("button", { name: /expected ovulation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /fertile window/i })).not.toBeInTheDocument();
    // The expected-period run is not fertility data, so it stays.
    expect(screen.getAllByRole("button", { name: /expected period/i }).length).toBeGreaterThan(0);
  });

  it("uses the calendar as the main editor for logged days", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    expect(screen.queryByText(/remove 2026-04-02/i)).not.toBeInTheDocument();
  });

  it("logs a day without choosing a flow level with a single tap", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    // One tap on an empty day logs bleeding without opening the editor.
    await user.click(screen.getByRole("button", { name: /log april 5, 2026/i }));

    expect(screen.getByRole("button", { name: /edit april 5, 2026/i })).toHaveClass("is-logged");
    // One tap records the day, not a flow level it never asked about.
    expect(screen.getByRole("button", { name: /edit april 5, 2026/i }).className).not.toMatch(/is-flow-/);
    // The tap wrote data: say so, and offer a one-tap undo.
    expect(screen.getByRole("status")).toHaveTextContent(/logged .*apr 5/i);
    await user.click(screen.getByRole("button", { name: /^undo$/i }));
    expect(screen.getByRole("button", { name: /log april 5, 2026/i })).not.toHaveClass("is-logged");
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
    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));
    await user.click(screen.getByRole("radio", { name: /heavy/i }));

    expect(screen.getByRole("button", { name: /edit april 2, 2026/i })).toHaveClass("is-logged", "is-flow-heavy");
  });

  it("clears a logged day with the picker's remove action", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-12", "2026-04-20"],
      }),
    });

    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));
    await user.click(screen.getByRole("button", { name: /not bleeding/i }));

    // Once cleared the day is empty again, so its label flips back to "Log".
    expect(screen.getByRole("button", { name: /log april 2, 2026/i })).not.toHaveClass("is-logged");
  });

  it("keeps removal in the editor and returns grid focus when Done", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    const day = screen.getByRole("button", { name: /edit april 2, 2026/i });
    day.focus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: /not bleeding/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(day).toHaveAccessibleName(/log april 2, 2026/i);
    expect(screen.getByRole("button", { name: /^log bleeding$/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(day).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /april 3, 2026/i })).toHaveFocus();
  });

  it("returns keyboard focus to a single day after undo", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const day = screen.getByRole("button", { name: /log april 18, 2026/i });
    day.focus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: /^undo$/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(day).not.toHaveClass("is-logged");
    expect(day).toHaveFocus();
  });

  it("returns focus to the current day after removing an imported future day", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-20"] }),
    });
    screen.getByRole("button", { name: /edit april 20, 2026/i }).focus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: /log april 20, 2026/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^log bleeding$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^close$/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /log april 18, 2026/i })).toHaveFocus();
  });

  it("restores the new opener when switching between logged days", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });
    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));
    const day = screen.getByRole("button", { name: /edit april 3, 2026/i });
    await user.click(day);
    screen.getByRole("button", { name: /^close$/i }).focus();
    await user.keyboard("{Escape}");

    expect(day).toHaveFocus();
  });

  it("keeps focus on navigation when removing the only loggable day in a future month", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-05-20"] }),
    });
    await user.click(screen.getByRole("button", { name: /next month/i }));
    screen.getByRole("button", { name: /edit may 20, 2026/i }).focus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: /log may 20, 2026/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^close$/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /previous month/i })).toHaveFocus();
  });

  it("returns keyboard focus to the first day of a range after undo", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    screen.getByRole("button", { name: /log a past period/i }).focus();
    await user.keyboard("{Enter}{ArrowLeft}{ArrowLeft}{Enter}{ArrowRight}{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: /^undo$/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    const first = screen.getByRole("button", { name: /log april 16, 2026/i });
    expect(first).not.toHaveClass("is-logged");
    expect(first).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /log april 17, 2026/i })).toHaveFocus();
  });

  it("closes an open picker when another day is logged", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));
    expect(screen.getByRole("button", { name: /^close$/i })).toBeInTheDocument();

    // Tapping an empty day logs it and moves selection off the old day.
    await user.click(screen.getByRole("button", { name: /log april 5, 2026/i }));

    expect(screen.queryByRole("button", { name: /^close$/i })).not.toBeInTheDocument();
  });

  it("focuses the selected intensity when the picker opens", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));

    // A logged day defaults to medium, so the arrow keys have a starting point.
    expect(screen.getByRole("radio", { name: /medium/i })).toHaveFocus();
  });

  it("keeps the editor open on outside interaction until explicitly closed", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /edit april 2, 2026/i }));
    expect(screen.getByRole("button", { name: /^close$/i })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("button", { name: /^close$/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^close$/i }));
    expect(screen.queryByRole("button", { name: /^close$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit april 2, 2026/i })).toHaveFocus();
  });

  it("changes month by swiping the calendar left and right", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

    fireEvent.touchStart(grid, { touches: [{ clientX: 240, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 90, clientY: 130 }],
    });
    expect(screen.getByRole("button", { name: /may 2026/i })).toBeInTheDocument();

    fireEvent.touchStart(grid, { touches: [{ clientX: 90, clientY: 120 }] });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 240, clientY: 130 }],
    });
    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("ignores unrelated calendar keyboard shortcuts", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

    fireEvent.keyDown(grid, { key: "End" });

    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("changes month with PageDown and PageUp", () => {
    renderWithAppState(<CalendarScreen today="2026-04-18" />);
    const grid = screen.getByLabelText(/calendar/i);

    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(screen.getByRole("button", { name: /may 2026/i })).toBeInTheDocument();

    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("leaves picker keyboard handling to the dropdowns", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />);

    await user.click(screen.getByRole("button", { name: /april 2026/i }));
    // PageDown on the month dropdown moves its own options, not the calendar.
    fireEvent.keyDown(screen.getByLabelText("Month"), { key: "PageDown" });

    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: /go to current month/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByRole("button", { name: /march 2026/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByRole("button", { name: /may 2026/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go to current month/i }));
    expect(screen.getByRole("button", { name: /april 2026/i })).toBeInTheDocument();
  });

  it("animates today after using the today action when motion is allowed", async () => {
    const user = userEvent.setup();
    const animate = vi.fn();
    stubMatchMedia(false);
    HTMLElement.prototype.animate = animate as typeof HTMLElement.prototype.animate;
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    // The Today button only appears once you've left the current month.
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    await user.click(screen.getByRole("button", { name: /go to current month/i }));

    expect(animate).toHaveBeenCalledWith(
      [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
      { duration: 460, easing: "ease-out" },
    );
  });

  it("skips the today animation when reduced motion is requested", async () => {
    const user = userEvent.setup();
    const animate = vi.fn();
    stubMatchMedia(true);
    HTMLElement.prototype.animate = animate as typeof HTMLElement.prototype.animate;
    renderWithAppState(<CalendarScreen today="2026-04-21" />);

    // The Today button only appears once you've left the current month.
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    await user.click(screen.getByRole("button", { name: /go to current month/i }));

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

    expect(screen.getByRole("button", { name: /edit april 21, 2026/i })).toHaveClass("is-logged", "is-today");
  });

  it("renders outside-month days as de-emphasized but still visible", () => {
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
      state: createAppState(),
    });

    expect(screen.getByRole("button", { name: /log march 30, 2026/i })).toHaveClass("is-outside-month");
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
    renderWithAppState(<CalendarScreen today="2026-04-21" />, {
      state: createAppState({ settings: { calendarHelpDismissed: false } }),
    });

    // Leave the current month so the Today reset button is shown.
    await user.click(screen.getByRole("button", { name: /previous month/i }));

    const grid = screen.getByLabelText(/calendar/i);
    const helper = screen.getByText(/tap a day to log or change it/i);
    const todayButton = screen.getByRole("button", {
      name: /go to current month/i,
    });

    expect(grid.compareDocumentPosition(helper) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(helper.compareDocumentPosition(todayButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(todayButton).toHaveClass("calendar__today");
  });

  it("hides cycle day numbers when the setting is off", () => {
    const withNumbers = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });
    expect(withNumbers.container.querySelectorAll(".calendar-grid__period-day")).not.toHaveLength(0);
    expect(withNumbers.container.querySelector(".calendar-legend")).toHaveTextContent(/cycle day/i);
    withNumbers.unmount();

    const hidden = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { showCycleDayNumbers: false },
      }),
    });
    expect(hidden.container.querySelectorAll(".calendar-grid__period-day")).toHaveLength(0);
    expect(hidden.container.querySelector(".calendar-legend")).not.toHaveTextContent(/cycle day/i);
  });

  it("adds details for the selected day, today until one is picked", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });

    expect(screen.getByRole("button", { name: /add details for sat, apr 18/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /april 2, 2026/i }));
    expect(screen.queryByRole("button", { name: /add details for/i })).not.toBeInTheDocument();
    await user.click(screen.getByText("More details", { selector: "summary" }));

    expect(screen.getByRole("heading", { name: "April 2, 2026" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^date$/i)).not.toBeInTheDocument();
    expect(screen.getByText("More details", { selector: "summary" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Cramps" })).toBeVisible();
  });

  it("keeps future-day details read-only in the same dated panel", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-20"] }),
    });
    await user.click(screen.getByRole("button", { name: /april 2, 2026/i }));
    // A picked day takes the place of the range action.
    expect(screen.queryByRole("button", { name: /log a past period/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /edit april 20, 2026/i }));
    expect(screen.queryByRole("button", { name: /add details for/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "April 20, 2026" })).toBeInTheDocument();
    await user.click(screen.getByText("More details", { selector: "summary" }));
    expect(screen.getByRole("button", { name: "Cramps" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /note/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: /add details for thu, apr 2/i })).toBeInTheDocument();
  });

  it("names Edit for a day with details, and moves to the new today at midnight", () => {
    const state = {
      ...createAppState({ periodDays: ["2026-04-02"] }),
      detailsByDay: { "2026-04-18": { symptoms: null, mood: "good" as const, note: "" } },
    };
    const view = renderWithAppState(<CalendarScreen today="2026-04-18" />, { state });
    expect(screen.getByRole("button", { name: /edit details for sat, apr 18/i })).toBeInTheDocument();

    view.rerender(
      <AppStateProvider initialState={state}>
        <CalendarScreen today="2026-04-19" />
      </AppStateProvider>,
    );
    expect(screen.getByRole("button", { name: /add details for sun, apr 19/i })).toBeInTheDocument();
  });

  it("tells a first-timer what to tap, and shows no legend for markers that aren't there", () => {
    const { container } = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: [], settings: { calendarHelpDismissed: false } }),
    });

    expect(
      screen.getByText(/tap a day to log or change it, or use log a past period for a range/i),
    ).toBeInTheDocument();
    expect(container.querySelector(".calendar-legend")).toBeNull();
  });

  it("names its markers with the same words as the Today legend", () => {
    const { container } = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createLearnedCycleState(),
    });

    const legend = container.querySelector(".calendar-legend");
    expect(legend).toHaveTextContent(/period/i);
    expect(legend).toHaveTextContent(/fertile/i);
    // The short name keeps the legend on one line.
    expect(legend).not.toHaveTextContent(/window/i);
    expect(legend).not.toHaveTextContent(/logged/i);
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
    expect(screen.getByRole("button", { name: /log april 10, 2026/i })).toHaveFocus();

    // Arrows refuse to walk into days that can't be logged yet.
    screen.getByRole("button", { name: /log april 18, 2026/i }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /log april 18, 2026/i })).toHaveFocus();
  });

  it("explains that a fully future month can't be logged", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    });

    await user.click(screen.getByRole("button", { name: /next month/i }));

    expect(screen.getByText(/future days can't be logged yet/i)).toBeInTheDocument();
  });

  it("logs a past period from its first and last day, with one undo", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState({ intensityByDay: { "2026-04-07": "heavy" } }),
    });

    await user.click(screen.getByRole("button", { name: /log a past period/i }));
    // The pick happens on the grid, so focus goes there.
    expect(document.activeElement).toHaveClass("calendar-grid__day");
    expect(screen.getByRole("status")).toHaveTextContent(/first day/i);

    await user.click(screen.getByRole("button", { name: /april 5, 2026/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/from .*apr 5.*last day/i);
    // Nothing is logged until the last day is picked.
    expect(screen.getByRole("button", { name: /april 5, 2026/i })).not.toHaveClass("is-logged");

    await user.click(screen.getByRole("button", { name: /april 9, 2026/i }));
    for (const day of [5, 6, 8, 9]) {
      expect(screen.getByRole("button", { name: `Edit April ${day}, 2026` })).toHaveClass("is-logged");
    }
    // The day logged before keeps its flow.
    expect(screen.getByRole("button", { name: /edit april 7, 2026.*heavy/i })).toHaveClass("is-flow-heavy");
    expect(screen.getByRole("status")).toHaveTextContent(/logged .*apr 5 – .*apr 9/i);

    await user.click(screen.getByRole("button", { name: /^undo$/i }));
    for (const day of [5, 6, 8, 9]) {
      expect(screen.getByRole("button", { name: `Log April ${day}, 2026` })).not.toHaveClass("is-logged");
    }
    expect(screen.getByRole("button", { name: /edit april 7, 2026.*heavy/i })).toHaveClass("is-flow-heavy");
  });

  it("refuses a range past the cap and cancels with Escape", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState(),
    });

    await user.click(screen.getByRole("button", { name: /log a past period/i }));
    await user.click(screen.getByRole("button", { name: /april 1, 2026/i }));
    await user.click(screen.getByRole("button", { name: /april 15, 2026/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/more than 14 days/i);
    expect(document.querySelectorAll(".is-logged")).toHaveLength(0);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log a past period/i })).toBeInTheDocument();
  });

  it("picks a range with the keyboard alone", async () => {
    const user = userEvent.setup();
    renderWithAppState(<CalendarScreen today="2026-04-18" />, {
      state: createAppState(),
    });

    await user.click(screen.getByRole("button", { name: /log a past period/i }));
    // Focus starts on today's cell; walk back two days, pick, back one, pick.
    expect(document.activeElement).toHaveAccessibleName(/april 18, 2026/i);
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Enter}{ArrowRight}{Enter}");

    expect(document.querySelectorAll(".is-logged")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Edit April 16, 2026" })).toHaveClass("is-logged");
  });
});

it("remembers Calendar help after a successful day log, even when undone", async () => {
  const user = userEvent.setup();
  const view = renderWithAppState(<CalendarScreen today="2026-04-18" />, {
    state: createAppState({ settings: { calendarHelpDismissed: false } }),
  });
  expect(screen.getByText(/tap a day to log or change it/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /april 19, 2026 unavailable/i }));
  expect(screen.getByText(/tap a day to log or change it/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /log april 17, 2026/i }));
  expect(screen.queryByText(/tap a day to log or change it/i)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /^undo$/i }));
  expect(screen.queryByText(/tap a day to log or change it/i)).not.toBeInTheDocument();
  view.unmount();
  renderWithAppState(<CalendarScreen today="2026-04-18" />);
  expect(screen.queryByText(/tap a day to log or change it/i)).not.toBeInTheDocument();
});

it("keeps Calendar help until a valid range is completed", async () => {
  const user = userEvent.setup();
  renderWithAppState(<CalendarScreen today="2026-04-18" />, {
    state: createAppState({ settings: { calendarHelpDismissed: false } }),
  });
  await user.click(screen.getByRole("button", { name: /log a past period/i }));
  await user.click(screen.getByRole("button", { name: /april 1, 2026/i }));
  await user.click(screen.getByRole("button", { name: /april 15, 2026/i }));
  expect(loadStoredState().state.settings.calendarHelpDismissed).toBe(false);
  await user.keyboard("{Escape}");
  expect(loadStoredState().state.settings.calendarHelpDismissed).toBe(false);
  await user.click(screen.getByRole("button", { name: /log a past period/i }));
  await user.click(screen.getByRole("button", { name: /april 1, 2026/i }));
  expect(loadStoredState().state.settings.calendarHelpDismissed).toBe(false);
  await user.click(screen.getByRole("button", { name: /april 3, 2026/i }));
  expect(screen.queryByText(/tap a day to log or change it/i)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /^undo$/i }));
  expect(screen.queryByText(/tap a day to log or change it/i)).not.toBeInTheDocument();
});
