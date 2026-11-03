import { ChevronRight, CodeXml } from "lucide-react";
import { version } from "../../../package.json";
import { LEGAL_PAGES } from "../../app/LegalPages";
import { followAppLink } from "../../app/navigation";
import { useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { REPOSITORY_URL } from "./config";

export function AboutSection() {
  const t = useT();
  const inEnglish = useLocale() === "en" ? null : t("legal.inEnglish");
  return (
    <article className="utility-card">
      <h2 className="section-title">{t("settings.about")}</h2>
      <div className="settings-group settings-group--compact">
        <p className="supporting-note">{t("settings.fertilityDisclaimer")}</p>
        <ul className="link-rows">
          {Object.entries(LEGAL_PAGES).map(([path, { labelKey }]) => (
            <li key={path}>
              <a className="fact-list__more" href={path} hrefLang="en" onClick={followAppLink}>
                <span className="link-rows__text">
                  {t(labelKey)}
                  {inEnglish ? <span className="fact__meta">{inEnglish}</span> : null}
                </span>
                <AppIcon icon={ChevronRight} className="fact-list__more-icon" />
              </a>
            </li>
          ))}
        </ul>
        <p className="colophon">
          <span className="colophon__copyright">© {new Date().getFullYear()} Simon van Lierde</span>
          <a
            className="colophon__link"
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("settings.sourceCode", { version })}
          >
            <AppIcon icon={CodeXml} className="colophon__icon" />
            <span className="colophon__version">v{version}</span>
          </a>
        </p>
      </div>
    </article>
  );
}
