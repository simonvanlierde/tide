import { expect, test } from "@playwright/test";

type Image = { src: string; sizes: string; type?: string; purpose?: string; form_factor?: string };

test.use({ colorScheme: "light" });

test("the manifest is installable and its colours match the light tokens", async ({ page, context }) => {
  await page.goto("/");
  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  const bgTop = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg-top"));
  expect(manifest.theme_color).toBe(bgTop.trim());
  expect(manifest.background_color).toBe(bgTop.trim());
  expect(manifest.display).toBe("standalone");

  const cdp = await context.newCDPSession(page);
  expect((await cdp.send("Page.getInstallabilityErrors")).installabilityErrors).toEqual([]);
});

test("every manifest image exists at the size it declares", async ({ page }) => {
  await page.goto("/");
  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  const images: Image[] = [...manifest.icons, ...(manifest.screenshots ?? [])];
  for (const image of images) {
    const response = await page.request.get(image.src);
    expect(response.status(), image.src).toBe(200);
    const png = await response.body();
    // PNG header: width and height are the big-endian words at bytes 16 and 20.
    expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, image.src).toBe(image.sizes);
  }
});

test("the icons cover any, maskable and monochrome", async ({ page }) => {
  await page.goto("/");
  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  for (const purpose of ["any", "maskable", "monochrome"]) {
    const sizes = manifest.icons.filter((icon: Image) => icon.purpose === purpose).map((icon: Image) => icon.sizes);
    expect(sizes, purpose).toContain("512x512");
  }
});

test("the install dialog has a phone and a desktop screenshot", async ({ page }) => {
  await page.goto("/");
  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  const factors = manifest.screenshots.map((shot: Image) => shot.form_factor);
  expect(factors).toContain("narrow");
  expect(factors).toContain("wide");
});

// A worker that skips waiting swaps in mid-session and drops the previous build's lazy chunks
// under the open page. The new version must wait until every Tide window has closed.
test("a new service worker waits instead of taking over an open page", async ({ page }) => {
  await page.goto("/");
  const worker = await (await page.request.get("/sw.js")).text();
  // The one skipWaiting left answers a SKIP_WAITING message, which the app never sends.
  expect(worker.match(/skipWaiting/g)).toHaveLength(1);
  expect(worker).toMatch(/"SKIP_WAITING"===\w+\.data\.type&&self\.skipWaiting\(\)/);
});
