import { describe, expect, it, vi } from "vitest";
import { resolveLanguage, SUPPORTED_LANGUAGES, translate } from "../../src/i18n";

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

  it("renders ICU plurals with each locale's rules", () => {
    expect(translate("fr", "today.inDays", { n: 1.5 })).toBe("Dans 1.5 jour");
    expect(translate("en", "today.inDays", { n: 1.5 })).toBe("In 1.5 days");
    expect(translate("es", "today.inDays", { n: 1_000_000 })).toBe("En 1000000 días");
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(translate(lang, "today.inDays", { n: 1 })).not.toBe(translate(lang, "today.inDays", { n: 2 }));
    }
  });
});
