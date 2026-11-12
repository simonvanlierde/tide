import type { Page } from "@playwright/test";
import { defaultAppState, SCHEMA_VERSION } from "../../src/data/schema";

// Every e2e run sees the same "today", so logged/predicted day counts never
// shift with the calendar date CI happens to run on.
export const FIXED_NOW = new Date("2026-04-15T12:00:00Z");
const FIXED_TODAY = "2026-04-15";

// A fresh cycle ending today, so every screen renders real content — a dial
// with a day, and a calendar with logged and predicted days.
const SEED_STATE = {
  schemaVersion: SCHEMA_VERSION,
  ...defaultAppState,
  intensityByDay: Object.fromEntries(
    ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", FIXED_TODAY].map((day) => [day, "medium"]),
  ),
  // A user who said yes to fertility estimates, so every estimate shows.
  settings: {
    ...defaultAppState.settings,
    showFertility: true,
    onboardingDismissed: true,
    calendarHelpDismissed: true,
  },
};

export async function seedAppState(
  page: Page,
  language = "system",
  settings: Record<string, unknown> = {},
  intensityByDay: Record<string, string> = SEED_STATE.intensityByDay,
) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(
    (state) => {
      localStorage.setItem("tide.period-tracker.state", JSON.stringify(state));
    },
    {
      ...SEED_STATE,
      intensityByDay,
      settings: { ...SEED_STATE.settings, language, ...settings },
    },
  );
}
