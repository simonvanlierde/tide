import { useT } from "../../state/provider";

interface FertilityQuestionProps {
  value: boolean | null;
  onAnswer: (show: boolean) => void;
}

// Dismissing the introduction never substitutes for an explicit fertility choice.
export function FertilityQuestion({ value, onAnswer }: FertilityQuestionProps) {
  const t = useT();
  return (
    <fieldset className="onboarding__choices">
      <legend className="visually-hidden">{t("fertilityAsk.title")}</legend>
      <p>{t("fertilityAsk.body")}</p>
      <div className="data-actions">
        <button type="button" className="secondary-action" aria-pressed={value === true} onClick={() => onAnswer(true)}>
          {t("fertilityAsk.show")}
        </button>
        <button
          type="button"
          className="secondary-action"
          aria-pressed={value === false}
          onClick={() => onAnswer(false)}
        >
          {t("fertilityAsk.hide")}
        </button>
      </div>
    </fieldset>
  );
}
