import type { ThemePreference } from "../../domain/types";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
export const INFORMATION_COPY = {
  privacy: "Your data never leaves this device.",
  fertility:
    "Fertility estimates are informational, not a birth control method.",
  fertilityMethod:
    "Higher around your predicted ovulation. Estimated from your recent cycle lengths.",
} as const;

// Helper copy that lives behind an info popover next to its control.
export const SETTINGS_HELP = {
  fertility:
    "Shows fertile-window and ovulation estimates on the home screen and calendar.",
  cycleDayNumbers:
    "Numbers the days of your current cycle (1, 2, 3, ...) on the calendar, up to your next expected period.",
  data: "Export saves your days to a file. Import replaces them from a backup.",
} as const;

export const REPOSITORY_URL = "https://github.com/simonvanlierde/tide";
