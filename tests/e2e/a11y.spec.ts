import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const ROUTES = ["/", "/history", "/settings"];

// Open any overlay a route hides behind an interaction, so axe scans it too —
// the info popover on Today and the flow picker on the calendar. Static routes
// have nothing to open.
async function openOverlays(page: Page, path: string) {
  if (path === "/") {
    const triggers = page.locator(".info-popover__trigger");
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
    // Independent <details> toggles — open them together.
    await Promise.all(
      Array.from({ length: count }, (_, i) => triggers.nth(i).click()),
    );
  } else if (path === "/history") {
    // A logged day opens the flow picker; an empty day one-tap logs instead.
    await page.locator(".calendar-grid__day.is-logged").first().click();
    await expect(page.getByRole("button", { name: /^close$/i })).toBeVisible();
  }
}

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
    settings: { dismissedOn: null, theme: "system" },
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

        await openOverlays(page, path);

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();

        const impactful = violations.filter((violation) =>
          ["moderate", "serious", "critical"].includes(violation.impact ?? ""),
        );

        expect(
          impactful,
          impactful.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n"),
        ).toEqual([]);
      });
    }
  });
}
