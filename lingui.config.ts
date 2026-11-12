import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  locales: ["en", "nl", "de", "fr", "es"],
  sourceLocale: "en",
  catalogs: [
    { path: "src/i18n/locales/{locale}", include: ["src"] },
    { path: "src/features/today/locales/{locale}", include: ["src/features/today"] },
  ],
  format: formatter({ origins: false, explicitIdAsDefault: true }),
  compileNamespace: "es",
});
