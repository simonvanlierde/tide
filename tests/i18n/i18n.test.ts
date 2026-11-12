import { describe, expect, it, vi } from "vitest";
import { resolveLanguage, translate } from "../../src/i18n";

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
    expect(translate("fr", "today.periodInDays", { n: 1.5 })).toBe("Règles dans 1.5 jour");
    expect(translate("en", "today.periodInDays", { n: 1.5 })).toBe("Period in 1.5 days");
    expect(translate("es", "today.periodInDays", { n: 1_000_000 })).toBe("Período en 1000000 días");
  });

  it.each([
    ["en", "Period in 1 day", "Period in 2 days"],
    ["nl", "Menstruatie over 1 dag", "Menstruatie over 2 dagen"],
    ["de", "Periode in 1 Tag", "Periode in 2 Tagen"],
    ["fr", "Règles dans 1 jour", "Règles dans 2 jours"],
    ["es", "Período en 1 día", "Período en 2 días"],
  ] as const)("selects singular and plural forms in %s", (lang, singular, plural) => {
    expect(translate(lang, "today.periodInDays", { n: 1 })).toBe(singular);
    expect(translate(lang, "today.periodInDays", { n: 2 })).toBe(plural);
  });
});
