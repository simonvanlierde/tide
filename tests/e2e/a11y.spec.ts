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

    test("Calendar exposes cycle counts beside diary-only days", async ({ page }) => {
      await seedAppState(page, "en", {}, { "2026-04-14": "medium" });
      await page.goto("/calendar");
      await page.getByRole("button", { name: /^Add details for / }).click();
      await page.getByRole("textbox", { name: "Note (optional)", exact: true }).fill("A quiet day.");
      await expect(page.getByRole("button", { name: /^Edit April 15, 2026, Cycle day 2$/ })).toBeVisible();
      await expectNoViolations(page);
      const cycleCount = page.locator(".calendar-grid__day.is-today + .calendar-grid__period-day");
      await cycleCount.scrollIntoViewIfNeeded();
      const badge = await cycleCount.boundingBox();
      expect(badge).not.toBeNull();
      if (!badge) throw new Error("Missing visible cycle count");
      await page.mouse.click(badge.x + badge.width / 2, badge.y + badge.height / 2);
      await expect(page.getByRole("textbox", { name: "Note (optional)", exact: true })).toHaveCount(0);
    });

    test("cycle insights with its sums has no WCAG A or AA or best-practice violations", async ({ page }) => {
      await seedAppState(page);
      await page.goto("/");
      await page.getByRole("button", { name: "Cycle insights" }).click();
      await expect(page.getByRole("region", { name: "How was this worked out?" })).toBeVisible();
      await page.getByRole("dialog").evaluate(async (dialog) => {
        await Promise.all(dialog.getAnimations({ subtree: true }).map((animation) => animation.finished));
      });

      await expectNoViolations(page);
    });

    for (const path of ROUTES) {
      test(`${path} has no WCAG A or AA or best-practice violations`, async ({ page }) => {
        await seedAppState(page);

        await page.goto(path);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("navigation", { name: /primary navigation/i })).toBeVisible();
        // The legal pages' text arrives in its own chunk, after main.
        await expect(page.getByRole("heading", { level: 1 })).toBeAttached();

        await openOverlays(page, path);

        await expectNoViolations(page);
      });
    }
  });
}
