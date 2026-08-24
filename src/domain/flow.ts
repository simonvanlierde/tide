import type { FlowIntensity, IsoDate, LoggedFlow } from "./types";

// Ordered lightest → heaviest; drives the tide gauge and fill ramps.
export const FLOW_INTENSITIES: FlowIntensity[] = [
  "spotting",
  "light",
  "medium",
  "heavy",
];

// The logged period days, sorted. A key in intensityByDay IS a logged day —
// its value is the chosen flow, or null for a plain one-tap log — so its keys
// are the single source of truth.
export function getPeriodDays(
  intensityByDay: Record<IsoDate, LoggedFlow>,
): IsoDate[] {
  return (Object.keys(intensityByDay) as IsoDate[]).sort();
}

// Days that count toward cycle-start detection, day numbering and predictions.
// Spotting is recorded and shown, but excluded here — it is often not the true
// period start. A one-tap log (null) counts: it means "my period", and users
// refine down to spotting explicitly, so a careless tap never under-reports.
// Both the cycle summary and the calendar derive from this single filter so
// they can never number the same period differently.
export function getPredictionDays(
  intensityByDay: Record<IsoDate, LoggedFlow>,
): IsoDate[] {
  return getPeriodDays(intensityByDay).filter(
    (day) => intensityByDay[day] !== "spotting",
  );
}
