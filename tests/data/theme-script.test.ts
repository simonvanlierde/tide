import { describe, expect, it } from "vitest";
import html from "../../index.html?raw";
import script from "../../public/theme.js?raw";
import { STORAGE_KEY } from "../../src/data/schema";

// The pre-paint theme script is a plain file under public/, outside the bundle,
// so it can't import the key; it carries a copy instead.
describe("public/theme.js", () => {
  it("reads the theme from the same storage key as the app", () => {
    expect(script).toContain(`localStorage.getItem("${STORAGE_KEY}")`);
  });

  it("is loaded by index.html as a blocking script", () => {
    expect(html).toContain('<script src="/theme.js"></script>');
  });
});
