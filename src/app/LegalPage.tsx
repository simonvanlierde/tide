import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import accessibility from "../../docs/accessibility.md";
import privacy from "../../docs/privacy.md";
import { useT } from "../state/provider";
import { AppIcon } from "../ui/icons";
import { type LegalPageEntry, SITE_TITLE } from "./LegalPages";
import { followAppLink } from "./navigation";

const HTML: Record<string, string> = { "/accessibility": accessibility, "/privacy": privacy };

// Its own chunk: the pages' text is not needed to run the app, and would take the
// main chunk over the bundle budget.
export default function LegalPage({ page: { path, title } }: { page: LegalPageEntry }) {
  const t = useT();

  useEffect(() => {
    const appTitle = document.title;
    document.title = `${title} · ${SITE_TITLE}`;
    return () => {
      document.title = appTitle;
    };
  }, [title]);

  return (
    <section className="utility-screen">
      <a href="/settings" className="back-link" onClick={followAppLink}>
        <AppIcon icon={ChevronLeft} className="back-link__icon" />
        {t("nav.settings")}
      </a>
      <article
        lang="en"
        className="utility-card legal-document"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: our own Markdown, rendered at build time
        dangerouslySetInnerHTML={{ __html: HTML[path] ?? "" }}
      />
    </section>
  );
}
