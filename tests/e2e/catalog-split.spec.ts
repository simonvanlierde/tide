import { expect, test } from "@playwright/test";
import { SUPPORTED_LANGUAGES, translate } from "./i18n";
import { seedAppState } from "./seed";

// A sentence long enough that no UI code or other catalog repeats it.
const MARKER = "error.body";
const CATALOG_CHUNK = /\/assets\/(en|nl|de|fr|es)-[\w-]+\.js$/;

for (const language of SUPPORTED_LANGUAGES) {
  test(`first load in ${language} fetches only that catalog`, async ({ page }) => {
    await seedAppState(page, language);
    const scripts = new Map<string, string>();
    page.on("response", async (response) => {
      if (response.url().endsWith(".js") && response.url().includes("/assets/")) {
        scripts.set(response.url(), await response.text());
      }
    });
    await page.goto("/");
    await expect(page.locator('.tab-bar a[href="/"]')).toHaveText(translate(language, "nav.today"));
    await expect(page.locator("body")).not.toContainText("nav.today");

    const catalogs = [...scripts.keys()].filter((url) => CATALOG_CHUNK.test(url));
    expect(catalogs.map((url) => url.match(CATALOG_CHUNK)?.[1])).toEqual([language]);
    // The main chunk holds none of the five catalogs.
    const main = [...scripts].filter(([url]) => !CATALOG_CHUNK.test(url)).map(([, text]) => text);
    for (const other of SUPPORTED_LANGUAGES) {
      for (const text of main) {
        expect(text).not.toContain(translate(other, MARKER));
      }
    }
  });
}
