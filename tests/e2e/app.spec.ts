import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { en } from "../../src/i18n/en";
import { FIXED_NOW, seedAppState } from "./seed";

// Pin "today" so every test sees the same date regardless of when CI runs.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
});

test("app shell loads and primary navigation works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/^today$/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^today$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^calendar$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^settings$/i })).toBeVisible();

  await page.getByRole("link", { name: /^settings$/i }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();

  await page.getByRole("link", { name: /^calendar$/i }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await expect(
    page.getByRole("table", { name: en["calendar.title"] }),
  ).toBeVisible();
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
  await page.goto("/calendar");
  await expect(page.getByLabel(/calendar/i)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /april 2026/i })).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();
  await page.reload();
  await expect(page.getByText(en["settings.privacy"])).toBeVisible();
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
  expect(
    (manifest.icons as { purpose: string }[])
      .map((icon) => icon.purpose)
      .sort(),
  ).toEqual(["any", "any", "maskable", "maskable"]);

  const faviconResponse = await page.request.get("/favicon.ico");
  expect(faviconResponse.ok()).toBe(true);

  const iconResponse = await page.request.get("/icons/icon-192.png");
  expect(iconResponse.ok()).toBe(true);

  const serviceWorkerRegisterResponse =
    await page.request.get("/registerSW.js");
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

test("the fertility question is accessible and its answer is saved", async ({
  page,
}) => {
  await seedAppState(page, "en", { showFertility: null });
  await page.goto("/");

  const question = page.getByRole("region", {
    name: en["fertilityAsk.title"],
  });
  await expect(question).toBeVisible();
  await expect(
    page.getByText(en["today.fertility"], { exact: true }),
  ).toHaveCount(0);
  const { violations } = await new AxeBuilder({ page })
    .include(".today-screen")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  await question
    .getByRole("button", { name: en["fertilityAsk.show"], exact: true })
    .click();
  await expect(question).toHaveCount(0);
  await expect(page.getByText(en["today.notBirthControl"])).toBeVisible();

  // The seed script reruns on reload, so read the saved answer directly.
  const saved = await page.evaluate(() =>
    localStorage.getItem("tide.period-tracker.state"),
  );
  expect(JSON.parse(saved ?? "{}").settings.showFertility).toBe(true);
});

test("a past period logs in one go and survives a reload", async ({ page }) => {
  await page.goto("/calendar");

  await page.getByRole("button", { name: en["calendar.logRange"] }).click();
  await page.getByRole("button", { name: /april 6, 2026/i }).click();
  await page.getByRole("button", { name: /april 10, 2026/i }).click();
  await expect(page.locator(".calendar-grid__day.is-logged")).toHaveCount(5);

  await page.reload();
  await expect(page.locator(".calendar-grid__day.is-logged")).toHaveCount(5);
});
