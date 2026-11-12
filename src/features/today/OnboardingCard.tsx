import { X } from "lucide-react";
import { useId } from "react";
import { followAppLink } from "../../app/links";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { FertilityQuestion } from "./FertilityQuestion";

export function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  const titleId = useId();
  const t = useT();
  const state = useAppState();
  const actions = useAppStateActions();
  return (
    <section className="utility-card onboarding" aria-labelledby={titleId}>
      <div className="onboarding__heading">
        <h2 id={titleId}>{t("onboarding.title")}</h2>
        <button type="button" className="icon-close" aria-label={t("onboarding.dismiss")} onClick={onDismiss}>
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <p>{t("onboarding.privacy")}</p>
      {/* biome-ignore lint/a11y/useValidAnchor: same-app navigation retains a real import URL. */}
      <a className="onboarding__import" href="/settings#import" onClick={followAppLink}>
        {t("onboarding.import")}
      </a>
      <p>{t("onboarding.backup")}</p>
      <details className="onboarding__fertility">
        <summary>{t("onboarding.fertilitySummary")}</summary>
        <FertilityQuestion
          value={state.settings.showFertility}
          onAnswer={(show) => actions.setSetting("showFertility", show)}
        />
      </details>
    </section>
  );
}
