import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../../src/data/schema";
import { STORAGE_KEY, saveAppState } from "../../src/data/storage";
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
  it("closes the editor with Escape after focus returns to the forecast", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");
    await user.click(screen.getByRole("button", { name: /^add details$/i }));
    expect(screen.getByRole("button", { name: /^close$/i })).toBeInTheDocument();
    const insights = screen.getByRole("button", { name: /^cycle insights$/i });
    insights.focus();
    expect(insights).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: /^close$/i })).not.toBeInTheDocument();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(screen.getByRole("button", { name: /^add details$/i })).toHaveFocus();
  });

  it("offers Calendar for a past period without logging today", () => {
    renderToday("2026-04-18", createAppState({ periodDays: [] }));
    expect(screen.getByRole("link", { name: "Log a past period" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("button", { name: /^Log bleeding today$/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").intensityByDay).toEqual({});
  });
  it("renders the cycle dial with the core cycle facts", () => {
    renderToday("2026-04-18");

    expect(screen.getByRole("heading", { name: /day 17/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cycle overview/i)).toBeInTheDocument();
    expect(screen.getByText(/^in 12 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/^day 17 · luteal phase$/i)).toBeInTheDocument();
    expect(screen.getByText(/^outside the fertile window$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/how fertility is estimated/i)).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: /cycle insights/i })).toBeInTheDocument();
    // One completed 28-day cycle in the learned fixture.
    expect(screen.getByText("Cycle length")).toBeInTheDocument();
    expect(screen.getByText("How was this worked out?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("draws the predicted next period as an outline, not a fill, on the dial", () => {
    renderToday("2026-04-18");

    // The filled ring carries logged days only; estimates are on the
    // outline layer.
    const ring = document.querySelector(".cycle-dial__ring");
    const outlines = document.querySelector(".cycle-dial__estimates");
    expect(ring?.getAttribute("style")).not.toContain("--estimate-");
    expect(outlines?.getAttribute("style")).toContain("var(--estimate-period)");
    expect(outlines?.getAttribute("style")).toContain("var(--estimate-fertile)");
    // At rest the centre is the estimate, not today's date.
    expect(screen.getByText("Thu, Apr 30")).toBeInTheDocument();
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
    // Back at rest: the estimate again.
    expect(screen.queryByText("Sun, Apr 19")).not.toBeInTheDocument();
    expect(screen.getByText(/^in 12 days$/i)).toBeInTheDocument();
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

    expect(screen.getByText(/· ovulation phase$/i)).toBeInTheDocument();
    expect(screen.getByText(/^in the fertile window$/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    const disclaimer = screen.getByText("An estimate. Don't use it as birth control.");
    expect(disclaimer).not.toBeVisible();
    await user.click(screen.getByLabelText(/how fertility is estimated/i));
    expect(disclaimer).toBeVisible();
    expect(disclaimer.closest(".info-popover")).not.toBeNull();
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
    expect(screen.queryByText(/^(in|outside) the fertile window$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/how fertility is estimated/i)).not.toBeInTheDocument();
  });

  it.each([
    ["Show", true],
    ["Don't show", false],
  ] as const)("keeps fertility optional and saves %s", async (answer, enabled) => {
    const user = userEvent.setup();
    renderToday("2026-04-18", createAppState({ settings: { onboardingDismissed: false } }));
    expect(screen.getByText("Fertility estimates", { selector: "summary" }).closest("details")).not.toHaveAttribute(
      "open",
    );
    await user.click(screen.getByText("Fertility estimates", { selector: "summary" }));
    expect(screen.getByText(/estimates use your period history. don't use them as birth control/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: answer }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").settings.showFertility).toBe(enabled);
    expect(screen.getByRole("region", { name: "Your history stays here" })).toBeInTheDocument();
  });

  it("does not ask about fertility before there is an estimate to show", () => {
    renderToday("2026-04-18", createAppState({ periodDays: [] }));

    expect(screen.queryByRole("region", { name: "Show fertility estimates?" })).not.toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(screen.getByRole("button", { name: /not bleeding/i })).toBeInTheDocument();

    // A fresh one-tap log picks no level; the gauge appears to ask for one.
    for (const level of ["spotting", "light", "medium", "heavy"]) {
      expect(screen.getByRole("radio", { name: new RegExp(level, "i") })).not.toBeChecked();
    }
    await user.click(screen.getByRole("radio", { name: /spotting/i }));
    expect(screen.getByRole("radio", { name: /spotting/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /medium/i })).not.toBeChecked();
  });

  it("keeps first-run copy off Today after introduction was skipped", () => {
    renderToday("2026-04-18", createAppState());
    expect(screen.queryByRole("region", { name: "Your history stays here" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /import/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Show fertility estimates?")).not.toBeInTheDocument();
  });

  it("hides the introduction while a newer build owns the stored data", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, intensityByDay: {} }));
    renderWithAppState(<TodayScreen today="2026-04-18" />);
    expect(screen.queryByRole("region", { name: "Your history stays here" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /import/i })).not.toBeInTheDocument();
  });

  it("prompts for a first log when there is no cycle history at all", () => {
    renderToday("2026-04-18", createAppState({ periodDays: [] }));

    expect(screen.getByRole("heading", { name: /cycle day unknown, learning/i })).toBeInTheDocument();
    // One line in the dial says there is no forecast yet: no "--" numeral, and
    // no next-period or fertility rows that each repeat it.
    expect(document.querySelector(".cycle-dial__prompt")).toHaveTextContent(/^log your period to see a forecast\.$/i);
    expect(screen.queryByText("--")).not.toBeInTheDocument();
    expect(screen.queryByText(/next period/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not enough data/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^outside the fertile window$/i)).not.toBeInTheDocument();
    // No ovulation estimate, so the ring has no sand or amber to explain.
    expect(screen.queryByText(/fertile window/i)).not.toBeInTheDocument();
    // With nothing logged, logging is the one thing to do: keep it prominent.
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toHaveClass("primary-action");
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

    expect(screen.getByText(/using a typical 28-day cycle until tide has seen/i)).toBeInTheDocument();
  });

  it("prompts to log inside the reminder window", () => {
    renderToday("2026-04-28", createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }));

    expect(screen.getByText(/has your period started/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not yet/i })).toBeInTheDocument();
  });

  it("switches to overdue wording once the period is late", () => {
    renderToday("2026-05-01", createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }));

    expect(screen.getByText(/has your period started/i)).toBeInTheDocument();
    // The dial names today as late, never as a second expected date.
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toContain("Period late");
    // The fact row stops claiming a "next" period in the past.
    expect(screen.queryByText(/next period/i)).not.toBeInTheDocument();
    expect(document.querySelector(".cycle-dial__eyebrow")).toHaveTextContent(/^period$/i);
    expect(screen.getByText(/^1 day late$/i)).toBeInTheDocument();
    // Late already says it; the small line keeps only the cycle day.
    expect(screen.getByText(/^day \d+$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Expected /)).toBeInTheDocument();
  });

  it("dismisses the prompt for the day with 'Not yet'", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-28", createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }));

    await user.click(screen.getByRole("button", { name: /not yet/i }));

    expect(screen.queryByText(/has your period started/i)).not.toBeInTheDocument();
    // Dismissing hides the prompt but keeps the log action prominent — a period
    // is still expected, so logging should stay one easy orange tap away.
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toHaveClass("primary-action");
  });

  it("clears the prompt after logging today from it", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-28", createAppState({ periodDays: ["2026-04-02", "2026-04-03"] }));

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));

    expect(screen.queryByText(/has your period started/i)).not.toBeInTheDocument();
    // Removal stays a quiet action inside the dated editor.
    expect(screen.getByRole("button", { name: /not bleeding/i })).toHaveClass("text-action");
    // No flow level is invented by a one-tap log.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").intensityByDay["2026-04-28"]).toBeNull();
    expect(screen.getByRole("heading", { name: "April 28, 2026" })).toBeInTheDocument();
  });

  it("folds a log from an earlier visit into one line that opens the shared dated flow editor", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18", createAppState({ periodDays: ["2026-04-18"] }));

    // Flow and removal wait behind the one line, which offers to change the level.
    const summary = screen.getByRole("button", { name: /logged today · medium.*change/i });
    // It opens once and goes away, so it is a plain button, not a toggle.
    expect(summary).not.toHaveAttribute("aria-expanded");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /not bleeding/i })).not.toBeInTheDocument();

    await user.click(summary);
    expect(screen.getByRole("radio", { name: /medium/i })).toHaveFocus();
    expect(screen.getByRole("button", { name: /not bleeding/i })).toBeInTheDocument();
  });

  it("nudges a plain log from an earlier visit to add its flow", () => {
    renderToday("2026-04-18", { ...createAppState(), intensityByDay: { "2026-04-18": null } });
    expect(screen.getByRole("button", { name: /^logged today.*add flow/i })).toBeInTheDocument();
  });

  it("moves focus to the gauge after a log and back to Log after a remove", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(screen.getByRole("radio", { name: /spotting/i })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: /not bleeding/i }));
    expect(screen.getByRole("button", { name: /^log bleeding$/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toHaveFocus();
  });

  it("moves focus on when the reminder logs or is dismissed", async () => {
    const user = userEvent.setup();
    const state = createAppState({ periodDays: ["2026-04-02", "2026-04-03"] });
    const { unmount } = renderWithAppState(<TodayScreen today="2026-04-28" />, {
      state,
    });

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(screen.getByRole("radio", { name: /spotting/i })).toHaveFocus();
    unmount();

    renderToday("2026-04-28", state);
    await user.click(screen.getByRole("button", { name: /not yet/i }));
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toHaveFocus();
  });

  it("leaves focus alone when another tab logs or removes today", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    // One local log, so a stale "focus next time" flag would be set.
    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    const dial = screen.getByRole("slider", { name: /cycle days/i });
    dial.focus();

    for (const periodDays of [LEARNED_PERIOD_DAYS, [...LEARNED_PERIOD_DAYS, "2026-04-18" as IsoDate]]) {
      saveAppState(createAppState({ periodDays }));
      act(() => {
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
      });
      expect(dial).toHaveFocus();
    }
  });

  it("leaves focus alone on first render", () => {
    renderToday("2026-04-18", createAppState({ periodDays: ["2026-04-18"] }));

    expect(document.body).toHaveFocus();
  });

  it("keeps a calm log action and no prompt outside the window", () => {
    renderToday("2026-04-18");

    expect(screen.queryByText(/has your period started/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log bleeding today/i })).toBeInTheDocument();
  });
});

