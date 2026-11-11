import { useT } from "../../state/provider";
import { LogAction } from "../log/LogAction";

interface ReminderPromptProps {
  isOverdue: boolean;
  onLog: () => void;
  onDismiss: () => void;
  /** Passed on to the log button; see LogAction. */
  autoFocus?: boolean;
}

// Part of Today's lead, not a card: the forecast above it already names the
// date, so the prompt only asks the question.
export function ReminderPrompt({ isOverdue, onLog, onDismiss, autoFocus }: ReminderPromptProps) {
  const t = useT();

  return (
    <div className="log-prompt">
      <p className="log-prompt__question">{t("reminder.question")}</p>
      {isOverdue ? <p className="log-prompt__reassure">{t("reminder.reassure")}</p> : null}
      <LogAction isLogged={false} onToggle={onLog} autoFocus={autoFocus} />
      <button type="button" className="text-action log-prompt__dismiss" onClick={onDismiss}>
        {t("reminder.dismiss")}
      </button>
    </div>
  );
}
