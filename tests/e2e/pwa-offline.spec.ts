import { expect, test } from "@playwright/test";
import { explainTranslators } from "../../src/features/today/explainMessages";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { seedAppState } from "./seed";

// Start online once; the service worker must cache lazy legal pages before they are opened.
test("legal pages and Settings work offline after the first visit", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
      });
    }
  });
  await context.setOffline(true);

  await page.goto("/settings");
  for (const [path, title] of [
    ["/privacy", "Privacy statement"],
    ["/accessibility", "Accessibility statement"],
  ] as const) {
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("article").getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator('.tab-bar a[href="/settings"]')).toHaveAttribute("aria-current", "true");
    await page.reload();
    await expect(page.locator("article").getByRole("heading", { level: 1 })).toHaveText(title);
    await page.locator(".back-link").click();
    await expect(page).toHaveURL(/\/settings$/);
  }
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  for (const language of SUPPORTED_LANGUAGES) {
    await page.locator("#language-select").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator('.tab-bar a[href="/"]')).toHaveText(translate(language, "nav.today"));
  }
  await page.locator("#language-select").selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["tide.period-tracker.state.v1"]);
});

for (const language of SUPPORTED_LANGUAGES) {
  test(`the forecast explanation first opens offline in ${language}`, async ({ page, context }) => {
    await seedAppState(page, language);
    const forecastRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/ForecastExplainer-")) forecastRequests.push(request.url());
    });
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        });
      }
    });
    expect(forecastRequests).toEqual([]);
    await context.setOffline(true);
    await page.getByRole("button", { name: translate(language, "today.cycleInsights"), exact: true }).click();
    await page.getByText(translate(language, "today.howWorkedOut")).click();
    const explanation = page.getByRole("region", { name: translate(language, "today.howWorkedOut") });
    await expect(explanation.getByRole("listitem").first()).toHaveText(
      explainTranslators[language]._("explain.fallback", { cycle: 28 }),
    );
    await expect(explanation).not.toContainText("explain.");
    expect(forecastRequests).toHaveLength(1);
  });
}
