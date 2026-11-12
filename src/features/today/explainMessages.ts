import { setupI18n } from "@lingui/core";
import { messages as de } from "./locales/de.mjs";
import { messages as en } from "./locales/en.mjs";
import { messages as es } from "./locales/es.mjs";
import { messages as fr } from "./locales/fr.mjs";
import { messages as nl } from "./locales/nl.mjs";

// These catalogs stay in the forecast sheet's lazy chunk, precached for offline use.
const catalogs = { en, nl, de, fr, es };
export const explainTranslators = Object.fromEntries(
  Object.entries(catalogs).map(([locale, messages]) => [
    locale,
    setupI18n({ locale, messages: { [locale]: messages } }),
  ]),
) as Record<keyof typeof catalogs, ReturnType<typeof setupI18n>>;
