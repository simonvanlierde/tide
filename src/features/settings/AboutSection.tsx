import { version } from "../../../package.json";
import { INFORMATION_COPY, REPOSITORY_URL } from "./config";

export function AboutSection() {
  return (
    <article className="utility-card">
      <h2 className="section-title">About</h2>
      <div className="settings-group settings-group--compact">
        <p>{INFORMATION_COPY.logging}</p>
        <p className="supporting-note">{INFORMATION_COPY.fertility}</p>
        <p className="supporting-note">{INFORMATION_COPY.privacy}</p>
        <p className="supporting-note">
          Tide v{version} ·{" "}
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </p>
      </div>
    </article>
  );
}
