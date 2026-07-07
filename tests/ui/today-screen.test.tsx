import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { IsoDate } from "../../src/domain/types";
import { dayAngleDeg } from "../../src/features/today/dialGeometry";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import {
  createAppState,
  createLearnedCycleState,
  createLearningCycleState,
  LEARNED_PERIOD_DAYS,
  renderWithAppState,
} from "../support/app";

function renderToday(today: IsoDate, state = createLearnedCycleState()) {
  renderWithAppState(<TodayScreen today={today} />, { state });
}

describe("TodayScreen", () => {
  it("renders the cycle dial with the core cycle facts", () => {
    renderToday("2026-04-18");

    expect(
      screen.getByRole("heading", { name: /day 17/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/cycle overview/i)).toBeInTheDocument();
    expect(screen.getByText(/^in 12 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/^luteal phase$/i)).toBeInTheDocument();
    expect(screen.getByText(/lower today/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/how fertility is estimated/i),
    ).toBeInTheDocument();
  });

  it("shows the ovulation estimate in the fertility fact", () => {
    renderToday("2026-04-18");

    expect(screen.getByText(/ovulation 2 days ago/i)).toBeInTheDocument();
  });

  it("opens the cycle insights dialog with the stats behind the estimate", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    // Closed by default: not mounted until the trigger is used.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cycle insights/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /cycle insights/i }),
    ).toBeInTheDocument();
    // One completed 28-day cycle in the learned fixture.
    expect(screen.getByText("Cycle length")).toBeInTheDocument();
    expect(screen.getByText("How predictions work")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("draws the predicted next period as a coral fill on the dial", () => {
    renderToday("2026-04-18");

    const ring = document.querySelector(".cycle-dial__ring");
    expect(ring?.getAttribute("style")).toContain("var(--cycle-period)");
    expect(screen.getByText("Sat, Apr 18")).toBeInTheDocument(); // today
  });

  it("previews other cycle days with the keyboard", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    const dial = screen.getByRole("slider", { name: /cycle days/i });
    expect(dial).toHaveAttribute("aria-valuenow", "17");

    dial.focus();
    await user.keyboard("{ArrowRight}");

    expect(dial).toHaveAttribute("aria-valuenow", "18");
    expect(dial.getAttribute("aria-valuetext")).toContain("Sun, Apr 19");
    expect(dial.getAttribute("aria-valuetext")).toContain("Luteal");
    expect(screen.getByText("Sun, Apr 19")).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(dial).toHaveAttribute("aria-valuenow", "17");
    await user.keyboard("{ArrowUp}{ArrowDown}");
    expect(dial).toHaveAttribute("aria-valuenow", "17");

    await user.keyboard("{Escape}");
    expect(dial).toHaveAttribute("aria-valuenow", "17");
    expect(screen.getByText("Sat, Apr 18")).toBeInTheDocument();
  });

  it("scrubs the dial with a pointer and resets on release", () => {
    renderToday("2026-04-18");

    const dial = screen.getByRole("slider", { name: /cycle days/i });
    dial.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 280,
        height: 280,
        right: 280,
        bottom: 280,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    dial.setPointerCapture = () => {};

    // The learned cycle spans 28 cycle days plus the compact 1.5-day predicted
    // nub. Points are derived from the dial geometry so they track gap/start
    // tuning.
    const totalCells = 29.5;
    const ringPoint = (index: number) => {
      const a = (dayAngleDeg(index, totalCells) * Math.PI) / 180;
      return {
        clientX: 140 + Math.sin(a) * 120,
        clientY: 140 - Math.cos(a) * 120,
      };
    };

    // Press on day 8.
    fireEvent.pointerDown(dial, { pointerId: 1, buttons: 1, ...ringPoint(7) });
    expect(dial).toHaveAttribute("aria-valuenow", "8");

    // Drag to the expected ovulation day (day 15).
    fireEvent.pointerMove(dial, { pointerId: 1, buttons: 1, ...ringPoint(14) });
    expect(dial).toHaveAttribute("aria-valuenow", "15");
    expect(dial.getAttribute("aria-valuetext")).toContain("Ovulation expected");

    fireEvent.pointerUp(dial, { pointerId: 1 });
    expect(dial).toHaveAttribute("aria-valuenow", "17");
  });

  it("caps scrubbing the predicted nub at the whole first expected day", () => {
    renderToday("2026-04-18");

    const dial = screen.getByRole("slider", { name: /cycle days/i });
    dial.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 280,
        height: 280,
        right: 280,
        bottom: 280,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    dial.setPointerCapture = () => {};

    // 28 cycle days + a 1.5-day nub: the ring ends fractionally, but dragging to
    // the very end must land on the whole first expected day (29), not 29.5.
    const totalCells = 29.5;
    const endAngle = (dayAngleDeg(29, totalCells) * Math.PI) / 180;
    fireEvent.pointerDown(dial, {
      pointerId: 1,
      buttons: 1,
      clientX: 140 + Math.sin(endAngle) * 120,
      clientY: 140 - Math.cos(endAngle) * 120,
    });

    expect(dial).toHaveAttribute("aria-valuenow", "29");
    expect(dial.getAttribute("aria-valuetext")).toContain("Period expected");
  });

  it("words the ovulation estimate for the day itself", () => {
    renderToday("2026-04-16");
    expect(screen.getByText(/ovulation today/i)).toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderToday("2026-04-15");

    expect(screen.getByText(/^ovulation phase$/i)).toBeInTheDocument();
    expect(screen.getByText(/higher today/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(screen.getByLabelText(/how fertility is estimated/i));

    expect(
      screen.getByText(/informational, not a birth control method/i),
    ).toBeInTheDocument();
  });

  it("hides the fertility fact when fertility estimates are turned off", () => {
    renderToday(
      "2026-04-18",
      createAppState({
        periodDays: LEARNED_PERIOD_DAYS,
        settings: { showFertility: false },
      }),
    );

    expect(screen.queryByText("Fertility")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/higher today|lower today/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/how fertility is estimated/i),
    ).not.toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toBeInTheDocument();

    // A fresh one-tap log defaults to Medium, and the tide gauge appears to
    // refine it — picking Spotting selects that level.
    expect(screen.getByRole("radio", { name: /medium/i })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /spotting/i }));
    expect(screen.getByRole("radio", { name: /spotting/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /medium/i })).not.toBeChecked();
  });

  it("prompts for a first log when there is no cycle history at all", () => {
    renderToday("2026-04-18", createAppState({ periodDays: [] }));

    expect(
      screen.getByRole("heading", { name: /cycle day unknown, learning/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^learning$/i)).toBeInTheDocument();
    expect(screen.getByText(/^not enough data yet$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/log bleeding to start an estimate/i),
    ).toBeInTheDocument();
  });

  it("says the period is expected today when it lands on today", () => {
    renderToday("2026-05-17", createLearningCycleState());

    expect(screen.getByText(/^expected today$/i)).toBeInTheDocument();
  });

  it("resets the preview when the pointer leaves, cancels, or the dial blurs", () => {
    renderToday("2026-04-18");

    const dial = screen.getByRole("slider", { name: /cycle days/i });

    for (const reset of ["pointerLeave", "pointerCancel", "blur"] as const) {
      fireEvent.keyDown(dial, { key: "ArrowRight" });
      expect(dial).toHaveAttribute("aria-valuenow", "18");

      fireEvent[reset](dial);
      expect(dial).toHaveAttribute("aria-valuenow", "17");
    }
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderToday("2026-04-21", createLearningCycleState());

    expect(
      screen.getByText(/using a typical 28-day cycle until we learn/i),
    ).toBeInTheDocument();
  });

  it("prompts to log inside the reminder window", () => {
    renderToday(
      "2026-04-28",
      createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    );

    expect(screen.getByText(/your period is expected/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log bleeding today/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /not yet/i }),
    ).toBeInTheDocument();
  });

  it("switches to overdue wording once the period is late", () => {
    renderToday(
      "2026-05-01",
      createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    );

    expect(screen.getByText(/your period was expected/i)).toBeInTheDocument();
  });

  it("dismisses the prompt for the day with 'Not yet'", async () => {
    const user = userEvent.setup();
    renderToday(
      "2026-04-28",
      createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    );

    await user.click(screen.getByRole("button", { name: /not yet/i }));

    expect(
      screen.queryByText(/your period is expected/i),
    ).not.toBeInTheDocument();
    // Dismissing hides the prompt but keeps the log action prominent — a period
    // is still expected, so logging should stay one easy orange tap away.
    expect(
      screen.getByRole("button", { name: /log bleeding today/i }),
    ).toHaveClass("primary-action");
  });

  it("clears the prompt after logging today from it", async () => {
    const user = userEvent.setup();
    renderToday(
      "2026-04-28",
      createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }),
    );

    await user.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );

    expect(
      screen.queryByText(/your period is expected/i),
    ).not.toBeInTheDocument();
    // Undoing a log is a calm secondary action, not a loud orange CTA.
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toHaveClass("secondary-action");
  });

  it("keeps a calm log action and no prompt outside the window", () => {
    renderToday("2026-04-18");

    expect(
      screen.queryByText(/your period is expected/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/your period was expected/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log bleeding today/i }),
    ).toBeInTheDocument();
  });
});
