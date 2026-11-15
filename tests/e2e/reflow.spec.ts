import { expect, type Page, test } from "@playwright/test";
import { findOverflow } from "./overflow";
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

// WCAG 1.4.10 Reflow also names 400% zoom, which a 1280 x 1024 window reaches as
// 320 x 256 CSS px. The overlays are the tallest, widest content a route can hold.
test.describe("400% zoom (320 x 256 px)", () => {
  test.use({ viewport: { width: 320, height: 256 } });

  async function expectNoSidewaysScroll(page: Page) {
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    expect(await findOverflow(page)).toEqual([]);
  }

  for (const path of ROUTES) {
    test(`${path} reflows without sideways scrolling`, async ({ page }) => {
      await seedAppState(page, "en");
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      await expectNoSidewaysScroll(page);

      // Each overlay a route offers: the day editor on Today and Calendar, the
      // confirmation dialog on Settings.
      if (path === "/") {
        await page.getByRole("button", { name: /Logged today/ }).click();
        await expect(page.locator(".day-editor")).toBeVisible();
      } else if (path === "/calendar") {
        await page.locator(".calendar-grid__day.is-logged").first().click();
        await expect(page.locator(".day-editor")).toBeVisible();
      } else if (path === "/settings") {
        await page.getByRole("button", { name: "Delete all data" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
      } else {
        return;
      }
      await expectNoSidewaysScroll(page);
    });
  }
});
