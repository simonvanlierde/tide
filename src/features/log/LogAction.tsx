import { ChevronDown, DropletOff, Droplets } from "lucide-react";
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

// Logged: a fresh log opens on the optional flow row with its undo; on a
// later visit the block is one line that opens them again. No timer: nothing
// moves while a finger or screen reader is on it.
function LoggedToday({ intensity, onRemove, onSelectIntensity, justLogged }: LoggedTodayProps) {
  const t = useT();
  // How the row came to be open. The parent's flag lasts one render; this
  // keeps it so the one-time moment can finish.
  const [open, setOpen] = useState<"fresh" | "tapped" | null>(justLogged ? "fresh" : null);
  const summary = intensity ? t("log.loggedWith", { flow: t(`flow.${intensity}`) }) : t("log.logged");

  if (!open) {
    return (
      <div className="log-action log-action--logged">
        <button type="button" className="log-action__summary" aria-expanded={false} onClick={() => setOpen("tapped")}>
          <AppIcon icon={Droplets} className="log-action__status-icon" />
          <span>{summary}</span>
          <span className="log-action__hint">
            {t(intensity ? "log.changeFlow" : "log.addFlow")}
            <AppIcon icon={ChevronDown} className="text-action__icon" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="log-action log-action--logged" data-just-logged={open === "fresh" || undefined}>
      <div className="log-action__row">
        <p className="log-action__status" role="status">
          <AppIcon icon={Droplets} className="log-action__status-icon" />
          <span>{summary}</span>
        </p>
        <button type="button" className="text-action log-action__remove" onClick={onRemove}>
          <AppIcon icon={DropletOff} className="text-action__icon" />
          {t("log.remove")}
        </button>
      </div>
      {onSelectIntensity ? (
        // Opened from the summary line, which unmounts: focus continues here.
        <FlowGauge
          selected={intensity}
          onSelect={onSelectIntensity}
          autoFocus={justLogged || open === "tapped"}
          hideLegend
        />
      ) : null}
    </div>
  );
}
