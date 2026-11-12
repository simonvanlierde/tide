import { expect, type Page, test } from "@playwright/test";
import { seedAppState } from "./seed";

async function backdropPixels(page: Page) {
  // Preserve each route's document height while sampling only its page ground.
  const hidden = await page.addStyleTag({ content: "body { visibility: hidden !important; }" });
  let screenshot: Buffer;
  try {
    screenshot = await page.screenshot();
  } finally {
    await hidden.evaluate((element) => element.parentNode?.removeChild(element));
  }
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    context.drawImage(image, 0, 0);
    return [100, 400, 700].map((y) => Array.from(context.getImageData(5, y, 1, 1).data));
  }, screenshot.toString("base64"));
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1280]) {
    test(`${theme} ground and navigation stay fixed between routes at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await seedAppState(page, "en", { theme });
      await page.goto("/calendar");
      const nav = page.locator(".tab-bar");
      const initialBox = await nav.boundingBox();
      const initialGround = await backdropPixels(page);

      for (const route of ["/settings", "/", "/calendar"]) {
        await nav.locator(`a[href="${route}"]`).click();
        await expect(page).toHaveURL(new RegExp(`${route === "/" ? "/" : route}$`));
        await expect(nav).toBeVisible();
        expect(await nav.boundingBox()).toEqual(initialBox);
        expect(await backdropPixels(page)).toEqual(initialGround);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        expect(await nav.boundingBox()).toEqual(initialBox);
        expect(await backdropPixels(page)).toEqual(initialGround);
      }
    });
  }
}
