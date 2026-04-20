import { AppIcon, BadgeCheck, Droplets } from "../../ui/icons";

interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
}

export function LogAction({ isLogged, onToggle }: LogActionProps) {
  return (
    <div className="log-action">
      <button type="button" className="primary-action" onClick={onToggle}>
        <span className="button-label">
          <AppIcon icon={Droplets} className="button-icon" />
          <span>{isLogged ? "Remove bleeding log" : "Log bleeding today"}</span>
        </span>
      </button>
      {isLogged ? (
        <p className="status-chip note-inline">
          <AppIcon icon={BadgeCheck} className="note-icon" />
          <span>Bleeding logged for today</span>
        </p>
      ) : null}
    </div>
  );
}
