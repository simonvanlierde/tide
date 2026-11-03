const SITE_TITLE = "tide";

// The pages rendered from docs/, by path. The host answers an unknown path with
// index.html, so each loads the app.
const PAGES: Record<string, { title: string }> = {
  "/accessibility": { title: "Accessibility statement" },
  "/privacy": { title: "Privacy statement" },
};

const TRAILING_SLASH = /\/$/;

function currentPage() {
  return PAGES[window.location.pathname.replace(TRAILING_SLASH, "")];
}

function LegalFooter({ showHome }: { showHome: boolean }) {
  const page = currentPage();

  return (
    <footer className="legal-footer">
      <nav lang="en" aria-label="About this site">
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

export { currentPage as currentLegalPage, LegalFooter, SITE_TITLE };
