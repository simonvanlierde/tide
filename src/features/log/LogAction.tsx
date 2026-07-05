import { BadgeCheck, Droplets } from "lucide-react";
import { useEffect, useState } from "react";
import { AppIcon } from "../../ui/icons";
import { NOTICE_TIMEOUT_MS } from "../settings/config";

interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
}

export function LogAction({ isLogged, onToggle }: LogActionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Confirmation is a transient toast: appear when the day gets logged, then
  // auto-dismiss after the shared notice timeout.
  useEffect(() => {
    if (!isLogged) {
      setShowConfirmation(false);
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
      <button type="button" className="primary-action" onClick={onToggle}>
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
