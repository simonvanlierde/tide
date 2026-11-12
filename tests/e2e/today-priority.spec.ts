import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { seedAppState } from "./seed";

test("the insights card draws no divider above its first row", async ({ page }) => {
  await seedAppState(page, "en", { showFertility: false });
  await page.goto("/");
  const first = page.locator(".fact-list > :first-child");
  await expect(first).toHaveText("Cycle insights");
  await expect(first).toHaveCSS("border-top-width", "0px");
});

for (const language of SUPPORTED_LANGUAGES) {
  for (const [name, days] of [
    ["first log", []],
    ["upcoming", ["2026-02-09", "2026-03-09", "2026-04-06"]],
    ["expected soon", ["2026-02-20", "2026-03-20"]],
    ["overdue", ["2026-02-16", "2026-03-16"]],
  ] as const) {
    test(`${language}: ${name} keeps logging under the dial and above the tabs`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await seedAppState(
        page,
        language,
        { showFertility: false },
        Object.fromEntries(days.map((day) => [day, "medium"])),
      );
      await page.goto("/");
      const log = page.getByRole("button", { name: translate(language, "log.add"), exact: true });
      const dial = page.getByRole("slider");
      await expect(log).toBeInViewport({ ratio: 1 });
      const logBox = await log.boundingBox();
      const dialBox = await dial.boundingBox();
      const tabs = await page.getByRole("navigation").boundingBox();
      // The dial carries the estimate, so logging follows it, in thumb reach.
      expect(logBox?.y).toBeGreaterThan((dialBox?.y ?? 0) + (dialBox?.height ?? 0));
      const detailsBox = await page
        .getByRole("button", { name: translate(language, "diary.addDetails") })
        .boundingBox();
      // Details shares the log line: same row, after the log button.
      expect(detailsBox?.x).toBeGreaterThan(logBox?.x ?? 0);
      expect(Math.abs((detailsBox?.y ?? 0) - (logBox?.y ?? 0))).toBeLessThan(2);
      expect((logBox?.y ?? 0) + (logBox?.height ?? 0)).toBeLessThan(tabs?.y ?? 0);
      await log.click();
      await expect(page.getByRole("radio").first()).toBeFocused();
      const stored = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("tide.period-tracker.state.v1") ?? "{}"),
      );
      expect(stored.intensityByDay["2026-04-15"]).toBeDefined();
    });
  }
}

test("the flow levels are one Tab stop after a fresh log", async ({ page }) => {
  await seedAppState(page, "en", { showFertility: false }, {});
  await page.goto("/");
  await page.getByRole("button", { name: "Log bleeding today", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Spotting" })).toBeFocused();
  // The radios share one Tab stop, between Close and the removal action.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Not bleeding that day", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
});
