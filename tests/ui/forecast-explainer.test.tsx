import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import {
  createAppState,
  createLearnedCycleState,
  LEARNED_PERIOD_DAYS,
  LEARNING_PERIOD_DAYS,
  renderWithAppState,
} from "../support/app";

async function openExplainer(state = createLearnedCycleState()) {
  const user = userEvent.setup();
  renderWithAppState(<TodayScreen today="2026-04-21" />, { state });
  await user.click(
    screen.getByRole("button", { name: /how was this worked out/i }),
  );
  return within(await screen.findByRole("dialog"));
}

describe("ForecastExplainer", () => {
  it("shows the cycle lengths, the median and the sum behind the date", async () => {
    const dialog = await openExplainer();

    // One completed cycle, 03-05 to 04-02.
    expect(dialog.getByText(/oldest first: 28 days/i)).toBeInTheDocument();
    expect(dialog.getByText(/median.*is 28 days/i)).toBeInTheDocument();
    expect(
      dialog.getByText(
        /started Thu, Apr 2\. Adding 28 days gives Thu, Apr 30/i,
      ),
    ).toBeInTheDocument();
    expect(dialog.getByText(/at least two full cycles/i)).toBeInTheDocument();
  });

  it("explains ovulation and the fertile window, next to the birth-control note", async () => {
    const dialog = await openExplainer();

    expect(
      dialog.getByText(/14 days before that: Thu, Apr 16/i),
    ).toBeInTheDocument();
    expect(
      dialog.getByText(
        /5 days before to 1 after it: Sat, Apr 11 to Fri, Apr 17/i,
      ),
    ).toHaveTextContent(/not birth control/i);
  });

  it("says nothing about fertility while estimates are off", async () => {
    const dialog = await openExplainer(
      createAppState({
        periodDays: LEARNED_PERIOD_DAYS,
        settings: { showFertility: false },
      }),
    );

    expect(dialog.queryByText(/ovulation/i)).not.toBeInTheDocument();
    expect(dialog.queryByText(/fertile/i)).not.toBeInTheDocument();
  });

  it("names the 28-day default before a full cycle", async () => {
    const dialog = await openExplainer(
      createAppState({
        periodDays: LEARNING_PERIOD_DAYS,
        settings: { showFertility: true },
      }),
    );

    expect(dialog.getByText(/typical 28-day cycle/i)).toBeInTheDocument();
    expect(dialog.queryByText(/median/i)).not.toBeInTheDocument();
  });

  it("is not offered before anything is logged", () => {
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: createAppState(),
    });

    expect(
      screen.queryByRole("button", { name: /how was this worked out/i }),
    ).not.toBeInTheDocument();
  });
});
