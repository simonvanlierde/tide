import { getReminderState } from "../../domain/reminders";
import type { AppSettings, IsoDate } from "../../domain/types";

interface ReminderBannerProps {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  settings: AppSettings;
}

export function ReminderBanner({
  today,
  nextPeriodDate,
  settings
}: ReminderBannerProps) {
  const reminderState = getReminderState({
    today,
    nextPeriodDate,
    reminderWindowDays: settings.reminderWindowDays,
    snoozedUntil: settings.snoozedUntil,
    notificationPermission:
      typeof Notification === "undefined" ? "default" : Notification.permission
  });

  if (settings.snoozedUntil) {
    return <p className="supporting-note">Reminders snoozed until {settings.snoozedUntil}</p>;
  }

  if (!reminderState.shouldNudge || reminderState.mode !== "banner") {
    return null;
  }

  return <p className="supporting-note">Period reminder active</p>;
}
