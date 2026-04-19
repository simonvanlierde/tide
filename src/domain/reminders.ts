import type { IsoDate } from "./types";
import { differenceInDays } from "../utils/date";

interface ReminderStateInput {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  reminderWindowDays: number;
  snoozedUntil: IsoDate | null;
  notificationPermission: NotificationPermission;
}

export function getReminderState(input: ReminderStateInput) {
  if (!input.nextPeriodDate) {
    return {
      shouldNudge: false,
      mode: "banner" as const,
      isInReminderWindow: false,
      isSnoozed: false
    };
  }

  const daysUntilPeriod = differenceInDays(input.nextPeriodDate, input.today);
  const inReminderWindow =
    daysUntilPeriod >= -1 && daysUntilPeriod <= input.reminderWindowDays;
  const isSnoozed =
    input.snoozedUntil !== null &&
    differenceInDays(input.snoozedUntil, input.today) >= 0;

  if (!inReminderWindow || isSnoozed) {
    return {
      shouldNudge: false,
      mode: "banner" as const,
      isInReminderWindow: inReminderWindow,
      isSnoozed
    };
  }

  return {
    shouldNudge: true,
    isInReminderWindow: true,
    isSnoozed: false,
    mode:
      input.notificationPermission === "granted"
        ? ("notification" as const)
        : ("banner" as const)
  };
}
