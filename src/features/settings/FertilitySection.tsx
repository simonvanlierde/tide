import { useAppState, useAppStateActions } from "../../state/provider";

const FERTILITY_OPTIONS = [
  { show: true, label: "Show" },
  { show: false, label: "Hide" },
] as const;

export function FertilitySection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.showFertility;

  return (
    <article className="utility-card">
      <h2 className="section-title">Fertility</h2>
      <div className="settings-group settings-group--compact">
        <fieldset
          className="chip-row chip-row--dense chip-fieldset"
          aria-label="Fertility estimates"
        >
          {FERTILITY_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={
                current === option.show
                  ? "chip-button is-active"
                  : "chip-button"
              }
              aria-pressed={current === option.show}
              onClick={() => actions.setShowFertility(option.show)}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <p className="supporting-note">
          Hides fertile-window and ovulation estimates on the home screen and
          calendar.
        </p>
      </div>
    </article>
  );
}
