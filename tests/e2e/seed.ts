import type { Page } from "@playwright/test";

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Seed a fresh cycle relative to the real "today" so every screen renders real
// content — a dial with a day, and a calendar with logged and predicted days.
function seedState() {
  const today = new Date();
  const intensityByDay: Record<string, string> = {};

  for (let offset = 4; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    intensityByDay[toIsoDate(day)] = "medium";
  }

  return { intensityByDay, settings: { dismissedOn: null, theme: "system" } };
}

export function seedAppState(page: Page) {
  return page.addInitScript((state) => {
    localStorage.setItem("tide.period-tracker.state", JSON.stringify(state));
  }, seedState());
}
