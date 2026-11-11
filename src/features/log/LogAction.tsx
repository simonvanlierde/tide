import { DropletOff, Droplets } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
}

export function LogAction({
  isLogged,
  intensity,
  onToggle,
  onSelectIntensity,
  variant = "primary",
  autoFocus = false,
}: LogActionProps) {
  const t = useT();
  const logButton = useRef<HTMLButtonElement>(null);

  // The pressed button unmounts with its subtree, which drops focus to <body>.
  // The gauge focuses itself on mount; the log button needs a nudge.
  useEffect(() => {
    if (autoFocus && !isLogged) {
      logButton.current?.focus();
    }
  }, [autoFocus, isLogged]);

  if (isLogged) {
    return (
      <LoggedToday
        intensity={intensity}
        onRemove={onToggle}
        onSelectIntensity={onSelectIntensity}
        justLogged={autoFocus}
      />
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

interface LoggedTodayProps {
  intensity?: LoggedFlow;
  onRemove: () => void;
  onSelectIntensity?: (intensity: FlowIntensity) => void;
  justLogged: boolean;
}

// Logged: one line that confirms, with the undo beside it, and the optional
// flow as a single row of swatches. Nothing here asks for another step.
function LoggedToday({ intensity, onRemove, onSelectIntensity, justLogged }: LoggedTodayProps) {
  const t = useT();
  // The parent's flag lasts one render; keep it so the one-time moment can finish.
  const [pop] = useState(justLogged);

  return (
    <div className="log-action log-action--logged" data-just-logged={pop || undefined}>
      <div className="log-action__row">
        <p className="log-action__status" role="status">
          <AppIcon icon={Droplets} className="log-action__status-icon" />
          <span>{intensity ? t("log.loggedWith", { flow: t(`flow.${intensity}`) }) : t("log.logged")}</span>
        </p>
        <button type="button" className="text-action log-action__remove" onClick={onRemove}>
          <AppIcon icon={DropletOff} className="text-action__icon" />
          {t("log.remove")}
        </button>
      </div>
      {onSelectIntensity ? (
        <FlowGauge selected={intensity} onSelect={onSelectIntensity} autoFocus={justLogged} hideLegend />
      ) : null}
    </div>
  );
}
