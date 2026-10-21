import type { LanguagePreference, ThemePreference } from "../../domain/types";
import { type MessageKey, SUPPORTED_LANGUAGES } from "../../i18n";

export const THEME_OPTIONS: { value: ThemePreference; labelKey: MessageKey }[] = [
  { value: "system", labelKey: "theme.system" },
  { value: "light", labelKey: "theme.light" },
  { value: "dark", labelKey: "theme.dark" },
];

export const LANGUAGE_OPTIONS = (["system", ...SUPPORTED_LANGUAGES] as LanguagePreference[]).map((value) => ({
  value,
  labelKey: `language.${value}` as const,
}));

export const REPOSITORY_URL = "https://github.com/simonvanlierde/tide";
