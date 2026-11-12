import { describe, expect, it } from "vitest";
import html from "../../index.html?raw";
import script from "../../public/theme.js?raw";
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "../../src/data/schema";

// The pre-paint theme script is a plain file under public/, outside the bundle,
// so it can't import the key; it carries a copy instead.
describe("public/theme.js", () => {
  function applyTheme() {
    runInNewContext(script, { localStorage, document, window: { matchMedia: () => ({ matches: false }) } });
    return document.documentElement.dataset.theme;
  }

  it("uses the legacy theme only before the current record exists", () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ settings: { theme: "dark" } }));
    expect(applyTheme()).toBe("dark");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: { theme: "light" } }));
    expect(applyTheme()).toBe("light");
    localStorage.setItem(STORAGE_KEY, "broken");
    expect(applyTheme()).toBe("light");
  });
  it("reads the theme from the same storage key as the app", () => {
    expect(script).toContain(`localStorage.getItem("${STORAGE_KEY}")`);
  });

  it("is loaded by index.html as a blocking script", () => {
    expect(html).toContain('<script src="/theme.js"></script>');
  });
});

// biome-ignore lint/correctness/noNodejsModules: the blocking browser script runs in an isolated test context.
import { runInNewContext } from "node:vm";
