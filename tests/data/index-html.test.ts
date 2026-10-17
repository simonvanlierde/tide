import { describe, expect, it } from "vitest";
import html from "../../index.html?raw";
import { STORAGE_KEY } from "../../src/data/schema";

// The pre-paint theme script in index.html is inline and hashed into the CSP
// at build time, so it can't import the key; it carries a copy instead.
describe("index.html", () => {
  it("reads the theme from the same storage key as the app", () => {
    expect(html).toContain(`localStorage.getItem("${STORAGE_KEY}")`);
  });
});
