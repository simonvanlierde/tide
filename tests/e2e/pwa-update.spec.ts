import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { expect, test } from "@playwright/test";

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

let root = "";
let server: Server;
let origin = "";
let versionA = "";
let versionB = "";

test.beforeAll(async () => {
  // Version A is the production build the web server just made; B is a copy whose worker
  // script differs by one byte, which is all a browser needs to see a new version.
  root = await mkdtemp(join(tmpdir(), "tide-update-"));
  versionA = join(root, "a");
  versionB = join(root, "b");
  await cp("dist", versionA, { recursive: true });
  await cp("dist", versionB, { recursive: true });
  const worker = join(versionB, "sw.js");
  await writeFile(worker, `${await readFile(worker, "utf8")}\n// version B\n`);
  let current = versionA;
  server = createServer(async (request, response) => {
    const path = normalize(new URL(request.url ?? "/", "http://x").pathname);
    if (path === "/__serve-b") {
      current = versionB;
      response.end("ok");
      return;
    }
    // Same as the Worker: unknown paths get the app shell. The worker must never be cached.
    const file = extname(path) ? join(current, path) : join(current, "index.html");
    try {
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": TYPES[extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  server.close();
  await rm(root, { recursive: true, force: true });
});

test("a new version waits behind a prompt, and Reload applies it once", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-04-15T12:00:00Z") });
  await page.goto(origin);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
      });
    }
  });
  // The page that sees the update was itself loaded under version A's worker, as a returning user's is.
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  const status = page.getByRole("status");
  await expect(status).toBeEmpty();
  await page.evaluate(() => {
    (window as unknown as { stillHere: boolean }).stillHere = true;
  });

  // Serve B, then resume the page an hour later: an installed phone app is resumed, not navigated.
  await page.request.get(`${origin}/__serve-b`);
  await page.clock.fastForward("01:00:05");
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

  const reload = status.getByRole("button", { name: "Reload" });
  await expect(status).toContainText("A new version is ready");
  const box = await reload.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  // Never automatic: the page is still the one that loaded version A.
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { stillHere?: boolean }).stillHere)).toBe(true);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["tide.period-tracker.state.v1"]);

  await Promise.all([page.waitForEvent("load"), reload.click()]);
  await expect(page.getByRole("status")).toBeEmpty();
  expect(await page.evaluate(() => (window as unknown as { stillHere?: boolean }).stillHere)).toBeUndefined();
  const script = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return fetch(registration?.active?.scriptURL ?? "").then((r) => r.text());
  });
  expect(script).toContain("version B");
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
});
