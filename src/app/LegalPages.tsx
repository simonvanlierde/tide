import { useEffect } from "react";
import accessibility from "../../docs/accessibility.md";
import privacy from "../../docs/privacy.md";

const SITE_TITLE = "tide";

// The pages rendered from docs/, by path. The host answers an unknown path with
// index.html, so each loads the app.
const PAGES: Record<string, { title: string; html: string }> = {
  "/accessibility": { title: "Accessibility statement", html: accessibility },
  "/privacy": { title: "Privacy statement", html: privacy },
};

const TRAILING_SLASH = /\/$/;

function currentPage() {
  return PAGES[window.location.pathname.replace(TRAILING_SLASH, "")];
}

function LegalFooter({ showHome }: { showHome: boolean }) {
  const page = currentPage();

  return (
    <footer className="legal-footer">
      <nav aria-label="About this site">
        {showHome ? <a href="/">{SITE_TITLE}</a> : null}
        {Object.entries(PAGES).map(([path, { title }]) => (
          <a key={path} href={path} aria-current={PAGES[path] === page ? "page" : undefined}>
            {title}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function LegalPage() {
  const page = currentPage();

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
        <article dangerouslySetInnerHTML={{ __html: page.html }} />
      </main>
      <LegalFooter showHome />
    </div>
  );
}

export { currentPage as currentLegalPage, LegalFooter, LegalPage };
