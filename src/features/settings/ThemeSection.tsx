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
    // biome-ignore lint/a11y/useSemanticElements: a labelled div group is intentional here; <fieldset> brings unwanted default styling.
    <div
      className="settings-row theme-field"
      role="group"
      aria-labelledby="theme-label"
    >
      <span className="settings-label" id="theme-label">
        Theme
      </span>
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
    </div>
  );
}
