import type { ThemePreference } from "../../domain/types";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
export const INFORMATION_COPY = {
  logging: "Log a day when you had menstrual bleeding on that date.",
  fertility: "Estimates are informational only and not birth control.",
  privacy: "Everything stays on this device.",
} as const;

// Helper copy that lives behind an info popover next to its control.
export const SETTINGS_HELP = {
  fertility:
    "Shows fertile-window and ovulation estimates on the home screen and calendar.",
  periodDayNumbers:
    "Numbers each logged bleeding day within its period day (1, 2, 3, ...) on the calendar.",
  data: "Export saves your days to a file. Import replaces them from a backup.",
} as const;

export const REPOSITORY_URL = "https://github.com/simonvanlierde/tide";
