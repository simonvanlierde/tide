import { expect, test } from "@playwright/test";
import { seedAppState } from "./seed";

test("removing a day returns keyboard focus to its calendar cell", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /Edit April 14, 2026/ });
  await day.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Not bleeding/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Log bleeding", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Log April 14, 2026/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: /Edit April 13, 2026/ })).toBeFocused();
});

test("undoing one day returns keyboard focus to that day", async ({ page }) => {
  await seedAppState(page, "en", {}, {});
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /Log April 15, 2026/ });
  await day.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(day).toBeFocused();
});

test("undoing a range returns keyboard focus to its first day", async ({ page }) => {
  await seedAppState(page, "en", {}, {});
  await page.goto("/calendar");
  await page.getByRole("button", { name: "Log a past period", exact: true }).focus();
  for (const key of ["Enter", "ArrowLeft", "ArrowLeft", "Enter", "ArrowRight", "Enter", "Tab"]) {
    await page.keyboard.press(key);
  }
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /Log April 13, 2026/ })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: /Log April 14, 2026/ })).toBeFocused();
});
