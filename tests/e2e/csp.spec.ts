import { expect, test } from "@playwright/test";
import { seedAppState } from "./seed";

// The preview server sends no headers, so apply the Content-Security-Policy
// that the build wrote for Cloudflare Pages and fail on any violation.
// A service worker would answer later navigations from its cache, past the
// route that adds the header.
test.use({ serviceWorkers: "block" });

test("the built app runs under its own Content-Security-Policy", async ({
  page,
}) => {
  const headersFile = await (await page.request.get("/_headers")).text();
  const policy = headersFile.match(/Content-Security-Policy:\s*(.+)/)?.[1];
  expect(policy).toContain("style-src 'self';");
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy": policy as string,
      },
    });
  });
  const violations: string[] = [];
  await page.exposeFunction("reportViolation", (text: string) =>
    violations.push(text),
  );
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (
        window as unknown as { reportViolation: (t: string) => void }
      ).reportViolation(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  await seedAppState(page);

  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toBe(policy);
  // Scrubbing the dial sets inline transforms on its markers.
  const dial = page.getByRole("slider");
  await dial.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: /cycle insights/i }).click();
  await page.keyboard.press("Escape");

  await page.goto("/calendar");
  await page.locator(".calendar-grid__day.is-logged").first().click();

  await page.goto("/settings");
  await page.getByRole("button", { name: /^dark$/i }).click();

  expect(violations).toEqual([]);

  // An injected <style> element is reported, so the listener works and the
  // policy really leaves inline styles out.
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = "body { outline: 1px solid red; }";
    document.head.append(style);
  });
  await expect
    .poll(() => violations)
    .toEqual([expect.stringMatching(/^style-src-elem inline/)]);
});

test("the built headers pin HTTPS for this host only", async ({ page }) => {
  const headersFile = await (await page.request.get("/_headers")).text();
  expect(headersFile).toMatch(
    /^\s*Strict-Transport-Security: max-age=31536000$/m,
  );
});
