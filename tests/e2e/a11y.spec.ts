import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { ROUTES } from "./routes";
import { seedAppState } from "./seed";

// WCAG 2.0, 2.1 and 2.2 at levels A and AA, plus axe's best-practice rules (landmarks,
// one h1). Any violation fails, whatever its impact.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

// Open any overlay a route hides behind an interaction, so axe scans it too —
// the info popover on Today and the flow picker on the calendar. Static routes
// have nothing to open.
async function openOverlays(page: Page, path: string) {
  if (path === "/") {
    const triggers = page.locator(".info-popover__trigger");
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
    // Independent <details> toggles — open them together.
    await Promise.all(Array.from({ length: count }, (_, i) => triggers.nth(i).click()));
  } else if (path === "/calendar") {
    // A logged day opens the flow picker; an empty day one-tap logs instead.
    await page.locator(".calendar-grid__day.is-logged").first().click();
    await expect(page.getByRole("button", { name: /^close$/i })).toBeVisible();
  }
}

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  // One line per violation, then the selector of each element it hit. The
  // comparison is on the rule ids alone, so the diff stays short.
  const report = violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `  ${n.target.join(" ")}`).join("\n")}`)
    .join("\n");
  expect(
    violations.map((v) => v.id),
    report,
  ).toEqual([]);
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility (${colorScheme})`, () => {
    test.use({ colorScheme });

    test("the forecast explainer has no WCAG A or AA or best-practice violations", async ({ page }) => {
      await seedAppState(page);
      await page.goto("/");
      await page.locator(".fact-list__more").nth(1).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await expectNoViolations(page);
    });

    for (const path of ROUTES) {
      test(`${path} has no WCAG A or AA or best-practice violations`, async ({ page }) => {
        await seedAppState(page);

        await page.goto(path);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("navigation", { name: /primary navigation/i })).toBeVisible();

        await openOverlays(page, path);

        await expectNoViolations(page);
      });
    }
  });
}
