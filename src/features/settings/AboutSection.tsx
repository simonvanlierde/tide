import { CodeXml } from "lucide-react";
import { version } from "../../../package.json";
import { AppIcon } from "../../ui/icons";
import { INFORMATION_COPY, REPOSITORY_URL } from "./config";

export function AboutSection() {
  return (
    <article className="utility-card">
      <h2 className="section-title">About</h2>
      <div className="settings-group settings-group--compact">
        <p>{INFORMATION_COPY.logging}</p>
        <p className="supporting-note">{INFORMATION_COPY.fertility}</p>
        <p className="supporting-note">{INFORMATION_COPY.privacy}</p>
        <p className="colophon">
          <span className="colophon__copyright">
            © {new Date().getFullYear()} Simon van Lierde
          </span>
          <a
            className="colophon__link"
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={`Source code (v${version}), opens in a new tab`}
          >
            <AppIcon icon={CodeXml} className="colophon__icon" />
            <span className="colophon__version">v{version}</span>
          </a>
        </p>
      </div>
    </article>
  );
}
