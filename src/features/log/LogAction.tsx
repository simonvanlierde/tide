import { BadgeCheck, Droplets } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppIcon } from "../../ui/icons";
import { NOTICE_TIMEOUT_MS } from "../settings/config";

interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
  /** "quiet" demotes the button to a calm secondary style when no bleed is expected. */
  variant?: "primary" | "quiet";
}

export function LogAction({
  isLogged,
  onToggle,
  variant = "primary",
}: LogActionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const wasLogged = useRef(isLogged);

  // Confirmation is a transient toast: appear only on the false→true transition
  // (a fresh log), not when remounting with a day already logged. Then it
  // auto-dismisses after the shared notice timeout.
  useEffect(() => {
    const justLogged = isLogged && !wasLogged.current;
    wasLogged.current = isLogged;

    if (!justLogged) {
      if (!isLogged) {
        setShowConfirmation(false);
      }
      return;
    }

    setShowConfirmation(true);
    const timeoutId = window.setTimeout(
      () => setShowConfirmation(false),
      NOTICE_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isLogged]);

  return (
    <div className="log-action">
      <button
        type="button"
        className={variant === "quiet" ? "secondary-action" : "primary-action"}
        onClick={onToggle}
      >
        <span className="button-label">
          <AppIcon icon={Droplets} className="button-icon" />
          <span>{isLogged ? "Remove bleeding log" : "Log bleeding today"}</span>
        </span>
      </button>
      {showConfirmation ? (
        <p className="status-chip note-inline" role="status" aria-live="polite">
          <AppIcon icon={BadgeCheck} className="note-icon" />
          <span>Bleeding logged for today</span>
        </p>
      ) : null}
    </div>
  );
}
