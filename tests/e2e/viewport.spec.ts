import { expect, test } from "@playwright/test";

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

const ROUTES = ["/", "/history", "/settings"] as const;

// Seed a fresh cycle so every screen renders real content (a dial with a day, a
// calendar with logged/predicted days) — empty screens can't overflow.
function seedState() {
  const today = new Date();
  const days: string[] = [];
  for (let offset = 4; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }
  return {
    periodDays: days,
    settings: { dismissedOn: null, theme: "system" },
  };
}

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript((state) => {
        localStorage.setItem(
          "tide.period-tracker.state",
          JSON.stringify(state),
        );
      }, seedState());
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

  test("collapses to icon-only on very narrow viewports", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    // Labels are clipped to 1px (kept in the DOM for the accessible name).
    expect(await labelWidth(page)).toBeLessThanOrEqual(2);
  });

  test("shows text labels on normal phone widths", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    expect(await labelWidth(page)).toBeGreaterThan(10);
  });
});
