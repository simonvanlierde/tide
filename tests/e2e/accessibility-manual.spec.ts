import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { en } from "../../src/i18n/en";
import { findOverflow } from "./overflow";
import { ROUTES } from "./routes";
import { seedAppState } from "./seed";

test("keyboard users can skip navigation and leave the insights dialog", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: en["app.skipToContent"] })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const trigger = page.getByRole("button", { name: en["today.cycleInsights"] });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    // Chromium visits browser chrome between wraps; BODY then represents no focused page control.
    expect(
      await dialog.evaluate(
        (element) =>
          element.matches(":modal") &&
          (document.activeElement === document.body || element.contains(document.activeElement)),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("calendar arrows and flow radios work without a pointer", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/calendar");
  const today = page.locator(".calendar-grid__day.is-today");
  await today.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".calendar-grid__day:focus")).toHaveAccessibleName(/April 14, 2026/);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: en["flow.medium"] })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: en["flow.heavy"] })).toBeChecked();
  await page.getByRole("button", { name: en["common.close"], exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".calendar-grid__day:focus")).toHaveAccessibleName(/April 14, 2026/);
});

test("delete confirmation cancels with Escape and preserves data", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/settings");
  const trigger = page.getByRole("button", { name: en["settings.reset"], exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: en["common.cancel"], exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}"));
  expect(Object.keys(state.intensityByDay)).toHaveLength(5);
});

test("keyboard focus keeps Settings links above the fixed navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/settings");
  const target = page.getByRole("link", { name: "Accessibility statement", exact: true });
  for (let index = 0; index < 25; index++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
  const link = await target.boundingBox();
  const navigation = await page.getByRole("navigation").boundingBox();
  expect(link).not.toBeNull();
  expect(navigation).not.toBeNull();
  expect(link?.y).toBeLessThan(navigation?.y ?? 0);
});

for (const path of ROUTES) {
  test(`${path} keeps pointer targets large enough or separated`, async ({ page }) => {
    await seedAppState(page, "en");
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    // This rule is disabled by default in axe, including when its WCAG tag is selected.
    const { violations, incomplete } = await new AxeBuilder({ page }).withRules(["target-size"]).analyze();
    expect(violations.map((result) => ({ id: result.id, nodes: result.nodes.map((node) => node.target) }))).toEqual([]);
    expect(incomplete.map((result) => result.id)).toEqual([]);
  });

  for (const adjustment of ["text spacing", "200% text"] as const) {
    test(`${path} retains content with ${adjustment}`, async ({ page }) => {
      await seedAppState(page, "en");
      await page.setViewportSize({ width: adjustment === "text spacing" ? 320 : 1280, height: 800 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
      await page.addStyleTag({
        content:
          adjustment === "text spacing"
            ? "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }"
            : "html { font-size: 200% !important; }",
      });
      expect(await findOverflow(page)).toEqual([]);
    });
  }
}

test("landscape orientation keeps every screen usable", async ({ page }) => {
  await seedAppState(page, "en");
  await page.setViewportSize({ width: 844, height: 390 });
  for (const path of ROUTES) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    expect(await findOverflow(page)).toEqual([]);
    await expect(page.getByRole("navigation")).toBeVisible();
  }
});

test("reduced motion disables ongoing CSS animations", async ({ page }) => {
  await seedAppState(page, "en");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const ongoing = await page.evaluate(
    () =>
      document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().endTime === Infinity).length,
  );
  expect(ongoing).toBe(0);
});

test("import errors identify the problem and exporting reports its result", async ({ page }) => {
  await seedAppState(page, "en");
  await page.goto("/settings");
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("not a backup"),
  });
  await expect(page.getByRole("alert")).toContainText(en["settings.importError"]);
  await page.getByRole("button", { name: en["settings.export"], exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: en["settings.exportSuccess"] })).toBeVisible();
});

test("cycle history has a table alternative and incomplete cycles work with a keyboard", async ({ page }) => {
  await seedAppState(
    page,
    "en",
    {},
    Object.fromEntries(["2026-01-10", "2026-02-12", "2026-03-11", "2026-04-11"].map((day) => [day, "medium"])),
  );
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: en["today.cycleInsights"] }).click();
  const history = page.getByRole("table", { name: en["history.title"] });
  await expect(history.getByRole("row")).toHaveCount(4);
  const incomplete = history.getByRole("checkbox").first();
  await incomplete.focus();
  await page.keyboard.press("Space");
  await expect(incomplete).toBeChecked();
  await expect(incomplete).toHaveAccessibleDescription(en["history.help"]);
  await page.addStyleTag({
    content:
      "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }",
  });
  expect(await findOverflow(page)).toEqual([]);
  const { violations } = await new AxeBuilder({ page }).withRules(["target-size"]).analyze();
  expect(violations.map((result) => result.id)).toEqual([]);
});

test("backup reminders can be snoozed with a keyboard", async ({ page }) => {
  await seedAppState(page, "en", {}, { "2026-01-10": "medium" });
  await page.goto("/");
  const prompt = page.getByRole("complementary", { name: en["backup.title"] });
  await expect(prompt).toBeVisible();
  await prompt.getByRole("button", { name: en["backup.snooze"] }).focus();
  await page.keyboard.press("Enter");
  await expect(prompt).toHaveCount(0);
  await expect(page.getByRole("button", { name: en["today.cycleInsights"] })).toBeFocused();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`backup and populated history expose accessible controls in ${colorScheme} theme`, async ({ page }) => {
    await seedAppState(
      page,
      "en",
      {},
      Object.fromEntries(["2026-01-10", "2026-02-12", "2026-03-11", "2026-04-11"].map((day) => [day, "medium"])),
    );
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: en["backup.title"] })).toBeVisible();
    const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
    const promptResults = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(promptResults.violations, JSON.stringify(promptResults.violations)).toEqual([]);
    await page.getByRole("button", { name: en["today.cycleInsights"] }).click();
    await expect(page.getByRole("table", { name: en["history.title"] })).toBeVisible();
    // Measure settled text, after the finite entrance opacity animation.
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
    );
    const historyResults = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(historyResults.violations, JSON.stringify(historyResults.violations)).toEqual([]);
  });

  test(`off switch state remains visible in ${colorScheme} theme`, async ({ page }) => {
    await seedAppState(page, "en", { showFertility: false });
    await page.emulateMedia({ colorScheme });
    await page.goto("/settings");
    const contrast = await page.getByRole("switch", { name: en["settings.showFertility"] }).evaluate((control) => {
      function luminance(color: string) {
        const channels =
          color
            .match(/[\d.]+/g)
            ?.slice(0, 3)
            .map(Number) ?? [];
        const linear = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return (linear[0] ?? 0) * 0.2126 + (linear[1] ?? 0) * 0.7152 + (linear[2] ?? 0) * 0.0722;
      }
      const thumb = luminance(getComputedStyle(control, "::after").backgroundColor);
      const track = luminance(getComputedStyle(control).backgroundColor);
      return (Math.max(thumb, track) + 0.05) / (Math.min(thumb, track) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(3);
  });
}
