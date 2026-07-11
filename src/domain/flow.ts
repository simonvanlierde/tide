import type { FlowIntensity, IsoDate } from "./types";

// Ordered lightest → heaviest; drives the tide gauge and fill ramps.
export const FLOW_INTENSITIES: FlowIntensity[] = [
  "spotting",
  "light",
  "medium",
  "heavy",
];

// A one-tap log means "my period" — a real bleeding day, not spotting. Users
// refine down to spotting explicitly, so a careless tap never under-reports.
export const DEFAULT_FLOW: FlowIntensity = "medium";

// The logged period days, sorted. A key in intensityByDay IS a logged day
// (every logged day carries a flow), so its keys are the single source of truth.
export function getPeriodDays(
  intensityByDay: Record<IsoDate, FlowIntensity>,
): IsoDate[] {
  return (Object.keys(intensityByDay) as IsoDate[]).sort();
}

// Days that count toward cycle-start detection, day numbering and predictions.
// Spotting is recorded and shown, but excluded here — it is often not the true
// period start. Both the cycle summary and the calendar derive from this
// single filter so they can never number the same period differently.
export function getPredictionDays(
  intensityByDay: Record<IsoDate, FlowIntensity>,
): IsoDate[] {
  return getPeriodDays(intensityByDay).filter(
    (day) => intensityByDay[day] !== "spotting",
  );
}
