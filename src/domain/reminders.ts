import { differenceInDays } from "../utils/date";
import type { IsoDate } from "./types";

/** How many days before the expected period the log prompt appears. */
export const REMINDER_WINDOW_DAYS = 2;
// A prediction this many days overdue with nothing logged is stale (the user
// stopped tracking), so stop treating it as expected — otherwise it nags every
// day forever with no escape but logging a period that isn't happening.
// ponytail: fixed grace; learn a per-user threshold from cycle history if needed.
export const REMINDER_OVERDUE_GRACE_DAYS = 10;

interface ReminderStateInput {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  isTodayLogged: boolean;
  dismissedFor: IsoDate | null;
}

export interface ReminderState {
  /** A period is expected within the window (or overdue) — independent of dismiss/log. */
  isExpectedSoon: boolean;
  shouldPrompt: boolean;
  isOverdue: boolean;
  expectedDate: IsoDate | null;
}

export function getReminderState(input: ReminderStateInput): ReminderState {
  if (!input.nextPeriodDate) {
    return {
      isExpectedSoon: false,
      shouldPrompt: false,
      isOverdue: false,
      expectedDate: null,
    };
  }

  const daysUntil = differenceInDays(input.nextPeriodDate, input.today);
  // Expected from a couple of days out until a bounded grace past the due date;
  // beyond that the estimate is stale and no longer worth prompting.
  const isExpectedSoon =
    daysUntil <= REMINDER_WINDOW_DAYS &&
    daysUntil >= -REMINDER_OVERDUE_GRACE_DAYS;
  const isDismissed = input.dismissedFor === input.today;

  return {
    isExpectedSoon,
    shouldPrompt: isExpectedSoon && !input.isTodayLogged && !isDismissed,
    isOverdue: daysUntil < 0,
    expectedDate: input.nextPeriodDate,
  };
}
