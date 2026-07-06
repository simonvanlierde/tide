import { version } from "../../../package.json";
import { REPOSITORY_URL } from "./config";

export function AboutSection() {
  return (
    <article className="utility-card">
      <h2 className="section-title">About</h2>
      <div className="settings-group settings-group--compact">
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
