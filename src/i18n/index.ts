import { setupI18n } from "@lingui/core";
import { messages as de } from "./locales/de.mjs";
import { messages as en } from "./locales/en.mjs";
import { messages as es } from "./locales/es.mjs";
import { messages as fr } from "./locales/fr.mjs";
import { messages as nl } from "./locales/nl.mjs";

// All five compiled catalogs ship in the app bundle for offline language changes.
const catalogs = { en, nl, de, fr, es };
export type SupportedLanguage = keyof typeof catalogs;
export type LanguagePreference = "system" | SupportedLanguage;
export const SUPPORTED_LANGUAGES = Object.keys(catalogs) as SupportedLanguage[];

// Separate instances keep simultaneous providers and exported text independent.
export const translators = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((locale) => [locale, setupI18n({ locale, messages: { [locale]: catalogs[locale] } })]),
) as Record<SupportedLanguage, ReturnType<typeof setupI18n>>;

export function resolveLanguage(pref: LanguagePreference): SupportedLanguage {
  if (pref !== "system") {
    return pref;
  }
  const base = typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "en";
  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage) ? (base as SupportedLanguage) : "en";
}

export function translate(lang: SupportedLanguage, key: string, vars?: Record<string, string | number>): string {
  return translators[lang]._(key, vars);
}
