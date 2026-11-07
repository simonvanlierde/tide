import { expect, test } from "@playwright/test";

// The legal pages are English only, so in another language they must say so: the text is
// marked English, and the Settings rows are translated and note that the page is in English.
test.describe("in a German browser", () => {
  test.use({ locale: "de-DE" });

  for (const href of ["/accessibility", "/privacy"]) {
    test(`${href} marks its text as English`, async ({ page }) => {
      await page.goto(href);
      await expect(page.locator("article")).toHaveAttribute("lang", "en");
    });
  }

  test("Settings links the pages with German labels and an English note", async ({ page }) => {
    await page.goto("/settings");
    const link = page.getByRole("link", { name: /Datenschutz.*erklärung.*Auf Englisch/ });
    await expect(link).toHaveAttribute("href", "/privacy");
    await expect(link).toHaveAttribute("hreflang", "en");
  });

  test("the back link returns to Settings without a reload", async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate(() => {
      (window as { stayed?: boolean }).stayed = true;
    });
    await page.getByRole("link", { name: /Erklärung zur Barrierefreiheit/ }).click();
    await expect(page).toHaveURL(/\/accessibility$/);
    await expect(page.getByRole("main")).toBeFocused();
    await page.getByRole("link", { name: "Einstellungen" }).first().click();
    await expect(page).toHaveURL(/\/settings$/);
    expect(await page.evaluate(() => (window as { stayed?: boolean }).stayed)).toBe(true);
  });
});
