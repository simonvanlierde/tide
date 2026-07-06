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

export const FLOW_LABELS: Record<FlowIntensity, string> = {
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

// Days that count toward cycle-start detection, day numbering and predictions.
// Spotting is recorded and shown, but excluded here — it is often not the true
// period start. Both the cycle summary and the history calendar derive from this
// single filter so they can never number the same period differently.
export function getPredictionDays(
  periodDays: IsoDate[],
  intensityByDay: Record<IsoDate, FlowIntensity>,
): IsoDate[] {
  return periodDays.filter((day) => intensityByDay[day] !== "spotting");
}
