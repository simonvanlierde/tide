import { INFORMATION_COPY } from "./config";

export function InformationSection() {
  return (
    <article className="utility-card">
      <h2 className="section-title">Information</h2>
      <div className="settings-group settings-group--compact">
        <p>{INFORMATION_COPY.logging}</p>
        <p className="supporting-note">{INFORMATION_COPY.fertility}</p>
        <p className="supporting-note">{INFORMATION_COPY.privacy}</p>
      </div>
    </article>
  );
}
