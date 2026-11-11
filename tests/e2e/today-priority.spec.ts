import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { seedAppState } from "./seed";

for (const language of SUPPORTED_LANGUAGES) {
  for (const [name, days] of [
    ["first log", []],
    ["upcoming", ["2026-02-09", "2026-03-09", "2026-04-06"]],
    ["expected soon", ["2026-02-20", "2026-03-20"]],
    ["overdue", ["2026-02-16", "2026-03-16"]],
  ] as const) {
    test(`${language}: ${name} keeps logging before the dial and above the tabs`, async ({ page }) => {
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
      expect(logBox?.y).toBeLessThan(dialBox?.y ?? 0);
      expect((logBox?.y ?? 0) + (logBox?.height ?? 0)).toBeLessThan(tabs?.y ?? 0);
      await log.click();
      await expect(page.getByRole("radio").first()).toBeFocused();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}"));
      expect(stored.intensityByDay["2026-04-15"]).toBeDefined();
    });
  }
}
