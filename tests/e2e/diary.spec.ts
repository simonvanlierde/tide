import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { formatLongDate } from "../../src/utils/date";
import { findOverflow } from "./overflow";
import { FIXED_NOW, seedAppState } from "./seed";

test("Calendar selection keeps bleeding and details on the same day", async ({ page }) => {
  await seedAppState(page, "en", {}, { "2026-04-11": "light", "2026-04-12": "heavy" });
  await page.goto("/calendar");
  await page.getByRole("button", { name: /^Edit April 11, 2026/ }).click();
  await expect(page.getByRole("heading", { name: formatLongDate("2026-04-11", "en"), exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: translate("en", "flow.light"), exact: true })).toBeChecked();
  await page.getByText(translate("en", "dayEditor.moreDetails"), { exact: true }).click();
  const note = page.getByRole("textbox", { name: translate("en", "diary.note"), exact: true });
  await note.fill("A quiet day.");
  await expect(page.getByText(translate("en", "diary.saved"), { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^Edit April 12, 2026/ }).click();
  await expect(page.getByRole("heading", { name: formatLongDate("2026-04-12", "en"), exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: translate("en", "flow.heavy"), exact: true })).toBeChecked();
  await expect(note).toBeVisible();
  await expect(note).toHaveValue("");
  await expect(page.getByText(translate("en", "diary.saved"), { exact: true })).not.toBeVisible();

  await page.getByRole("button", { name: /^Edit April 11, 2026/ }).click();
  await expect(page.getByRole("heading", { name: formatLongDate("2026-04-11", "en"), exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: translate("en", "flow.light"), exact: true })).toBeChecked();
  await expect(note).toBeVisible();
  await expect(note).toHaveValue("A quiet day.");
});

test("Calendar can add past details without logging bleeding and keeps closed-grid one-tap logging", async ({
  page,
}) => {
  await seedAppState(page, "en", {}, {});
  await page.goto("/calendar");
  await page.getByRole("button", { name: /^Add details for / }).click();
  await page.getByRole("button", { name: /^Edit April 12, 2026/ }).click();
  await expect(page.getByRole("heading", { name: formatLongDate("2026-04-12", "en"), exact: true })).toBeVisible();
  const note = page.getByRole("textbox", { name: translate("en", "diary.note"), exact: true });
  await expect(note).toBeVisible();
  await note.fill("A quiet afternoon.");
  await expect(page.getByText(translate("en", "diary.saved"), { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}");
      return { bleeding: state.intensityByDay, note: state.detailsByDay["2026-04-12"]?.note };
    }),
  ).toEqual({ bleeding: {}, note: "A quiet afternoon." });
  await page.getByRole("button", { name: translate("en", "diary.done"), exact: true }).click();
  await page.getByRole("button", { name: /^Log April 13, 2026/ }).click();
  await expect(page.locator(".calendar__help[role=status]")).toContainText("Logged Mon, Apr 13.");
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay),
  ).toEqual({ "2026-04-13": null });
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
  await page.getByRole("button", { name: translate("en", "diary.addDetails"), exact: true }).click();
  await page.getByRole("button", { name: translate("en", "diary.noSymptoms"), exact: true }).click();
  await page.getByRole("button", { name: translate("en", "diary.mood.good"), exact: true }).click();
  await page.getByRole("textbox", { name: translate("en", "diary.note"), exact: true }).fill("A walk helped.");
  await expect(page.getByText(translate("en", "diary.saved"), { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: translate("en", "diary.editDetails"), exact: true }).click();
  await expect(page.getByRole("textbox", { name: translate("en", "diary.note"), exact: true })).toHaveValue(
    "A walk helped.",
  );
  await page.getByRole("button", { name: translate("en", "diary.done"), exact: true }).click();
  await page.getByRole("link", { name: translate("en", "nav.calendar"), exact: true }).click();
  await page.getByRole("button", { name: /view details for/i }).click();
  await expect(page.getByRole("button", { name: translate("en", "diary.noSymptoms"), exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("textbox", { name: translate("en", "diary.note"), exact: true })).toHaveValue(
    "A walk helped.",
  );
  await page.getByRole("link", { name: translate("en", "nav.settings"), exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: translate("en", "settings.export"), exact: true }).click();
  const file = await download;
  const path = await file.path();
  expect(path).toBeTruthy();
  const context = await browser.newContext();
  try {
    const restored = await context.newPage();
    await restored.clock.setFixedTime(FIXED_NOW);
    await restored.goto("/settings");
    await restored.getByLabel(translate("en", "settings.importFile"), { exact: true }).setInputFiles(path as string);
    await restored.getByRole("link", { name: translate("en", "nav.today"), exact: true }).click();
    await restored.getByRole("button", { name: translate("en", "diary.editDetails"), exact: true }).click();
    await expect(restored.getByRole("textbox", { name: translate("en", "diary.note"), exact: true })).toHaveValue(
      "A walk helped.",
    );
    expect(
      await restored.evaluate(
        () => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay,
      ),
    ).toEqual({});
  } finally {
    await context.close();
  }
});
