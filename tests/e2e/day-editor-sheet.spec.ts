import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { translate } from "../../src/i18n";
import { formatLongDate } from "../../src/utils/date";
import { findOverflow } from "./overflow";
import { seedAppState } from "./seed";

async function expectAboveNavigation(page: Page, element: Locator) {
  const box = await element.boundingBox();
  const navigation = await page.getByRole("navigation").boundingBox();
  expect(box).not.toBeNull();
  expect(navigation).not.toBeNull();
  expect(box?.y).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(navigation?.y ?? 0);
}

async function expectCoreInsideSheet(panel: Locator) {
  const edges = await panel.evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      style.paddingTop,
      style.paddingRight,
      style.paddingBottom,
      style.paddingLeft,
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ];
  });
  expect(edges).toEqual(Array(8).fill("0px"));
  const clipped = await panel.locator(".flow-gauge__level, .day-editor__remove").evaluateAll((elements) => {
    const body = elements[0]?.closest(".day-editor")?.querySelector(".day-editor__body");
    if (!body) return ["Missing editor body"];
    const clip = body.getBoundingClientRect();
    return elements
      .filter((element) => {
        const bounds = element.getBoundingClientRect();
        return (
          bounds.top < clip.top - 1 ||
          bounds.bottom > clip.bottom + 1 ||
          bounds.left < clip.left - 1 ||
          bounds.right > clip.right + 1
        );
      })
      .map((element) => element.textContent?.trim());
  });
  expect(clipped).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test(`Calendar sheet keeps bleeding controls and selected week visible in ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await seedAppState(page, "en");
    await page.goto("/calendar");
    const selected = page.getByRole("button", { name: /^Edit April 14, 2026/ });
    await selected.click();
    const panel = page.getByRole("region", { name: formatLongDate("2026-04-14", "en"), exact: true });
    await expect(panel).toBeVisible();
    await expectAboveNavigation(page, panel);
    await expectCoreInsideSheet(panel);
    await expectAboveNavigation(page, panel.getByRole("button", { name: translate("en", "calendar.notBleeding") }));
    const week = await selected.locator("xpath=ancestor::tr").boundingBox();
    const sheet = await panel.boundingBox();
    expect((week?.y ?? Infinity) + (week?.height ?? 0)).toBeLessThanOrEqual(sheet?.y ?? 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await findOverflow(page)).toEqual([]);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    expect(violations.map((violation) => violation.id)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("calendar-sheet.png"), fullPage: true });
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`Today sheet shows core controls without moving the page in ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await seedAppState(page, "en");
    await page.goto("/");
    await page.getByRole("button", { name: /Logged today/ }).click();
    const panel = page.locator(".day-editor");
    await expect(panel).toBeVisible();
    await expectAboveNavigation(page, panel);
    await expectCoreInsideSheet(panel);
    await expectAboveNavigation(page, panel.getByRole("button", { name: translate("en", "calendar.notBleeding") }));
    await expectAboveNavigation(page, panel.getByRole("radio", { name: translate("en", "flow.heavy"), exact: true }));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.screenshot({ path: testInfo.outputPath("today-sheet.png"), fullPage: true });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Logged today/ })).toBeFocused();
  });
}

