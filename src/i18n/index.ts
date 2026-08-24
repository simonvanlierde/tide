import { de } from "./de";
import { type Dictionary, en, type MessageKey } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { nl } from "./nl";

// A language ships as one entry here. Adding a language = write xx.ts (same keys
// as en, enforced by the Dictionary type), register it here, and add it to
// LANGUAGE_OPTIONS in features/settings/config.ts. SupportedLanguage and the
// stored-preference union both widen automatically.
const DICTIONARIES = { en, nl, de, fr, es } satisfies Record<
  string,
  Dictionary
>;

export type SupportedLanguage = keyof typeof DICTIONARIES;
export type LanguagePreference = "system" | SupportedLanguage;

export const SUPPORTED_LANGUAGES = Object.keys(
  DICTIONARIES,
) as SupportedLanguage[];

// Resolve a stored preference to a real dictionary. "system" follows the
// browser (navigator.language, e.g. "en-GB" -> "en"); anything unknown falls
// back to English so a string is never missing.
export function resolveLanguage(pref: LanguagePreference): SupportedLanguage {
  if (pref !== "system") {
    return pref;
  }
  const base =
    typeof navigator !== "undefined"
      ? navigator.language.slice(0, 2).toLowerCase()
      : "en";
  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : "en";
}

// Fill {name} placeholders; an unmatched name is left visible so it's caught in dev.
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function translate(
  lang: SupportedLanguage,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[lang][key];
  return vars ? interpolate(template, vars) : template;
}

// Pick the plural form of a `${base}.one` / `${base}.other` key pair.
// NOTE: only valid for n ≥ 1, which is all our call sites (the "0 / today"
// cases have their own keys). en/nl/de/fr/es all use "one" only for exactly 1,
// so a full Intl.PluralRules isn't needed here.
export function plural<K extends string>(
  base: K,
  n: number,
): `${K}.one` | `${K}.other` {
  return `${base}.${n === 1 ? "one" : "other"}`;
}

export type { MessageKey } from "./en";