describe("TodayScreen before the fertility opt-in", () => {
  const OVULATION_WORDS = /ovulation|follicular|luteal|fertile/i;

  // Every day the dial can preview, read the way a screen reader hears it.
  function scrubAllDays() {
    const dial = screen.getByRole("slider", { name: /cycle days/i });
    const readouts = [dial.getAttribute("aria-valuetext") ?? ""];
    for (let i = 0; i < 40; i += 1) {
      fireEvent.keyDown(dial, { key: "ArrowLeft" });
    }
    for (let i = 0; i < 40; i += 1) {
      fireEvent.keyDown(dial, { key: "ArrowRight" });
      readouts.push(
        dial.getAttribute("aria-valuetext") ?? "",
        screen.getByLabelText(/cycle overview/i).textContent ?? "",
      );
    }
    return readouts;
  }

  it.each([
    ["unanswered", null],
    ["off", false],
  ] as const)("shows no ovulation phase on the dial while %s", (_, show) => {
    renderToday(
      "2026-04-18",
      createAppState({
        periodDays: LEARNED_PERIOD_DAYS,
        settings: { showFertility: show },
      }),
    );

    const dial = screen.getByLabelText(/cycle overview/i);
    expect(dial.textContent).not.toMatch(OVULATION_WORDS);
    expect(dial).toHaveTextContent(/between periods/i);
    expect(screen.getByRole("heading", { level: 1 }).textContent).not.toMatch(OVULATION_WORDS);
    expect(document.querySelector(".cycle-dial__estimates")?.getAttribute("style")).not.toMatch(
      /--estimate-(fertile|ovulation)/,
    );
    for (const readout of scrubAllDays()) {
      expect(readout).not.toMatch(OVULATION_WORDS);
    }
  });

  it("keeps ovulation out of the insights sheet while off", async () => {
    const user = userEvent.setup();
    renderToday(
      "2026-04-18",
      createAppState({
        periodDays: LEARNED_PERIOD_DAYS,
        settings: { showFertility: false },
      }),
    );

    await user.click(screen.getByRole("button", { name: /cycle insights/i }));

    expect(screen.getByRole("dialog").textContent).not.toMatch(OVULATION_WORDS);
    // The personal sums say how the date came about, without ovulation.
    expect(await screen.findByText(/your last period started/i)).toBeInTheDocument();
  });

  it("keeps the ovulation phases on the dial once fertility is on", () => {
    renderToday("2026-04-18");

    expect(screen.getByLabelText(/cycle overview/i)).toHaveTextContent(/luteal phase/i);
    expect(scrubAllDays().join(" ")).toMatch(/Ovulation expected/);
  });
});

