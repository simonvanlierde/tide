import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CycleStats, CycleSummary } from "../../src/domain/types";
import { CycleInsights } from "../../src/features/today/CycleInsights";

const SUMMARY: CycleSummary = {
  cycleDay: 5,
  phaseLabel: "follicular",
  fertile: false,
  ovulationDate: "2026-04-14",
  fertileWindow: { start: -5, end: 1 },
  nextPeriod: { date: "2026-04-29", daysUntil: 20 },
  cycleLength: 29,
  periodLength: 4,
  estimateMode: "learned",
};

function renderInsights(
  stats: CycleStats,
  onClose = vi.fn(),
  summary: CycleSummary = SUMMARY,
) {
  render(<CycleInsights summary={summary} stats={stats} onClose={onClose} />);
  return onClose;
}

describe("CycleInsights", () => {
  it("shows the cycle and period lengths from the summary", () => {
    renderInsights({ cyclesTracked: 3, variabilityDays: 1.2 });

    expect(screen.getByText("Cycle length")).toBeInTheDocument();
    expect(screen.getByText("29")).toBeInTheDocument(); // cycleLength
    expect(screen.getByText("Period length")).toBeInTheDocument();
    // No "learn a full cycle" note once at least one cycle is tracked.
    expect(screen.queryByText(/until you’ve logged a full cycle/i)).toBeNull();
  });

  it("notes the fallback until a full cycle is logged", () => {
    renderInsights({ cyclesTracked: 0, variabilityDays: null });

    expect(
      screen.getByText(/until you’ve logged a full cycle/i),
    ).toBeInTheDocument();
  });

  it.each([
    [null, "Not enough data yet"],
    [0.5, "Very regular"],
    [1.5, "Regular"],
    [3, "Somewhat variable"],
    [5, "Variable"],
  ] as const)("labels regularity %s as %s", (variabilityDays, label) => {
    renderInsights({ cyclesTracked: 4, variabilityDays });
    expect(
      screen.getByRole("img", { name: `Cycle regularity: ${label}` }),
    ).toBeInTheDocument();
  });

  it("dismisses when the backdrop (the dialog itself) is clicked", () => {
    const onClose = renderInsights({ cyclesTracked: 2, variabilityDays: 1 });

    // A click landing on the <dialog> element is a backdrop tap.
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps open when a click lands inside the content", () => {
    const onClose = renderInsights({ cyclesTracked: 2, variabilityDays: 1 });

    fireEvent.click(screen.getByRole("heading", { name: /cycle insights/i }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
