import { Monitor, Moon, Sun } from "lucide-react";
import { useAppState, useAppStateActions } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { THEME_OPTIONS } from "./config";

const THEME_ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

export function ThemeSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.theme;

  return (
    <fieldset className="chip-fieldset theme-field">
      <legend className="settings-label theme-field__legend">Theme</legend>
      <div className="segmented">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              current === option.value
                ? "segmented__option is-active"
                : "segmented__option"
            }
            aria-pressed={current === option.value}
            onClick={() => actions.setTheme(option.value)}
          >
            <AppIcon
              icon={THEME_ICONS[option.value]}
              className="segmented__icon"
            />
            <span className="segmented__label">{option.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
