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
  await expect(page.getByRole("button", { name: /Edit April 14, 2026/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: /Edit April 13, 2026/ })).toBeFocused();
});

test("opening an empty day does not log bleeding and closing returns focus", async ({ page }) => {
  await seedAppState(page, "en", {}, {});
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /Edit April 15, 2026/ });
  await day.focus();
  await page.keyboard.press("Enter");
  const log = page.getByRole("button", { name: "Log bleeding", exact: true });
  await expect(log).toBeFocused();
  await expect(page.locator(".calendar-grid__day.is-logged")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Done", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(day).toBeFocused();
  await expect(log).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay),
  ).toEqual({});
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
  await expect(page.getByRole("button", { name: /Edit April 13, 2026/ })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: /Edit April 14, 2026/ })).toBeFocused();
});
