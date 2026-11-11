// Renders public/og.png. Step 1 captures the real cycle dial from the app (served by Vite,
// "today" pinned, sample cycles seeded) to docs/og-ring.png; step 2 screenshots docs/og-card.html.
// Run `pnpm og-card` (Playwright Chromium needed).
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const NOW = new Date("2026-07-16T12:00:00Z"); // cycle day 14 of a 28-day cycle
// Three 28-day cycles, each a five-day period tapering from heavy to spotting.
const FLOW = ["heavy", "heavy", "medium", "light", "spotting"];
const STARTS = ["2026-05-08", "2026-06-05", "2026-07-03"];
const intensityByDay = Object.fromEntries(
  STARTS.flatMap((start) =>
    FLOW.map((flow, i) => [new Date(Date.parse(start) + i * 864e5).toISOString().slice(0, 10), flow]),
  ),
);

const server = await createServer({ root, server: { port: 4181, strictPort: true }, logLevel: "error" });
await server.listen();
// The app's own defaults and storage key, so the seeded blob always matches this build's schema.
const { defaultAppState, SCHEMA_VERSION, STORAGE_KEY } = await server.ssrLoadModule("/src/data/schema.ts");
const seed = {
  ...defaultAppState,
  schemaVersion: SCHEMA_VERSION,
  intensityByDay,
  settings: { ...defaultAppState.settings, showFertility: true },
};
const browser = await chromium.launch();
try {
  // 3x so the ring stays sharp when the card scales it up.
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.clock.setFixedTime(NOW);
  await page.addInitScript(([key, state]) => localStorage.setItem(key, JSON.stringify(state)), [STORAGE_KEY, seed]);
  await page.goto("http://127.0.0.1:4181/");
  const dial = page.locator(".cycle-dial__frame");
  await dial.waitFor();
  // Keep only the dial, on no ground, so the card's own ground shows behind the ring's soft shadow.
  await page.addStyleTag({
    content:
      "html,body,#root{background:none!important} body *{visibility:hidden} .cycle-dial__frame,.cycle-dial__frame *{visibility:visible}",
  });
  const box = await dial.boundingBox();
  const pad = 56;
  await page.screenshot({
    path: `${root}docs/og-ring.png`,
    omitBackground: true,
    clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad },
  });
  await context.close();

  const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await card.goto(`file://${root}docs/og-card.html`);
  await card.evaluate(() => document.fonts.ready);
  await card.screenshot({ path: `${root}public/og.png` });
} finally {
  await browser.close();
  await server.close();
}
