import { getReminderState } from "../../domain/reminders";
import type { AppSettings, IsoDate } from "../../domain/types";
import { AppIcon, BellOff, BellRing } from "../../ui/icons";

interface ReminderBannerProps {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  settings: AppSettings;
}

export function ReminderBanner({
  today,
  nextPeriodDate,
  settings,
}: ReminderBannerProps) {
  const reminderState = getReminderState({
    today,
    nextPeriodDate,
    reminderWindowDays: settings.reminderWindowDays,
    snoozedUntil: settings.snoozedUntil,
  });

  if (settings.snoozedUntil) {
    return (
      <p className="status-chip status-chip--muted note-inline">
        <AppIcon icon={BellOff} className="note-icon" />
        <span>Snoozed until {settings.snoozedUntil}</span>
      </p>
    );
  }

  if (!reminderState.shouldNudge) {
    return null;
  }

  return (
    <p className="status-chip note-inline">
      <AppIcon icon={BellRing} className="note-icon" />
      <span>Reminder active</span>
    </p>
  );
}
