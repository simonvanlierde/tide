import { useEffect } from "react";
import accessibility from "../../docs/accessibility.md";
import privacy from "../../docs/privacy.md";
import { currentLegalPage, LegalFooter, SITE_TITLE } from "./LegalPages";

const HTML: Record<string, string> = { "Accessibility statement": accessibility, "Privacy statement": privacy };

// Its own chunk: the pages' text is not needed to run the app, and would take the
// main chunk over the bundle budget.
export default function LegalPage() {
  const page = currentLegalPage();

  useEffect(() => {
    if (page) {
      document.title = `${page.title} · ${SITE_TITLE}`;
    }
  }, [page]);

  if (!page) {
    return null;
  }

  return (
    <div className="app-shell legal-page">
      <main className="app-main">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: our own Markdown, rendered at build time */}
        <article lang="en" dangerouslySetInnerHTML={{ __html: HTML[page.title] ?? "" }} />
      </main>
      <LegalFooter showHome />
    </div>
  );
}
