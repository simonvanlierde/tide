import { useT } from "../../state/provider";
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
  const t = useT();
  // Split the template on the {date} placeholder so the date stays bold while
  // each language keeps its own word order. Robust to a translation with no or
  // extra {date} tokens: `after` is never undefined and no text is dropped.
  const [before, ...rest] = t(
    isOverdue ? "reminder.messageOverdue" : "reminder.messageUpcoming",
  ).split("{date}");
  const after = rest.join("{date}");

  return (
    <div className="reminder-prompt">
      <p className="reminder-prompt__message">
        {before}
        <strong>{expectedLabel}</strong>
        {after}
      </p>
      {isOverdue ? (
        <p className="reminder-prompt__reassure">{t("reminder.reassure")}</p>
      ) : null}
      <LogAction isLogged={false} onToggle={onLog} />
      <button
        type="button"
        className="reminder-prompt__dismiss"
        onClick={onDismiss}
      >
        {t("reminder.dismiss")}
      </button>
    </div>
  );
}
