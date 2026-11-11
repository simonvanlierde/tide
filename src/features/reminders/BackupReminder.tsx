import { useState } from "react";
import { downloadAppState } from "../../data/transfer";
import { shouldRemindBackup } from "../../domain/backup";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useT } from "../../state/provider";

interface BackupReminderProps {
  today: IsoDate;
  onDone: () => void;
}

export function BackupReminder({ today, onDone }: BackupReminderProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const t = useT();
  const [failed, setFailed] = useState(false);
  if (
    readOnly ||
    !shouldRemindBackup({
      today,
      loggedDays: [...Object.keys(state.intensityByDay), ...Object.keys(state.detailsByDay)] as IsoDate[],
      lastBackupOn: state.settings.lastBackupOn,
      dismissedOn: state.settings.backupReminderDismissedOn,
    })
  )
    return null;

  return (
    <aside className="reminder-prompt backup-reminder" aria-labelledby="backup-title">
      <h2 id="backup-title" className="backup-reminder__title">
        {t("backup.title")}
      </h2>
      <p className="today-screen__note">{t("backup.body")}</p>
      <button
        type="button"
        className="secondary-action"
        onClick={() => {
          try {
            downloadAppState(state);
            actions.setSetting("lastBackupOn", today);
            actions.setSetting("backupReminderDismissedOn", null);
            onDone();
          } catch {
            setFailed(true);
          }
        }}
      >
        {t("backup.download")}
      </button>
      <button
        type="button"
        className="reminder-prompt__dismiss"
        onClick={() => {
          setFailed(false);
          actions.setSetting("backupReminderDismissedOn", today);
          onDone();
        }}
      >
        {t("backup.snooze")}
      </button>
      {failed ? (
        <p role="alert" className="supporting-note supporting-note--error">
          {t("backup.error")}
        </p>
      ) : null}
    </aside>
  );
}
