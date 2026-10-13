import { DropletOff, Droplets } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FlowIntensity, LoggedFlow } from "../../domain/types";
import { useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { FlowGauge } from "./FlowGauge";

interface LogActionProps {
  isLogged: boolean;
  /** Flow level of the logged day, or undefined for a plain (default) log. */
  intensity?: LoggedFlow;
  onToggle: () => void;
  /** Omit when the gauge can't appear (e.g. the reminder's always-unlogged prompt). */
  onSelectIntensity?: (intensity: FlowIntensity) => void;
  /** "quiet" demotes the button to a calm secondary style when no bleed is expected. */
  variant?: "primary" | "quiet";
  /** Focus the control that replaced the one just pressed: the gauge after a
   *  log, the log button after a remove. Set only for an action taken here,
   *  never for a page load or a change from another tab. */
  autoFocus?: boolean;
  /** Called once focus has moved, so the parent can clear autoFocus. */
  onFocusMoved?: () => void;
}

export function LogAction({
  isLogged,
  intensity,
  onToggle,
  onSelectIntensity,
  variant = "primary",
  autoFocus = false,
  onFocusMoved,
}: LogActionProps) {
  const t = useT();
  const logButton = useRef<HTMLButtonElement>(null);

  // The pressed button unmounts with its subtree, which drops focus to <body>.
  // The gauge focuses itself on mount; the log button needs a nudge.
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    if (!isLogged) {
      logButton.current?.focus();
    }
    onFocusMoved?.();
  }, [autoFocus, isLogged, onFocusMoved]);

  // Logged: the day's last word is the confirmation, then the one decision
  // left (flow), and only then the undo, as a text action rather than a
  // button that looks like the next step.
  if (isLogged) {
    return (
      <div className="log-action log-action--logged">
        <p className="log-action__status" role="status">
          <AppIcon icon={Droplets} className="log-action__status-icon" />
          <span>
            {intensity
              ? t("log.loggedWith", { flow: t(`flow.${intensity}`) })
              : t("log.logged")}
          </span>
        </p>
        {onSelectIntensity ? (
          <FlowGauge
            selected={intensity}
            onSelect={onSelectIntensity}
            autoFocus={autoFocus}
          />
        ) : null}
        <button
          type="button"
          className="text-action log-action__remove"
          onClick={onToggle}
        >
          <AppIcon icon={DropletOff} className="text-action__icon" />
          {t("log.remove")}
        </button>
      </div>
    );
  }

  return (
    <div className="log-action">
      <button
        ref={logButton}
        type="button"
        className={variant === "quiet" ? "secondary-action" : "primary-action"}
        onClick={onToggle}
      >
        <span className="button-label">
          <AppIcon icon={Droplets} className="button-icon" />
          <span>{t("log.add")}</span>
        </span>
      </button>
    </div>
  );
}
