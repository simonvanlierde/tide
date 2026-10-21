import { useId } from "react";
import { useT } from "../../state/provider";

interface FertilityQuestionProps {
  onAnswer: (show: boolean) => void;
}

// Asked once, before any fertility estimate shows. Settings keeps the same
// switch for changing the answer later.
export function FertilityQuestion({ onAnswer }: FertilityQuestionProps) {
  const t = useT();
  const titleId = useId();
  return (
    <section className="utility-card" aria-labelledby={titleId}>
      <h2 id={titleId} className="section-title">
        {t("fertilityAsk.title")}
      </h2>
      <p className="supporting-note">{t("fertilityAsk.body")}</p>
      <div className="data-actions">
        <button type="button" className="secondary-action" onClick={() => onAnswer(true)}>
          {t("fertilityAsk.show")}
        </button>
        <button type="button" className="secondary-action" onClick={() => onAnswer(false)}>
          {t("fertilityAsk.hide")}
        </button>
      </div>
    </section>
  );
}