it("shows a skippable first-run introduction without a forecast or fertility consent", async () => {
  const user = userEvent.setup();
  const first = renderWithAppState(<TodayScreen today="2026-04-18" />, {
    state: createAppState({ settings: { onboardingDismissed: false, showFertility: null } }),
  });
  const introduction = screen.getByRole("region", { name: "Your history stays here" });
  expect(introduction).toHaveTextContent("Tide does not upload what you log.");
  expect(introduction).toHaveTextContent("Download a backup every 60 days.");
  expect(screen.getByRole("link", { name: /import history from tide, clue or flo/i })).toHaveAttribute(
    "href",
    "/settings#import",
  );
  expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Skip introduction" }));
  expect(introduction).not.toBeInTheDocument();
  const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  expect(saved.settings.onboardingDismissed).toBe(true);
  expect(saved.settings.showFertility).toBeNull();
  first.unmount();
  renderWithAppState(<TodayScreen today="2026-04-18" />);
  expect(screen.queryByRole("region", { name: "Your history stays here" })).not.toBeInTheDocument();
});

it("finishes the introduction on a first log without restoring it on removal", async () => {
  const user = userEvent.setup();
  renderToday("2026-04-18", createAppState({ settings: { onboardingDismissed: false } }));
  await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
  expect(screen.queryByRole("region", { name: "Your history stays here" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /not bleeding/i }));
  expect(screen.queryByRole("region", { name: "Your history stays here" })).not.toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").settings.showFertility).toBeNull();
});

it("keeps introduction open when the period reminder is answered Not yet", async () => {
  const user = userEvent.setup();
  renderToday(
    "2026-04-28",
    createAppState({ periodDays: ["2026-04-02", "2026-04-03"], settings: { onboardingDismissed: false } }),
  );
  await user.click(screen.getByRole("button", { name: /not yet/i }));
  expect(screen.getByRole("region", { name: "Your history stays here" })).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").settings.onboardingDismissed).toBe(false);
});
