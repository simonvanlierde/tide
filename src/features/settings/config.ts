import type { HomeDisplayMode } from "../../domain/types";

export const HOME_DISPLAY_MODE_OPTIONS: Array<{
  value: HomeDisplayMode;
  label: string;
}> = [
  { value: "summary", label: "Summary" },
  { value: "linear", label: "Linear" },
  { value: "circular", label: "Circular" },
];

export const REMINDER_WINDOW_OPTIONS = [1, 3, 5] as const;
export const SNOOZE_OPTIONS = [1, 3, 5] as const;
export const REMINDER_STATUS_TIMEOUT_MS = 3500;

export const INFORMATION_COPY = {
  logging: "Log a day only when you had menstrual bleeding on that date.",
  fertility: "Estimates are informational only and not birth control.",
  privacy: "Everything stays on this device unless you export a backup.",
} as const;
