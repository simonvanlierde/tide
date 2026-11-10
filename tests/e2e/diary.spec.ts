import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { en } from "../../src/i18n/en";
import { findOverflow } from "./overflow";
import { FIXED_NOW, seedAppState } from "./seed";

for (const language of SUPPORTED_LANGUAGES) {
  for (const width of [320, 1440]) {
    for (const scheme of ["light", "dark"] as const) {
      test(`daily details in ${language}, ${width}px, ${scheme}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: scheme });
        await seedAppState(page, language, {}, {});
        await page.goto("/");
        await page.getByRole("button", { name: translate(language, "diary.addDetails"), exact: true }).click();
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
  await page.getByRole("checkbox", { name: en["diary.noSymptoms"], exact: true }).check();
  await page.getByRole("combobox", { name: en["diary.mood"], exact: true }).selectOption("good");
  await page.getByRole("textbox", { name: en["diary.note"], exact: true }).fill("A walk helped.");
  await expect(page.getByLabel(en["diary.date"], { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: en["diary.save"], exact: true }).click();
  await expect(page.getByText(en["diary.saved"], { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: en["diary.editDetails"], exact: true }).click();
  await expect(page.getByRole("textbox", { name: en["diary.note"], exact: true })).toHaveValue("A walk helped.");
  await page.getByRole("button", { name: en["diary.cancel"], exact: true }).click();
  await page.getByRole("link", { name: en["nav.calendar"], exact: true }).click();
  await page.getByRole("button", { name: /view details for/i }).click();
  await expect(page.getByRole("checkbox", { name: en["diary.noSymptoms"], exact: true })).toBeChecked();
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
