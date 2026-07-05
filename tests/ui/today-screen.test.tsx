import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { IsoDate } from "../../src/domain/types";
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
    expect(screen.getByText(/lower chance today/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/show fertility disclaimer/i),
    ).toBeInTheDocument();
  });

  it("shows the ovulation estimate in the fertility fact", () => {
    renderToday("2026-04-18");

    expect(
      screen.getByText(/ovulation 2 days ago · thu, apr 16/i),
    ).toBeInTheDocument();
  });

  it("shows key cycle dates on the dial with explanatory labels", () => {
    renderToday("2026-04-18");

    expect(screen.getByTitle("Previous period start")).toHaveTextContent(
      "Apr 2",
    );
    expect(screen.getByTitle("Next period expected")).toHaveTextContent(
      "Apr 30",
    );
    expect(screen.getByTitle("Fertile window starts")).toHaveTextContent(
      "Apr 11",
    );
    expect(screen.getByTitle("Ovulation expected")).toHaveTextContent("Apr 16");
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

    // 3 o'clock on a 28-day dial is day 8.
    fireEvent.pointerDown(dial, {
      pointerId: 1,
      buttons: 1,
      clientX: 280,
      clientY: 140,
    });
    expect(dial).toHaveAttribute("aria-valuenow", "8");

    // Dragging to 6 o'clock lands on day 15, the expected ovulation day.
    fireEvent.pointerMove(dial, {
      pointerId: 1,
      buttons: 1,
      clientX: 140,
      clientY: 280,
    });
    expect(dial).toHaveAttribute("aria-valuenow", "15");
    expect(dial.getAttribute("aria-valuetext")).toContain("Ovulation expected");

    fireEvent.pointerUp(dial, { pointerId: 1 });
    expect(dial).toHaveAttribute("aria-valuenow", "17");
  });

  it("explains a key date label in the center while pressed", () => {
    renderToday("2026-04-18");

    const dial = screen.getByRole("slider", { name: /cycle days/i });
    const nextPeriodLabel = screen.getByTitle("Next period expected");

    fireEvent.pointerDown(nextPeriodLabel, { pointerId: 1, buttons: 1 });
    expect(screen.getByText("Period expected")).toBeInTheDocument();
    expect(dial.getAttribute("aria-valuetext")).toBe(
      "Next period expected, Thu, Apr 30",
    );

    fireEvent.pointerUp(nextPeriodLabel, { pointerId: 1 });
    expect(dial).toHaveAttribute("aria-valuenow", "17");

    // The ovulation label previews the ovulation day itself.
    fireEvent.pointerDown(screen.getByTitle("Ovulation expected"), {
      pointerId: 1,
      buttons: 1,
    });
    expect(dial).toHaveAttribute("aria-valuenow", "15");
    expect(dial.getAttribute("aria-valuetext")).toContain("Ovulation expected");
  });

  it("words the ovulation estimate for the day itself", () => {
    renderToday("2026-04-16");
    expect(screen.getByText(/ovulation expected today/i)).toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderToday("2026-04-15");

    expect(screen.getByText(/^ovulation phase$/i)).toBeInTheDocument();
    expect(screen.getByText(/higher chance today/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(screen.getByLabelText(/show fertility disclaimer/i));

    expect(
      screen.getByText(/informational only and not birth control/i),
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
    expect(screen.queryByText(/chance today/i)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/show fertility disclaimer/i),
    ).not.toBeInTheDocument();
    // ...and the fertile/ovulation markers vanish from the central dial too.
    expect(
      screen.queryByTitle("Fertile window starts"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle("Ovulation expected")).not.toBeInTheDocument();
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
    expect(screen.getByText(/bleeding logged for today/i)).toBeInTheDocument();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderToday("2026-04-21", createLearningCycleState());

    expect(screen.getByText(/learning from recent logs/i)).toBeInTheDocument();
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
