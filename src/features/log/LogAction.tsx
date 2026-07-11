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
  return (
    <div className="log-action">
      <button
        type="button"
        className={variant === "quiet" ? "secondary-action" : "primary-action"}
        onClick={onToggle}
      >
        <span className="button-label">
          <AppIcon
            icon={isLogged ? DropletOff : Droplets}
            className="button-icon"
          />
          <span>{isLogged ? t("log.remove") : t("log.add")}</span>
        </span>
      </button>
      {isLogged && onSelectIntensity ? (
        <FlowGauge selected={intensity} onSelect={onSelectIntensity} />
      ) : null}
    </div>
  );
}
