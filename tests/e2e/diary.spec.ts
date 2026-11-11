import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { en } from "../../src/i18n/en";
import { findOverflow } from "./overflow";
import { FIXED_NOW, seedAppState } from "./seed";

test("keyboard date edits keep the selected day segment and load its details", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-11T12:00:00Z"));
  // Only the Calendar's details pick a date; Today's are for today.
  await page.goto("/calendar");
  await page.getByRole("button", { name: /^Add details for / }).click();
  const date = page.getByLabel(en["diary.date"], { exact: true });
  await expect(date).toHaveValue("2026-11-11");
  await date.press("ArrowRight");
  await date.press("ArrowDown");
  await expect(date).toHaveValue("2026-11-10");
  await date.press("ArrowDown");
  await expect(date).toHaveValue("2026-11-09");
  await page.getByRole("textbox", { name: en["diary.note"], exact: true }).fill("A quiet day.");
  await expect(page.getByText(en["diary.saved"], { exact: true })).toBeVisible();
  await date.fill("2026-11-08");
  await expect(page.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("");
  await expect(page.getByText(en["diary.saved"], { exact: true })).not.toBeVisible();
  await date.fill("2026-11-09");
  await expect(page.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("A quiet day.");
});

for (const language of SUPPORTED_LANGUAGES) {
  for (const width of [320, 1440]) {
    for (const scheme of ["light", "dark"] as const) {
      test(`daily details in ${language}, ${width}px, ${scheme}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: scheme });
        await seedAppState(page, language, {}, {});
        await page.goto("/");
        await page.getByRole("button", { name: translate(language, "diary.addDetails"), exact: true }).click();
        // Pressed chips and the saved status are the states most likely to overflow.
        await page
          .getByRole("button", { name: translate(language, "diary.symptom.breastTenderness"), exact: true })
          .click();
        await page.getByRole("button", { name: translate(language, "diary.mood.okay"), exact: true }).click();
        await expect(page.getByRole("textbox", { name: translate(language, "diary.note"), exact: true })).toBeVisible();
        expect(await findOverflow(page)).toEqual([]);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();
        expect(
          violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })),
        ).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath("diary.png"), fullPage: true });
      });
    }
  }
}

test("diary-only history survives reload, calendar viewing and backup restore", async ({ page, browser }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/");
  await page.getByRole("button", { name: en["diary.addDetails"], exact: true }).click();
  await page.getByRole("button", { name: en["diary.noSymptoms"], exact: true }).click();
  await page.getByRole("button", { name: en["diary.mood.good"], exact: true }).click();
  await page.getByRole("textbox", { name: en["diary.note"], exact: true }).fill("A walk helped.");
  await expect(page.getByText(en["diary.saved"], { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: en["diary.editDetails"], exact: true }).click();
  await expect(page.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("A walk helped.");
  await page.getByRole("button", { name: en["diary.done"], exact: true }).click();
  await page.getByRole("link", { name: en["nav.calendar"], exact: true }).click();
  await page.getByRole("button", { name: /view details for/i }).click();
  await expect(page.getByRole("button", { name: en["diary.noSymptoms"], exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("A walk helped.");
  await page.getByRole("link", { name: en["nav.settings"], exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: en["settings.export"], exact: true }).click();
  const file = await download;
  const path = await file.path();
  expect(path).toBeTruthy();
  const context = await browser.newContext();
  try {
    const restored = await context.newPage();
    await restored.clock.setFixedTime(FIXED_NOW);
    await restored.goto("/settings");
    await restored.getByLabel(en["settings.importFile"], { exact: true }).setInputFiles(path as string);
    await restored.getByRole("link", { name: en["nav.today"], exact: true }).click();
    await restored.getByRole("button", { name: en["diary.editDetails"], exact: true }).click();
    await expect(restored.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("A walk helped.");
    expect(
      await restored.evaluate(
        () => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay,
      ),
    ).toEqual({});
  } finally {
    await context.close();
  }
});
