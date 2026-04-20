import type { IsoDate } from "./types";
import { differenceInDays } from "../utils/date";

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
}

export function getReminderState(input: ReminderStateInput) {
  if (!input.nextPeriodDate) {
    return {
      shouldNudge: false,
      isInReminderWindow: false,
      isSnoozed: false,
    } satisfies ReminderState;
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
      isInReminderWindow: inReminderWindow,
      isSnoozed,
    } satisfies ReminderState;
  }

  return {
    shouldNudge: true,
    isInReminderWindow: true,
    isSnoozed: false,
  } satisfies ReminderState;
}
