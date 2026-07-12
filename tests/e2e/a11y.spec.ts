import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { seedAppState } from "./seed";

const ROUTES = ["/", "/calendar", "/settings"];

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
  } else if (path === "/calendar") {
    // A logged day opens the flow picker; an empty day one-tap logs instead.
    await page.locator(".calendar-grid__day.is-logged").first().click();
    await expect(page.getByRole("button", { name: /^close$/i })).toBeVisible();
  }
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility (${colorScheme})`, () => {
    test.use({ colorScheme });

    for (const path of ROUTES) {
      test(`${path} has no serious accessibility violations`, async ({
        page,
      }) => {
        await seedAppState(page);

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
