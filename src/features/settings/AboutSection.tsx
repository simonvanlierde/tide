import { CodeXml } from "lucide-react";
import { version } from "../../../package.json";
import { useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { REPOSITORY_URL } from "./config";

export function AboutSection() {
  const t = useT();
  return (
    <article className="utility-card">
      <h2 className="section-title">{t("settings.about")}</h2>
      <div className="settings-group settings-group--compact">
        <p className="supporting-note">{t("settings.fertilityDisclaimer")}</p>
        <p className="colophon">
          <span className="colophon__copyright">
            © {new Date().getFullYear()} Simon van Lierde
          </span>
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
