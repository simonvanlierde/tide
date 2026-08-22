import { DropletOff, Droplets } from "lucide-react";
import type { FlowIntensity } from "../../domain/types";
import { useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { FlowGauge } from "./FlowGauge";

interface LogActionProps {
  isLogged: boolean;
  /** Flow level of the logged day, or undefined for a plain (default) log. */
  intensity?: FlowIntensity;
  onToggle: () => void;
  /** Omit when the gauge can't appear (e.g. the reminder's always-unlogged prompt). */
  onSelectIntensity?: (intensity: FlowIntensity) => void;
  /** "quiet" demotes the button to a calm secondary style when no bleed is expected. */
  variant?: "primary" | "quiet";
}

export function LogAction({
  isLogged,
  intensity,
  onToggle,
  onSelectIntensity,
  variant = "primary",
}: LogActionProps) {
  const t = useT();

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
          <FlowGauge selected={intensity} onSelect={onSelectIntensity} />
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
