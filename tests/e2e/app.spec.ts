import { expect, test } from "@playwright/test";

test("app shell loads and primary navigation works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/^today$/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^today$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^history$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^settings$/i })).toBeVisible();

  await page.getByRole("link", { name: /^settings$/i }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: /information/i })).toBeVisible();

  await page.getByRole("link", { name: /^history$/i }).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByLabel(/history calendar/i)).toBeVisible();
});

test("logging today persists across reload", async ({ page }) => {
  await page.goto("/");

  const actionButton = page.getByRole("button", {
    name: /log bleeding today|remove bleeding log/i,
  });
  await expect(actionButton).toBeVisible();

  const startedLogged = await page
    .getByRole("button", { name: /remove bleeding log/i })
    .isVisible()
    .catch(() => false);
  await actionButton.click();

  const expectedActionLabel = startedLogged
    ? /log bleeding today/i
    : /remove bleeding log/i;

  await expect(
    page.getByRole("button", { name: expectedActionLabel }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("button", { name: expectedActionLabel }),
  ).toBeVisible();
});

test("deep links reload correctly for the static app paths", async ({
  page,
}) => {
  await page.goto("/history");
  await expect(page.getByLabel(/history calendar/i)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /april 2026/i })).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /information/i })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/everything stays on this device/i)).toBeVisible();
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

  const serviceWorkerRegisterResponse = await page.request.get("/registerSW.js");
  expect(serviceWorkerRegisterResponse.ok()).toBe(true);

  await page.goto("/");
  await expect(
    page.locator('meta[name="apple-mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes");
  await expect(
    page.locator('meta[name="apple-mobile-web-app-status-bar-style"]'),
  ).toHaveAttribute("content", "default");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/icons/icon-192.png",
  );
});
