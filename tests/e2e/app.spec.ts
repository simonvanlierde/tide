import { expect, test } from "@playwright/test";

test("home screen shows the polished Today layout", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /day/i })).toBeVisible();
  await expect(page.getByLabel(/today/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /log period today/i })).toBeVisible();
  await expect(page.getByLabel(/history/i)).toBeVisible();
  await expect(page.getByLabel(/settings/i)).toBeVisible();
});

test("favicon is served from the app root", async ({ page }) => {
  const response = await page.request.get("/favicon.ico");
  expect(response.ok()).toBe(true);
});
