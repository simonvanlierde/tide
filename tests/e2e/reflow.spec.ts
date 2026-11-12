import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";
import { seedAppState } from "./seed";

// WCAG 1.4.10 Reflow: at 320 CSS px wide, content must not scroll sideways.
test.use({ viewport: { width: 320, height: 640 } });

for (const language of ["en", "nl", "de", "fr", "es"] as const) {
  test(`${language} navigation stays reachable with 200% text at 320 px`, async ({ page }) => {
    await seedAppState(page, language);
    await page.goto("/settings");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    for (const tab of await page.locator(".tab-item").all()) {
      const bounds = await tab.evaluate((element) => {
        const boxes = [element, ...element.children].map((child) => child.getBoundingClientRect());
        return boxes.map(({ left, right, bottom }) => ({ left, right, bottom }));
      });
      for (const box of bounds) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(320);
        expect(box.bottom).toBeLessThanOrEqual(640);
      }
      await tab.focus();
      await expect(tab).toBeFocused();
    }
    const labelsFit = await page
      .locator(".tab-item__label")
      .evaluateAll((labels) => labels.every((label) => label.scrollWidth <= label.clientWidth + 1));
    expect(labelsFit).toBe(true);
    await page.locator(".tab-item").nth(1).click();
    await expect(page).toHaveURL(/\/calendar$/);
    await page.locator(".tab-item").nth(2).click();
    await expect(page).toHaveURL(/\/settings$/);
  });
}

for (const path of ROUTES) {
  test(`${path} does not scroll sideways at 320 px`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}
