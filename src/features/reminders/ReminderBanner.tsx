import { BellOff, BellRing } from "lucide-react";
import type { ReminderState } from "../../domain/reminders";
import type { IsoDate } from "../../domain/types";
import { AppIcon } from "../../ui/icons";

interface ReminderBannerProps {
  reminderState: ReminderState;
  snoozedUntil: IsoDate | null;
}

export function ReminderBanner({
  reminderState,
  snoozedUntil,
}: ReminderBannerProps) {
  if (reminderState.isSnoozed && snoozedUntil) {
    return (
      <p className="status-chip status-chip--muted note-inline">
        <AppIcon icon={BellOff} className="note-icon" />
        <span>Snoozed until {snoozedUntil}</span>
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
