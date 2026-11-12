import { expect, test } from "@playwright/test";
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "../../src/data/schema";
import { FIXED_NOW } from "./seed";

test("an older tab cannot strip diary entries or start a storage feedback loop", async ({ page, context }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  const older = await context.newPage();
  await older.route("**/legacy-writer", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Legacy writer</title><body></body>" }),
  );
  await older.goto("/legacy-writer");
  await older.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        intensityByDay: { "2026-04-11": "medium" },
        settings: {
          dismissedOn: null,
          showFertility: false,
          showCycleDayNumbers: true,
          theme: "light",
          language: "en",
        },
      }),
    );
    document.body.dataset.writes = "0";
    window.addEventListener("storage", (event) => {
      if (event.key !== key) return;
      const state = JSON.parse(localStorage.getItem(key) ?? "{}");
      // For this valid fixture these are exactly the fields the 0.4 reader retains.
      const { dismissedOn, showFertility, showCycleDayNumbers, theme, language } = state.settings;
      localStorage.setItem(
        key,
        JSON.stringify({
          intensityByDay: state.intensityByDay,
          settings: { dismissedOn, showFertility, showCycleDayNumbers, theme, language },
        }),
      );
      document.body.dataset.writes = String(Number(document.body.dataset.writes) + 1);
    });
  }, LEGACY_STORAGE_KEY);

  await page.goto("/calendar");
  await page.getByRole("button", { name: /^Edit April 12, 2026/ }).click();
  await page.getByText("More details", { exact: true }).click();
  await page.getByRole("textbox", { name: "Note (optional)", exact: true }).fill("Keep this diary entry.");
  await expect(page.getByText("Details saved.", { exact: true })).toBeVisible();
  const current = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  expect(JSON.parse(current ?? "{}").detailsByDay["2026-04-12"].note).toBe("Keep this diary entry.");

  await older.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? "{}");
    state.intensityByDay["2026-04-10"] = "heavy";
    localStorage.setItem(key, JSON.stringify(state));
  }, LEGACY_STORAGE_KEY);
  await page.reload();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(current);
  expect(await older.locator("body").getAttribute("data-writes")).toBe("0");
  await older.close();
});
