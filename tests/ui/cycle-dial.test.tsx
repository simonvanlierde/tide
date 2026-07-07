import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CycleSummary, IsoDate } from "../../src/domain/types";
import { CycleDial } from "../../src/features/today/CycleDial";

function renderDial(summary: CycleSummary, today: IsoDate) {
  render(
    <CycleDial
      summary={summary}
      phaseLabel="Luteal phase"
      periodDays={[]}
      intensityByDay={{}}
      today={today}
      showFertility
    />,
  );
  return screen.getByRole("slider");
}

describe("CycleDial expected-period nub", () => {
  it("extends the ring with a nub for an upcoming period", () => {
    // Consistent 28-day cycle at day 10: started 2026-04-09, next on 2026-05-07.
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-23",
      nextPeriod: { date: "2026-05-07", daysUntil: 19 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const slider = renderDial(summary, "2026-04-18");

    // The nub pushes the scrubbable max past the 28-day ring.
    expect(Number(slider.getAttribute("aria-valuemax"))).toBeGreaterThan(28);
    // Arrowing to the end lands on the expected period.
    for (let i = 0; i < 40; i += 1) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    }
    expect(slider.getAttribute("aria-valuetext")).toMatch(/Period expected/);
  });

  it("adds no future nub once the period is overdue", () => {
    // Predicted period (2026-04-10) has passed with no log, so today is day 37.
    const summary: CycleSummary = {
      cycleDay: 37,
      phaseLabel: "luteal",
      fertile: false,
      ovulationDate: "2026-03-27",
      nextPeriod: { date: "2026-04-10", daysUntil: -8 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const slider = renderDial(summary, "2026-04-18");

    // No nub: the scrubbable max is exactly today's cycle day, a whole number.
    expect(slider).toHaveAttribute("aria-valuemax", "37");
    // Arrowing forward can't move onto a phantom future day past today.
    for (let i = 0; i < 20; i += 1) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    }
    expect(slider).toHaveAttribute("aria-valuenow", "37");
  });
});
