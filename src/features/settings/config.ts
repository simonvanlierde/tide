import type { LanguagePreference, ThemePreference } from "../../domain/types";
import type { MessageKey } from "../../i18n";

export const THEME_OPTIONS: { value: ThemePreference; labelKey: MessageKey }[] =
  [
    { value: "system", labelKey: "theme.system" },
    { value: "light", labelKey: "theme.light" },
    { value: "dark", labelKey: "theme.dark" },
  ];

export const LANGUAGE_OPTIONS: {
  value: LanguagePreference;
  labelKey: MessageKey;
}[] = [
  { value: "system", labelKey: "language.system" },
  { value: "en", labelKey: "language.en" },
  { value: "nl", labelKey: "language.nl" },
  { value: "de", labelKey: "language.de" },
  { value: "fr", labelKey: "language.fr" },
  { value: "es", labelKey: "language.es" },
];

export const REPOSITORY_URL = "https://github.com/simonvanlierde/tide";
