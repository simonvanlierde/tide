import type { LanguagePreference } from "../../domain/types";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { LANGUAGE_OPTIONS } from "./config";

export function LanguageSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const current = state.settings.language;

  return (
    <div className="settings-row">
      <label className="settings-label" htmlFor="language-select">
        {t("settings.language")}
      </label>
      <select
        id="language-select"
        className="select-field"
        value={current}
        onChange={(event) =>
          actions.setLanguage(event.target.value as LanguagePreference)
        }
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