test("Calendar sheet leaves dates interactive and Escape works from either surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "en");
  await page.goto("/calendar");
  const first = page.getByRole("button", { name: /^Edit April 14, 2026/ });
  const second = page.getByRole("button", { name: /^Edit April 13, 2026/ });
  await first.click();
  await second.click();
  const panel = page.locator(".day-editor");
  await expect(panel.getByRole("heading")).toHaveText(formatLongDate("2026-04-13", "en"));
  await second.click();
  await expect(panel).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await second.focus();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(second).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("radio", { name: translate("en", "flow.medium"), exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(second).toBeFocused();
  expect(
    await page.evaluate(() =>
      Object.keys(JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay),
    ),
  ).toHaveLength(5);
});

for (const path of ["/calendar", "/"] as const) {
  test(`${path} keeps the close control visible while expanded details scroll inside the sheet`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAppState(page, "en");
    await page.goto(path);
    if (path === "/calendar") await page.getByRole("button", { name: /^Edit April 14, 2026/ }).click();
    else await page.getByRole("button", { name: /Logged today/ }).click();
    const panel = page.locator(".day-editor");
    const close = panel.getByRole("button", { name: translate("en", "common.close"), exact: true });
    await expect(panel).toBeVisible();
    await expectAboveNavigation(page, panel);
    await expectCoreInsideSheet(panel);
    await expectAboveNavigation(page, panel.getByRole("button", { name: translate("en", "calendar.notBleeding") }));
    await panel.locator("summary").click();
    const body = panel.locator(".day-editor__body");
    if (path === "/calendar") {
      await expect
        .poll(async () => {
          const week = await page
            .getByRole("button", { name: /^Edit April 14, 2026/ })
            .locator("xpath=ancestor::tr")
            .boundingBox();
          const sheet = await panel.boundingBox();
          return week && sheet ? Math.max(-week.y, week.y + week.height - sheet.y) : Infinity;
        })
        .toBeLessThanOrEqual(0);
    }
    expect(await findOverflow(page)).toEqual([]);
    const initialPageY = await page.evaluate(() => window.scrollY);
    const before = await close.boundingBox();
    await panel
      .getByRole("textbox", { name: translate("en", "diary.note"), exact: true })
      .fill("A quiet day.\n".repeat(50));
    await body.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expectAboveNavigation(page, close);
    const after = await close.boundingBox();
    expect(after?.y).toBeCloseTo(before?.y ?? -1, 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(initialPageY);
    expect(await findOverflow(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("expanded-sheet.png"), fullPage: true });
    await close.click();
    await expect(panel).toHaveCount(0);
  });
}

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 844, height: 390 },
]) {
  test(`Calendar uses an accessible inline editor at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAppState(page, "en");
    await page.goto("/calendar");
    const day = page.getByRole("button", { name: /^Edit April 14, 2026/ });
    await day.click();
    const panel = page.locator(".day-editor");
    await expect(panel).toBeVisible();
    expect(await panel.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");
    const close = panel.getByRole("button", { name: translate("en", "common.close"), exact: true });
    await close.scrollIntoViewIfNeeded();
    await expect(close).toBeInViewport();
    expect(await findOverflow(page)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("inline-editor.png"), fullPage: true });
    await close.click();
    await expect(day).toBeFocused();
  });
}

test("enlarged text keeps sheet details scrollable and its close control reachable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "de");
  await page.goto("/calendar");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await page.locator(".calendar-grid__day.is-today").click();
  const panel = page.locator(".day-editor");
  await panel.locator("summary").click();
  const note = panel.getByRole("textbox", { name: translate("de", "diary.note"), exact: true });
  await note.fill("A quiet day.");
  const close = panel.getByRole("button", { name: translate("de", "common.close"), exact: true });
  await expectAboveNavigation(page, close);
  expect(await findOverflow(page)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("enlarged-text-sheet.png"), fullPage: true });
  await close.click();
  await expect(panel).toHaveCount(0);
});

test("a saved future date in the last calendar row remains visible and unchanged", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "en", {}, { "2026-04-14": "medium", "2026-04-30": "light" });
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /^Edit April 30, 2026/ });
  await day.click();
  const panel = page.locator(".day-editor");
  await expect(panel).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("future-last-row-before-check.png"), fullPage: true });
  await expect
    .poll(async () => {
      const week = await day.locator("xpath=ancestor::tr").boundingBox();
      const sheet = await panel.boundingBox();
      return week && sheet ? Math.max(-week.y, week.y + week.height - sheet.y) : Infinity;
    })
    .toBeLessThanOrEqual(0);
  await expect(panel.getByRole("radio", { name: translate("en", "flow.light"), exact: true })).toBeDisabled();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay),
  ).toEqual({ "2026-04-14": "medium", "2026-04-30": "light" });
  await page.screenshot({ path: testInfo.outputPath("future-last-row.png"), fullPage: true });
  await panel.getByRole("button", { name: translate("en", "common.close"), exact: true }).click();
  await expect(day).toBeFocused();
});

test("Calendar keeps the selected week visible when the onscreen keyboard changes only the visual viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "en");
  await page.goto("/calendar");
  const day = page.getByRole("button", { name: /^Edit April 14, 2026/ });
  await day.click();
  const panel = page.locator(".day-editor");
  await panel.locator("summary").click();
  await expect(panel.getByRole("textbox", { name: translate("en", "diary.note"), exact: true })).toBeVisible();
  await page.evaluate(() => {
    const viewport = window.visualViewport;
    if (!viewport) throw new Error("Visual viewport unavailable");
    Object.defineProperty(viewport, "height", { configurable: true, value: 644 });
    viewport.dispatchEvent(new Event("resize"));
  });
  expect(await page.evaluate(() => window.innerHeight)).toBe(844);
  await expect
    .poll(async () => {
      const week = await day.locator("xpath=ancestor::tr").boundingBox();
      const sheet = await panel.boundingBox();
      return week && sheet ? Math.max(-week.y, week.y + week.height - sheet.y, sheet.y + sheet.height - 644) : Infinity;
    })
    .toBeLessThanOrEqual(0);
  await expect(panel.getByRole("button", { name: translate("en", "common.close"), exact: true })).toBeInViewport();
});

test("calendar keyboard navigation reveals a focused day above the open sheet", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "en");
  await page.goto("/calendar");
  const first = page.getByRole("button", { name: /^Edit April 2, 2026/ });
  await first.click();
  const panel = page.locator(".day-editor");
  await panel.locator("summary").click();
  await first.focus();
  await page.keyboard.press("ArrowDown");
  const next = page.getByRole("button", { name: /^Edit April 9, 2026/ });
  await expect(next).toBeFocused();
  await expect
    .poll(async () => {
      const week = await next.locator("xpath=ancestor::tr").boundingBox();
      const sheet = await panel.boundingBox();
      return week && sheet ? Math.max(-week.y, week.y + week.height - sheet.y) : Infinity;
    })
    .toBeLessThanOrEqual(0);
  await expect(panel.getByRole("heading")).toHaveText(formatLongDate("2026-04-02", "en"));
});

test("Escape dismisses an insights modal without closing the Today sheet underneath", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAppState(page, "en");
  await page.goto("/");
  await page.getByRole("button", { name: /Logged today/ }).click();
  const panel = page.locator(".day-editor");
  const insights = page.getByRole("button", { name: translate("en", "today.cycleInsights"), exact: true });
  await insights.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(panel).toBeVisible();
  await expect(insights).toBeFocused();
});
