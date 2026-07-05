import { useAppState, useAppStateActions } from "../../state/provider";
import { THEME_OPTIONS } from "./config";

export function ThemeSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.theme;

  return (
    <article className="utility-card">
      <h2 className="section-title">Appearance</h2>
      <div className="settings-group settings-group--compact">
        <fieldset
          className="chip-row chip-row--dense chip-fieldset"
          aria-label="Theme"
        >
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                current === option.value
                  ? "chip-button is-active"
                  : "chip-button"
              }
              aria-pressed={current === option.value}
              onClick={() => actions.setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <p className="supporting-note">
          System follows your device's light or dark setting.
        </p>
      </div>
    </article>
  );
}
