import { describe, expect, it, vi } from "vitest";
import { interpolate, plural, resolveLanguage, SUPPORTED_LANGUAGES, translate } from "../../src/i18n";

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

  it("picks the plural form by each language's rules", () => {
    expect(plural("k", 1.5, "fr")).toBe("k.one");
    expect(plural("k", 1.5, "en")).toBe("k.other");
    // French and Spanish "many" has no key of its own.
    expect(plural("k", 1_000_000, "es")).toBe("k.other");
  });

  it("keeps the old forms for whole days in every language", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const n of [1, 2, 5, 21, 101, 1_000_000]) {
        expect(plural("k", n, lang)).toBe(n === 1 ? "k.one" : "k.other");
      }
    }
  });
});
