import { expect, test } from "@playwright/test";
import { defaultAppState, SCHEMA_VERSION } from "../../src/data/schema";
import { SUPPORTED_LANGUAGES, translate } from "./i18n";
import { seedAppState } from "./seed";

const backup = {
  schemaVersion: SCHEMA_VERSION,
  ...defaultAppState,
  intensityByDay: { "2026-03-01": "light", "2026-03-02": "medium" },
};

for (const lang of SUPPORTED_LANGUAGES) {
  for (const dialog of ["import", "reset"] as const) {
    test(`the ${dialog} dialog does not move when the backup is saved (${lang}, 320px)`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await seedAppState(page, lang);
      await page.goto("/settings");
      if (dialog === "import") {
        await page.locator('input[type="file"]').setInputFiles({
          name: "backup.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(backup)),
        });
      } else {
        await page.getByRole("button", { name: translate(lang, "settings.reset") }).click();
      }
      const box = page.getByRole("dialog");
      await expect(box).toBeVisible();
      const buttons = box.locator(".confirm-dialog__actions button");
      const measure = () =>
        Promise.all([buttons.nth(0).boundingBox(), buttons.nth(1).boundingBox(), box.boundingBox()]);
      const before = await measure();
      await box.getByRole("button", { name: translate(lang, "settings.backupFirst") }).click();
      await expect(box.getByRole("status")).toHaveText(translate(lang, "settings.exportSuccess"));
      const after = await measure();
      expect(after).toEqual(before);
    });
  }
}
