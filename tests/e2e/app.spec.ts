import { expect, test } from "@playwright/test";

test("home screen shows the polished Today layout", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /day/i })).toBeVisible();
  await expect(page.getByLabel(/circular cycle view/i)).toBeVisible();
  await expect(page.getByText(/phase:/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /^today$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /log period today/i })).toBeVisible();
  await expect(page.getByLabel(/history/i)).toBeVisible();
  await expect(page.getByLabel(/settings/i)).toBeVisible();
});

test("history and settings show the new utility controls", async ({ page }) => {
  await page.goto("/history");
  await expect(page.getByLabel(/history calendar/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /previous month/i })).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText(/reminder status/i)).toBeVisible();
  await page.getByRole("button", { name: /simple info \/ chips/i }).click();

  await page.goto("/");
  await expect(page.getByLabel(/simple home view/i)).toBeVisible();
});

test("favicon is served from the app root", async ({ page }) => {
  const response = await page.request.get("/favicon.ico");
  expect(response.ok()).toBe(true);
});
