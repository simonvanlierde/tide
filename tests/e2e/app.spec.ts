import { expect, test } from "@playwright/test";

test("app shell loads and utility navigation works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /day/i })).toBeVisible();
  await expect(page.getByLabel(/today/i)).toBeVisible();
  await expect(page.getByLabel(/history/i)).toBeVisible();
  await expect(page.getByLabel(/settings/i)).toBeVisible();

  await page.getByLabel(/settings/i).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: /data/i })).toBeVisible();

  await page.getByLabel(/history/i).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByLabel(/history calendar/i)).toBeVisible();
});

test("logging today persists across reload", async ({ page }) => {
  await page.goto("/");

  const logButton = page.getByRole("button", { name: /log bleeding today/i });
  await expect(logButton).toBeVisible();
  await logButton.click();

  await expect(
    page.getByRole("button", { name: /remove bleeding log/i }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("button", { name: /remove bleeding log/i }),
  ).toBeVisible();
});

test("manifest and install assets are served", async ({ page }) => {
  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);

  const manifest = JSON.parse(await manifestResponse.text()) as Record<
    string,
    unknown
  >;
  expect(manifest).toMatchObject({
    name: "Tide",
    short_name: "Tide",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
  });

  const faviconResponse = await page.request.get("/favicon.ico");
  expect(faviconResponse.ok()).toBe(true);

  const iconResponse = await page.request.get("/icons/icon-192.png");
  expect(iconResponse.ok()).toBe(true);
});
