import type { ThemePreference } from "../../domain/types";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
/** How long any transient confirmation notice stays on screen, app-wide. */
export const NOTICE_TIMEOUT_MS = 5000;

export const INFORMATION_COPY = {
  logging: "Log a day when you had menstrual bleeding on that date.",
  fertility: "Estimates are informational only and not birth control.",
  privacy: "Everything stays on this device.",
} as const;
