import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";
import { seedAppState } from "./seed";

// vite preview sends no headers, so apply the Content-Security-Policy from the
// built _headers file, the one Cloudflare Pages serves, and fail on any violation.
// A service worker would answer later navigations from its cache, past the
// route that adds the header.
test.use({ serviceWorkers: "block" });

test("the built app runs under its own Content-Security-Policy", async ({ page }) => {
  const headersFile = await (await page.request.get("/_headers")).text();
  const policy = headersFile.match(/Content-Security-Policy:\s*(.+)/)?.[1];
  expect(policy).toContain("script-src 'self';");
  expect(policy).toContain("style-src 'self';");
  for (const name of [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    expect(headersFile, name).toMatch(new RegExp(`^\\s+${name}:`, "m"));
  }
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": policy as string },
    });
  });
  const violations: string[] = [];
  await page.exposeFunction("reportViolation", (text: string) => violations.push(text));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { reportViolation: (t: string) => void }).reportViolation(
        `${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  await seedAppState(page);

  for (const path of ROUTES) {
    const response = await page.goto(path);
    expect(response?.headers()["content-security-policy"]).toBe(policy);
    await expect(page.getByRole("main")).toBeVisible();
  }

  // Interactions that render dynamic content. Scrubbing the dial sets inline
  // transforms on its markers.
  await page.goto("/");
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

  // An injected inline <script> and <style> are both reported, so the listener
  // works and the policy really blocks inline scripts and styles.
  await page.evaluate(() => {
    const script = document.createElement("script");
    script.textContent = "void 0";
    document.head.append(script);
  });
  await expect.poll(() => violations).toEqual([expect.stringMatching(/^script-src-elem inline/)]);
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = "body { outline: 1px solid red; }";
    document.head.append(style);
  });
  await expect
    .poll(() => violations)
    .toEqual([expect.stringMatching(/^script-src-elem inline/), expect.stringMatching(/^style-src-elem inline/)]);
});

test("the built headers pin HTTPS for this host only", async ({ page }) => {
  const headersFile = await (await page.request.get("/_headers")).text();
  expect(headersFile).toMatch(/^\s*Strict-Transport-Security: max-age=31536000$/m);
});
