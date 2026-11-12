import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
import { findOverflow } from "./overflow";
import { FIXED_NOW, seedAppState } from "./seed";

for (const colorScheme of ["light", "dark"] as const) {
  for (const language of SUPPORTED_LANGUAGES) {
    test(`${colorScheme} ${language}: first-run card leaves logging above the tabs at 320 × 568`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.emulateMedia({ colorScheme });
      await seedAppState(page, language, { onboardingDismissed: false, showFertility: null }, {});
      await page.goto("/");
      const card = page.getByRole("region", { name: translate(language, "onboarding.title") });
      const log = page.getByRole("button", { name: translate(language, "log.add"), exact: true });
      await expect(card).toBeVisible();
      await expect(page.getByRole("slider")).toHaveCount(0);
      await expect(log).toBeInViewport({ ratio: 1 });
      const past = page.getByRole("link", { name: translate(language, "calendar.logRange"), exact: true });
      await expect(past).toBeInViewport({ ratio: 1 });
      const pastBox = await past.boundingBox();
      const cardBox = await card.boundingBox();
      const logBox = await log.boundingBox();
      const tabsBox = await page.getByRole("navigation").boundingBox();
      expect(cardBox).not.toBeNull();
      expect(logBox).not.toBeNull();
      expect(tabsBox).not.toBeNull();
      expect((cardBox?.y ?? 0) + (cardBox?.height ?? 0)).toBeLessThanOrEqual(logBox?.y ?? 0);
      expect((logBox?.y ?? 0) + (logBox?.height ?? 0)).toBeLessThan(tabsBox?.y ?? 0);
      expect((pastBox?.y ?? 0) + (pastBox?.height ?? 0)).toBeLessThan(tabsBox?.y ?? 0);
      expect(await findOverflow(page)).toEqual([]);
      await log.click();
      await expect(card).toHaveCount(0);
      await expect(page.getByRole("radio").first()).toBeFocused();
    });
  }
}

test("skipping introduction persists without enabling fertility or adding storage keys", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/");
  const card = page.getByRole("region", { name: "Your history stays here" });
  await card.getByRole("button", { name: "Skip introduction" }).click();
  await expect(card).toHaveCount(0);
  await page.reload();
  await expect(card).toHaveCount(0);
  const stored = await page.evaluate(() => ({
    keys: Object.keys(localStorage),
    settings: JSON.parse(localStorage.getItem("tide.period-tracker.state.v1") ?? "{}").settings,
  }));
  expect(stored.keys).toEqual(["tide.period-tracker.state.v1"]);
  expect(stored.settings).toMatchObject({ onboardingDismissed: true, showFertility: null });
});

test("a first log removes introduction across reload and later removal", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/");
  await page.getByRole("button", { name: "Log bleeding today", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /logged today/i }).click();
  await page.getByRole("button", { name: translate("en", "calendar.notBleeding"), exact: true }).click();
  await expect(page.getByRole("region", { name: "Your history stays here" })).toHaveCount(0);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme}: the introduction and fertility choices are accessible`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Your history stays here" })).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .include(".today-screen")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(violations.map((violation) => violation.id)).toEqual([]);
    const card = page.getByRole("region", { name: "Your history stays here" });
    await card.locator("summary").click();
    for (const name of ["Show", "Don't show"]) {
      const choice = card.getByRole("button", { name, exact: true });
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choice).toHaveCSS("background-color", "rgb(31, 106, 101)");
      await expect(choice).toHaveCSS("color", "rgb(255, 255, 255)");
      const selected = await new AxeBuilder({ page })
        .include(".today-screen")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(selected.violations.map((violation) => violation.id)).toEqual([]);
    }
  });
}

test("expanded fertility choice fits a narrow screen with enlarged text", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  const card = page.getByRole("region", { name: "Your history stays here" });
  await card.locator("summary").click();
  await expect(card.getByRole("button", { name: "Show", exact: true })).toBeVisible();
  await expect(card.getByRole("button", { name: "Don't show", exact: true })).toBeVisible();
  expect(await findOverflow(page)).toEqual([]);
});

test("the past-period path opens Calendar without logging today", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/");
  await page.getByRole("link", { name: "Log a past period", exact: true }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await expect(page.getByRole("table", { name: translate("en", "calendar.title") })).toBeVisible();
  const days = await page.evaluate(
    () => JSON.parse(localStorage.getItem("tide.period-tracker.state.v1") ?? "{}").intensityByDay ?? {},
  );
  expect(days).toEqual({});
});

test("opening the day editor respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(() => {
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (this.classList.contains("day-editor"))
        this.setAttribute("data-scroll-behavior", typeof options === "object" ? (options.behavior ?? "auto") : "auto");
      original.call(this, options);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Log bleeding today", exact: true }).click();
  await expect(page.getByRole("region", { name: "April 15, 2026", exact: true })).toHaveAttribute(
    "data-scroll-behavior",
    "auto",
  );
});
