import { describe, expect, it, vi } from "vitest";
import { interpolate, resolveLanguage, translate } from "../../src/i18n";

describe("i18n", () => {
  it("resolves a concrete preference verbatim", () => {
    expect(resolveLanguage("en")).toBe("en");
  });

  it("follows the browser locale when set to system", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("en-GB");
    expect(resolveLanguage("system")).toBe("en");
  });

  it("matches a supported browser locale ignoring region", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
    expect(resolveLanguage("system")).toBe("fr");
  });

  it("falls back to en for an unsupported browser locale", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("ja-JP");
    expect(resolveLanguage("system")).toBe("en");
  });

  it("translates a known key per language", () => {
    expect(translate("en", "settings.theme")).toBe("Theme");
    expect(translate("de", "settings.theme")).toBe("Design");
    expect(translate("es", "settings.language")).toBe("Idioma");
  });

  it("interpolates {name} placeholders and leaves unknown ones visible", () => {
    expect(interpolate("Day {n}", { n: 3 })).toBe("Day 3");
    expect(interpolate("Hi {who}", {})).toBe("Hi {who}");
  });
});
