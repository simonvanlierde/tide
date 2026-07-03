import { useAppState, useAppStateActions } from "../../state/provider";
import { HOME_DISPLAY_MODE_OPTIONS } from "./config";

export function HomeSection() {
  const state = useAppState();
  const actions = useAppStateActions();

  return (
    <article className="utility-card">
      <h2 className="section-title">Home</h2>
      <div className="settings-group settings-group--compact">
        <fieldset
          className="chip-row chip-row--dense chip-fieldset"
          aria-label="Home display mode"
        >
          {HOME_DISPLAY_MODE_OPTIONS.map((mode) => (
            <button
              key={mode.value}
              type="button"
              className={
                state.settings.homeDisplayMode === mode.value
                  ? "chip-button is-active"
                  : "chip-button"
              }
              aria-pressed={state.settings.homeDisplayMode === mode.value}
              onClick={() => actions.setHomeDisplayMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </fieldset>
        <p className="supporting-note">
          Compare summary, linear, and circular views.
        </p>
      </div>
    </article>
  );
}
