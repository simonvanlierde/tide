import { expect, test } from "@playwright/test";
import { seedAppState } from "./seed";

// Widths we commit to supporting, plus one short-height case for the fixed tab
// bar. 320x568 is the hard floor (iPhone SE 1st gen); 280 is the foldable
// cover-screen edge; 360/390 are the common Android/iPhone widths.
const SIZES = [
  { name: "fold cover 280x720", width: 280, height: 720 },
  { name: "small 320x568", width: 320, height: 568 },
  { name: "android 360x800", width: 360, height: 800 },
  { name: "iphone 390x844", width: 390, height: 844 },
  { name: "short 360x500", width: 360, height: 500 },
] as const;

const ROUTES = ["/", "/calendar", "/settings"] as const;

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test.beforeEach(async ({ page }) => {
      await seedAppState(page);
    });

    for (const path of ROUTES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await page.goto(path);
        await expect(
          page.getByRole("navigation", { name: /primary navigation/i }),
        ).toBeVisible();

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        // +1 tolerates sub-pixel rounding, not a real overflowing element.
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test(`${path} keeps interactive content clear of the tab bar`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(
          page.getByRole("navigation", { name: /primary navigation/i }),
        ).toBeVisible();

        // Scroll to the very bottom, then check that nothing you can click in
        // <main> is left hidden behind the fixed tab bar (the padding under
        // .app-main must clear it). Measured lowest-first, not DOM order.
        const { maxBottom, tabTop } = await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
          const interactive = document.querySelectorAll(
            "#main a, #main button, #main input, #main summary, #main [tabindex]",
          );
          let lowest = 0;
          for (const el of interactive) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            lowest = Math.max(lowest, rect.bottom);
          }
          const tab = document
            .querySelector(".tab-bar")
            ?.getBoundingClientRect();
          return { maxBottom: lowest, tabTop: tab?.top ?? 0 };
        });

        expect(maxBottom).toBeLessThanOrEqual(tabTop + 1);
      });
    }

    test("settings tab stays reachable", async ({ page }) => {
      await page.goto("/settings");
      await expect(
        page.getByRole("link", { name: /^settings$/i }),
      ).toBeInViewport();
    });
  });
}

test.describe("theme segmented control", () => {
  async function labelWidth(page: import("@playwright/test").Page) {
    await page.goto("/settings");
    const label = page.locator(".segmented__label").first();
    await expect(label).toBeAttached();
    const box = await label.boundingBox();
    return box?.width ?? 0;
  }

  async function isStacked(page: import("@playwright/test").Page) {
    const label = await page.locator("#theme-label").boundingBox();
    const control = await page.locator(".theme-field .segmented").boundingBox();
    return (control?.y ?? 0) >= (label?.y ?? 0) + (label?.height ?? 0);
  }

  test("stacks under its label on very narrow viewports, words intact", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    expect(await labelWidth(page)).toBeGreaterThan(10);
    expect(await isStacked(page)).toBe(true);
  });

  test("keeps its label visible beside the control on wide shells", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/settings");
    const label = await page.locator("#theme-label").boundingBox();
    const control = await page.locator(".theme-field .segmented").boundingBox();
    // A zero-width label means it collapsed and its text is under the control.
    expect(label?.width ?? 0).toBeGreaterThan(20);
    expect(label?.x ?? 0).toBeLessThan(control?.x ?? 0);
    expect((label?.x ?? 0) + (label?.width ?? 0)).toBeLessThanOrEqual(
      (control?.x ?? 0) + 1,
    );
  });

  test("sits beside its label once the shell is wide enough", async ({
    page,
  }) => {
    // Side by side only while the shell (the container) is wider than 410px,
    // i.e. large phones and up.
    await page.setViewportSize({ width: 440, height: 780 });
    expect(await labelWidth(page)).toBeGreaterThan(10);
    expect(await isStacked(page)).toBe(false);
  });
});
