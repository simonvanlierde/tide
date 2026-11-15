import { loadCatalog, SUPPORTED_LANGUAGES } from "../../src/i18n";

// The app loads one catalog at a time; the specs compare against all of them.
await Promise.all(SUPPORTED_LANGUAGES.map(loadCatalog));

export { SUPPORTED_LANGUAGES, translate } from "../../src/i18n";
