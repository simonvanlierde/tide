import { expect, test } from "@playwright/test";

// Start online once; the service worker must cache lazy legal pages before they are opened.
test("legal pages and Settings work offline after the first visit", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
      });
    }
  });
  await context.setOffline(true);

  await page.goto("/settings");
  for (const [path, title] of [
    ["/privacy", "Privacy statement"],
    ["/accessibility", "Accessibility statement"],
  ] as const) {
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("article").getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator('.tab-bar a[href="/settings"]')).toHaveAttribute("aria-current", "true");
    await page.reload();
    await expect(page.locator("article").getByRole("heading", { level: 1 })).toHaveText(title);
    await page.locator(".back-link").click();
    await expect(page).toHaveURL(/\/settings$/);
  }
});
