import { ChevronDown, Droplets } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import type { LoggedFlow } from "../../domain/types";
import { useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";

interface LogActionProps {
  isLogged: boolean;
  /** Flow level of the logged day, or undefined for a plain (default) log. */
  intensity?: LoggedFlow;
  onToggle: () => void;
  onEdit?: () => void;
  /** "quiet" demotes the button to a calm secondary style when no bleed is expected. */
  variant?: "primary" | "quiet";
  /** Restore focus after a local dismissal or editor close. */
  autoFocus?: boolean;
  /** A second, smaller action that sits on the same line as the log button or logged summary. */
  aside?: ReactNode;
}

export function LogAction({
  isLogged,
  intensity,
  onToggle,
  onEdit,
  variant = "primary",
  autoFocus = false,
  aside,
}: LogActionProps) {
  const t = useT();
  const logButton = useRef<HTMLButtonElement>(null);

  // Closing the editor restores focus to the compact log control.
  useEffect(() => {
    if (autoFocus) {
      logButton.current?.focus();
    }
  }, [autoFocus]);

  if (isLogged) {
    const summary = intensity ? t("log.loggedWith", { flow: t(`flow.${intensity}`) }) : t("log.logged");
    return (
      <div className="log-action log-action--logged log-action--line">
        <button ref={logButton} type="button" className="log-action__summary" onClick={onEdit}>
          <AppIcon icon={Droplets} className="log-action__status-icon" />
          <span>{summary}</span>
          <span className="log-action__hint">
            {t(intensity ? "log.changeFlow" : "log.addFlow")}
            <AppIcon icon={ChevronDown} className="text-action__icon" />
          </span>
        </button>
        {aside}
      </div>
    );
  }

  return (
    <div className="log-action log-action--line">
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
      {aside}
    </div>
  );
}
