import { readFileSync } from "node:fs";
import process from "node:process";
import { test } from "@playwright/test";
import { seedAppState } from "../e2e/seed";

test.skip(!process.env.PWA_ASSETS, "run through just ts-pwa-assets");

// `just ts-pwa-assets` runs this (it skips otherwise, so ts-shots leaves public/ alone): it rewrites the install assets in public/ from the
// current build. The monochrome icon is the ring and dot of icon.svg on a transparent
// ground; Android recolours it by its alpha channel. The screenshots show a seeded cycle.
test("monochrome icon", async ({ browser }) => {
  const svg = readFileSync("public/icons/icon.svg", "utf8")
    .replace(/<defs>[\s\S]*<\/defs>/, "")
    .replace(/<rect[^>]*\/>/, "")
    .replaceAll(/#2f8f8a|#e26d5a/g, "#000");
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page.setContent(`<style>body{margin:0}</style>${svg}`);
  await page.screenshot({ path: "public/icons/icon-monochrome-512.png", omitBackground: true });
});

for (const [name, path, viewport, deviceScaleFactor] of [
  ["today-narrow", "/", { width: 390, height: 844 }, 2],
  ["calendar-narrow", "/calendar", { width: 390, height: 844 }, 2],
  ["today-wide", "/", { width: 1280, height: 800 }, 1],
] as const) {
  test(`screenshot ${name}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor, colorScheme: "light" });
    const page = await context.newPage();
    await seedAppState(page);
    await page.goto(path);
    await page.getByRole("main").waitFor();
    await page.screenshot({ path: `public/screenshots/${name}.png` });
    await context.close();
  });
}
