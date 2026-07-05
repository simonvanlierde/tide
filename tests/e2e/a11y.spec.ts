import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/history", "/settings"];

// Seed a fresh cycle relative to the real "today" so every screen renders real
// content — a dial with a day, and a calendar with logged and predicted days.
function seedScript() {
  const today = new Date();
  const days: string[] = [];
  for (let offset = 4; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }
  return {
    periodDays: days,
    settings: { reminderWindowDays: 4, snoozedUntil: null, theme: "system" },
  };
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility (${colorScheme})`, () => {
    test.use({ colorScheme });

    for (const path of ROUTES) {
      test(`${path} has no serious accessibility violations`, async ({
        page,
      }) => {
        await page.addInitScript((state) => {
          localStorage.setItem(
            "tide.period-tracker.state",
            JSON.stringify(state),
          );
        }, seedScript());

        await page.goto(path);
        await expect(
          page.getByRole("navigation", { name: /primary navigation/i }),
        ).toBeVisible();

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();

        const serious = violations.filter(
          (violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        );

        expect(
          serious,
          serious.map((v) => `${v.id}: ${v.help}`).join("\n"),
        ).toEqual([]);
      });
    }
  });
}
