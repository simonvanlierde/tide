import { differenceInDays } from "../utils/date";
import type { IsoDate } from "./types";

interface BackupReminderInput {
  today: IsoDate;
  loggedDays: IsoDate[];
  lastBackupOn: IsoDate | null;
  dismissedOn: IsoDate | null;
}

export function shouldRemindBackup(input: BackupReminderInput): boolean {
  const firstDay = input.loggedDays.filter((day) => day <= input.today).sort()[0];
  if (!firstDay) return false;
  const lastBackup = input.lastBackupOn ?? firstDay;
  return (
    differenceInDays(input.today, lastBackup) >= 30 &&
    (input.dismissedOn === null || differenceInDays(input.today, input.dismissedOn) >= 7)
  );
}
