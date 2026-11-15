import { setupI18n } from "@lingui/core";

// Each catalog is its own chunk, loaded when its language is first used. The service worker
// precaches every chunk, so switching language still works offline.
const loaders = {
  en: () => import("./locales/en.mjs"),
  nl: () => import("./locales/nl.mjs"),
  de: () => import("./locales/de.mjs"),
  fr: () => import("./locales/fr.mjs"),
  es: () => import("./locales/es.mjs"),
};
export type SupportedLanguage = keyof typeof loaders;
export type LanguagePreference = "system" | SupportedLanguage;
export const SUPPORTED_LANGUAGES = Object.keys(loaders) as SupportedLanguage[];

// Separate instances keep simultaneous providers and exported text independent.
// A translator has no locale, and throws when called, until loadCatalog resolves for its language.
export const translators = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((locale) => [locale, setupI18n({ locale })]),
) as Record<SupportedLanguage, ReturnType<typeof setupI18n>>;

const loaded = new Set<SupportedLanguage>();

export function isCatalogLoaded(lang: SupportedLanguage) {
  return loaded.has(lang);
}

export async function loadCatalog(lang: SupportedLanguage) {
  if (!loaded.has(lang)) {
    translators[lang].loadAndActivate({ locale: lang, messages: (await loaders[lang]()).messages });
    loaded.add(lang);
  }
}

export function resolveLanguage(pref: LanguagePreference): SupportedLanguage {
  if (pref !== "system") {
    return pref;
  }
  const base = typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "en";
  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage) ? (base as SupportedLanguage) : "en";
}

// The catalog for `lang` must be loaded first.
export function translate(lang: SupportedLanguage, key: string, vars?: Record<string, string | number>): string {
  return translators[lang]._(key, vars);
}
