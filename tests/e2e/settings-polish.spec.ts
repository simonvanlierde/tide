import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "./i18n";
import { seedAppState } from "./seed";

for (const [lang, width, theme, showFertility] of [
  ["en", 1280, "light", true],
  ["en", 390, "dark", false],
  ["de", 320, "dark", false],
] as const) {
  test(`data actions leave no blank feedback space (${lang}, ${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await seedAppState(page, lang, { showFertility, theme });
    await page.goto("/settings");
    for (const selector of [".data-actions", ".calendar-export__options"]) {
      const trailingSpace = await page.locator(selector).evaluate((el) => {
        const group = el.closest(".data-group");
        if (!group) throw new Error("data group missing");
        return group.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom;
      });
      expect(trailingSpace, selector).toBeLessThanOrEqual(12);
    }
    await page.getByRole("button", { name: new RegExp(`^${translate(lang, "settings.export")}`) }).click();
    await expect(page.getByRole("status").filter({ hasText: translate(lang, "settings.exportSuccess") })).toBeVisible();
    await expect(page.locator(".data-group").first().getByRole("status")).toBeVisible();
    await page.getByRole("button", { name: translate(lang, "settings.exportCalendar") }).click();
    await expect(page.locator(".data-group").nth(1).getByRole("status")).toBeVisible();
    await expect(page.locator(".data-group").first().getByRole("status")).toHaveCount(0);
  });
}

test("Export is disabled and says why when there is no history", async ({ page }) => {
  await seedAppState(page, "en", {}, {});
  await page.goto("/settings");
  const button = page.getByRole("button", { name: /^Export/ });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAccessibleDescription(translate("en", "settings.exportEmpty"));
  await expect(page.getByText(translate("en", "settings.exportEmpty"))).toBeVisible();
});

for (const lang of SUPPORTED_LANGUAGES.filter((l) => l !== "en")) {
  test(`the calendar button label stays whole and centred at 320px in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await seedAppState(page, lang);
    await page.goto("/settings");
    const button = page.getByRole("button", { name: translate(lang, "settings.exportCalendar") });
    const m = await button.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const icon = el.querySelector(".button-icon")?.getBoundingClientRect();
      const text = el.querySelector(".button-label > span")?.getBoundingClientRect();
      if (!icon || !text) throw new Error("label parts missing");
      const line = Number.parseFloat(getComputedStyle(el).lineHeight) || 20;
      return {
        lines: Math.round(text.height / line),
        // Content centred as one unit: equal air left and right of icon + text.
        skew: Math.abs(icon.left - box.left - (box.right - text.right)),
      };
    });
    expect(m.lines).toBe(1);
    expect(m.skew).toBeLessThan(20);
  });
}

test("the About chevrons line up with the first line of their row", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await seedAppState(page, "de");
  await page.goto("/settings");
  const rows = await page.locator(".link-rows .fact-list__more").evaluateAll((els) =>
    els.map((el) => {
      const icon = el.querySelector(".fact-list__more-icon")?.getBoundingClientRect();
      const row = el.getBoundingClientRect();
      const text = el.querySelector(".link-rows__text")?.getBoundingClientRect();
      if (!icon || !text) throw new Error("row parts missing");
      return { right: Math.round(row.right - icon.right), mid: icon.top + icon.height / 2 - text.top };
    }),
  );
  // Same inset on every row, and the icon level with the first text line (~14px), not the block middle.
  expect(new Set(rows.map((r) => r.right)).size).toBe(1);
  for (const r of rows) expect(r.mid).toBeLessThan(18);
});
