import { expect, test } from "@playwright/test";
import { seedAppState } from "./seed";

const LANGUAGES = ["en", "nl", "de", "fr", "es"] as const;

for (const width of [320, 360, 390]) {
  test(`calendar day cells are 44px touch targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await seedAppState(page, "en");
    await page.goto("/calendar");
    // The hit area may be larger than the drawn cell: probe the cell's own
    // edges and see which element takes the tap.
    const misses = await page.locator(".calendar-grid__cell").evaluateAll((cells) =>
      cells.flatMap((cell) => {
        const rect = cell.getBoundingClientRect();
        const button = cell.querySelector("button");
        if (!button || button.disabled) return [];
        const mid = rect.top + rect.height / 2;
        let left = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        for (let x = rect.left - 6; x <= rect.right + 6; x += 0.25) {
          if (document.elementFromPoint(x, mid) === button) {
            left = Math.min(left, x);
            right = Math.max(right, x);
          }
        }
        return right - left < 43.75 || rect.height < 44
          ? [`${button.getAttribute("aria-label")}: ${Math.round(right - left)}x${Math.round(rect.height)}`]
          : [];
      }),
    );
    expect(misses).toEqual([]);
  });
}

test("future days, outside-month days and past days read differently", async ({ page }) => {
  await seedAppState(page, "en", { showFertility: false });
  await page.goto("/calendar");
  const style = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => ({ color: getComputedStyle(el).color, opacity: getComputedStyle(el).opacity }));
  const future = await style(".calendar-grid__day.is-future:not(.is-outside-month)");
  const outside = await style(".calendar-grid__day.is-outside-month:not(.is-future)");
  expect(future.opacity).toBe("1");
  expect(future.color).not.toBe(outside.color);
});

test("the legend sets the cycle-day key apart from its neighbour", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAppState(page, "en", {}, { "2026-04-14": "medium" });
  await page.goto("/calendar");
  const count = page.locator(".calendar-legend__count");
  await expect(count).toBeVisible();
  expect(await count.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))).toBeGreaterThan(0);
});

for (const language of LANGUAGES) {
  test(`"log a past period" stays on one line at 320px in ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await seedAppState(page, language);
    await page.goto("/calendar");
    const lines = await page.locator(".calendar__actions > .calendar__action").evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el.lastChild as Node);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
  });
}

test("a day is named by its date, with the cycle day in the translated order", async ({ page }) => {
  await seedAppState(page, "de", {}, { "2026-04-14": "medium" });
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /^15\. April 2026/ });
  await expect(day).toHaveAttribute("aria-pressed", "false");
  await expect(day).not.toHaveAccessibleName(/Bearbeiten/);
  await expect(day).toHaveAccessibleName(/Zyklustag 2/);
});

test("a French day names the cycle day with the number inside the phrase", async ({ page }) => {
  await seedAppState(page, "fr", {}, { "2026-04-14": "medium" });
  await page.goto("/calendar");
  await expect(page.getByRole("button", { name: /^15 avril 2026/ })).toHaveAccessibleName(/Jour 2 du cycle/);
});
