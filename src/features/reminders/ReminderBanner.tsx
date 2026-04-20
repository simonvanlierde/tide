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
    return (
      <p className="supporting-note note-inline">
        <AppIcon icon={BellOff} className="note-icon" />
        <span>Reminders snoozed until {settings.snoozedUntil}</span>
      </p>
    );
  }

  if (!reminderState.shouldNudge || reminderState.mode !== "banner") {
    return null;
  }

  return (
    <p className="supporting-note note-inline">
      <AppIcon icon={BellRing} className="note-icon" />
      <span>Period reminder active</span>
    </p>
  );
}
