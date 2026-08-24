import type { Page } from "@playwright/test";

// Every e2e run sees the same "today", so logged/predicted day counts never
// shift with the calendar date CI happens to run on.
export const FIXED_NOW = new Date("2026-04-15T12:00:00Z");
export const FIXED_TODAY = "2026-04-15";

// A fresh cycle ending today, so every screen renders real content — a dial
// with a day, and a calendar with logged and predicted days.
const SEED_STATE = {
  intensityByDay: Object.fromEntries(
    ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", FIXED_TODAY].map(
      (day) => [day, "medium"],
    ),
  ),
  settings: { dismissedOn: null, theme: "system" },
};

export async function seedAppState(page: Page) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript((state) => {
    localStorage.setItem("tide.period-tracker.state", JSON.stringify(state));
  }, SEED_STATE);
}
