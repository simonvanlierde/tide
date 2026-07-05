import { LogAction } from "../log/LogAction";

interface ReminderPromptProps {
  isOverdue: boolean;
  expectedLabel: string;
  onLog: () => void;
  onDismiss: () => void;
}

export function ReminderPrompt({
  isOverdue,
  expectedLabel,
  onLog,
  onDismiss,
}: ReminderPromptProps) {
  return (
    <div className="reminder-prompt">
      <p className="reminder-prompt__message">
        Your period {isOverdue ? "was" : "is"} expected{" "}
        <strong>{expectedLabel}</strong>. Started?
      </p>
      <LogAction isLogged={false} onToggle={onLog} />
      <button
        type="button"
        className="reminder-prompt__dismiss"
        onClick={onDismiss}
      >
        Not yet — remind me later
      </button>
    </div>
  );
}
