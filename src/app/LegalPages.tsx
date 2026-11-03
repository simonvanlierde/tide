import type { MessageKey } from "../i18n";

const SITE_TITLE = "tide";

// The pages rendered from docs/, by path. The host answers an unknown path with
// index.html, so each loads the app. The title stays English, like the text.
const PAGES: Record<string, { title: string; labelKey: MessageKey }> = {
  "/privacy": { title: "Privacy statement", labelKey: "legal.privacy" },
  "/accessibility": { title: "Accessibility statement", labelKey: "legal.accessibility" },
};

const TRAILING_SLASH = /\/$/;

function legalPage(pathname: string) {
  const path = pathname.replace(TRAILING_SLASH, "");
  const page = PAGES[path];
  return page ? { path, ...page } : undefined;
}

type LegalPageEntry = NonNullable<ReturnType<typeof legalPage>>;

export { type LegalPageEntry, legalPage, PAGES as LEGAL_PAGES, SITE_TITLE };
