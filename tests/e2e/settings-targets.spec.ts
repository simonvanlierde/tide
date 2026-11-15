import { expect, test } from "@playwright/test";
import { seedAppState } from "./seed";

const TARGETS = [
  ".segmented__option",
  ".switch",
  ".info-popover__trigger",
  ".colophon__link",
  ".text-action",
  ".secondary-action",
];

for (const width of [320, 390]) {
  test(`Settings controls are 44px touch targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await seedAppState(page, "de");
    await page.goto("/settings");
    // The drawn control may be smaller than its hit area: probe the centre
    // column and see how far the tap still lands on the control.
    const misses = await page.evaluate((selectors) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(selectors.join(","))) {
        el.scrollIntoView({ block: "center" });
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || (el as HTMLButtonElement).disabled) continue;
        const x = rect.left + rect.width / 2;
        let top = Number.POSITIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        for (let y = rect.top - 12; y <= rect.bottom + 12; y += 0.25) {
          const hit = document.elementFromPoint(x, y);
          if (hit && el.contains(hit)) {
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        }
        if (bottom - top < 43.75) out.push(`${el.className}: ${Math.round(bottom - top)}px high`);
      }
      return out;
    }, TARGETS);
    expect(misses).toEqual([]);
  });
}

test("the delete row keeps clear of the calendar options above it", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/settings");
  const gap = await page.evaluate(() => {
    const danger = document.querySelector(".data-group--danger") as HTMLElement;
    const above = danger.previousElementSibling as HTMLElement;
    const button = danger.querySelector("button") as HTMLElement;
    return button.getBoundingClientRect().top - above.getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(24);
});
