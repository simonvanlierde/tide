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
  // A date after today means the clock was set back; it must not hold the reminder off until then.
  const past = (day: IsoDate | null) => (day !== null && day <= input.today ? day : null);
  const lastBackup = past(input.lastBackupOn) ?? firstDay;
  const dismissedOn = past(input.dismissedOn);
  return (
    differenceInDays(input.today, lastBackup) >= 30 &&
    (dismissedOn === null || differenceInDays(input.today, dismissedOn) >= 7)
  );
}
