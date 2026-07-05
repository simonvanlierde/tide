import { differenceInDays } from "../utils/date";
import type { IsoDate } from "./types";

interface ReminderStateInput {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  reminderWindowDays: number;
  snoozedUntil: IsoDate | null;
}

export interface ReminderState {
  shouldNudge: boolean;
  isInReminderWindow: boolean;
  isSnoozed: boolean;
  daysUntilReminder: number | null;
}

export function getReminderState(input: ReminderStateInput): ReminderState {
  if (!input.nextPeriodDate) {
    return {
      shouldNudge: false,
      isInReminderWindow: false,
      isSnoozed: false,
      daysUntilReminder: null,
    };
  }

  const daysUntilPeriod = differenceInDays(input.nextPeriodDate, input.today);
  const isInReminderWindow =
    daysUntilPeriod >= -1 && daysUntilPeriod <= input.reminderWindowDays;
  const isSnoozed =
    input.snoozedUntil !== null &&
    differenceInDays(input.snoozedUntil, input.today) > 0;

  return {
    shouldNudge: isInReminderWindow && !isSnoozed,
    isInReminderWindow,
    isSnoozed,
    daysUntilReminder: daysUntilPeriod - input.reminderWindowDays,
  };
}
