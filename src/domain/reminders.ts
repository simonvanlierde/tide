import { differenceInDays } from "../utils/date";
import { OVERDUE_GRACE_DAYS } from "./cycle";
import type { IsoDate } from "./types";

/** How many days before the expected period the log prompt appears. */
const REMINDER_WINDOW_DAYS = 2;

interface ReminderStateInput {
  today: IsoDate;
  nextPeriodDate: IsoDate | null;
  isTodayLogged: boolean;
  dismissedOn: IsoDate | null;
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
  // beyond that the estimate is stale, and prompting would nag every day with
  // no escape but logging a period that isn't happening.
  const isExpectedSoon = daysUntil <= REMINDER_WINDOW_DAYS && daysUntil >= -OVERDUE_GRACE_DAYS;
  const isDismissed = input.dismissedOn === input.today;

  return {
    isExpectedSoon,
    shouldPrompt: isExpectedSoon && !input.isTodayLogged && !isDismissed,
    isOverdue: daysUntil < 0,
    expectedDate: input.nextPeriodDate,
  };
}
