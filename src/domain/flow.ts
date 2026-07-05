import type { FlowIntensity } from "./types";

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
