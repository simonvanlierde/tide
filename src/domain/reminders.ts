import { differenceInDays } from "../utils/date";
import type { IsoDate } from "./types";

/** How many days before the expected period the log prompt appears. */
export const REMINDER_WINDOW_DAYS = 2;

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
  // No lower bound: an overdue period stays "expected soon" until it's logged.
  const isExpectedSoon = daysUntil <= REMINDER_WINDOW_DAYS;
  const isDismissed = input.dismissedFor === input.today;

  return {
    isExpectedSoon,
    shouldPrompt: isExpectedSoon && !input.isTodayLogged && !isDismissed,
    isOverdue: daysUntil < 0,
    expectedDate: input.nextPeriodDate,
  };
}
