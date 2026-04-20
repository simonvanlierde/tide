import { expect, test } from "@playwright/test";

test("app shell loads and primary navigation works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/^today$/i).first()).toBeVisible();
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

test("versioned backup export and import work", async ({ page }) => {
  await page.goto("/settings");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export backup/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tide-backup.json");

  await page
    .getByLabel(/import backup file/i)
    .setInputFiles("tests/e2e/fixtures/backup-import.json");

  await expect(page.getByText(/backup imported/i)).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("tide.period-tracker.state")),
    )
    .toContain('"version":1');
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
