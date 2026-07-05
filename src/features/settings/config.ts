export const REMINDER_WINDOW_OPTIONS = [2, 4, 6] as const;
export const SNOOZE_OPTIONS = [1, 3, 5] as const;
/** How long any transient confirmation notice stays on screen, app-wide. */
export const NOTICE_TIMEOUT_MS = 5000;

export const INFORMATION_COPY = {
  logging: "Log a day only when you had menstrual bleeding on that date.",
  fertility: "Estimates are informational only and not birth control.",
  privacy: "Everything stays on this device.",
} as const;
