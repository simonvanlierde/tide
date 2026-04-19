import type { IsoDate } from "../../domain/types";

interface ReminderBannerProps {
  snoozedUntil: IsoDate | null;
}

export function ReminderBanner({ snoozedUntil }: ReminderBannerProps) {
  if (!snoozedUntil) {
    return null;
  }

  return <p>Reminders snoozed until {snoozedUntil}</p>;
}
