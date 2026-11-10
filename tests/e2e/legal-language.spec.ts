import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { seedAppState } from "./seed";

// The legal pages are English only; their Settings labels and return link follow the app language.
for (const language of SUPPORTED_LANGUAGES) {
  test.describe(language, () => {
    test.beforeEach(async ({ page }) => {
      await seedAppState(page, language);
    });

    test("Settings labels both pages and returns without a reload", async ({ page }) => {
      await page.goto("/settings");
      await page.evaluate(() => {
        (window as { stayed?: boolean }).stayed = true;
      });
      for (const [href, key] of [
        ["/privacy", "legal.privacy"],
        ["/accessibility", "legal.accessibility"],
      ] as const) {
        const link = page.locator(`.link-rows a[href="${href}"]`);
        const name = translate(language, key);
        await expect(link).toHaveText(language === "en" ? name : `${name}${translate(language, "legal.inEnglish")}`);
        await expect(link).toHaveAttribute("hreflang", "en");
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByRole("main")).toBeFocused();
        await expect(page.locator("article")).toHaveAttribute("lang", "en");
        const back = page.locator(".back-link");
        await expect(back).toHaveText(translate(language, "nav.settings"));
        await back.click();
        await expect(page).toHaveURL(/\/settings$/);
      }
      expect(await page.evaluate(() => (window as { stayed?: boolean }).stayed)).toBe(true);
    });
  });
}
