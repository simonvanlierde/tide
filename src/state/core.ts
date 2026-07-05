import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, IsoDate, ThemePreference } from "../domain/types";
import { addDays } from "../utils/date";

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate; today: IsoDate }
  | { type: "setReminderWindowDays"; days: number }
  | { type: "snoozeReminders"; today: IsoDate; days: number }
  | { type: "clearReminderSnooze" }
  | { type: "setTheme"; theme: ThemePreference };

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "togglePeriodDay": {
      const hasLoggedDay = state.periodDays.includes(action.day);

      // Never log a future-dated day; always allow removing an existing one
      // (e.g. a stale entry left after the device clock moved backwards).
      if (!hasLoggedDay && action.day > action.today) {
        return state;
      }

      const periodDays = hasLoggedDay
        ? state.periodDays.filter((value) => value !== action.day)
        : [...state.periodDays, action.day].sort();

      return {
        ...state,
        periodDays,
      };
    }

    case "setReminderWindowDays":
      return {
        ...state,
        settings: {
          ...state.settings,
          reminderWindowDays: action.days,
        },
      };

    case "snoozeReminders":
      return {
        ...state,
        settings: {
          ...state.settings,
          snoozedUntil: addDays(action.today, action.days),
        },
      };

    case "clearReminderSnooze":
      return {
        ...state,
        settings: {
          ...state.settings,
          snoozedUntil: null,
        },
      };

    case "setTheme":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme,
        },
      };
  }
}

export function selectCycleSummary(state: AppState, today: IsoDate) {
  return buildCycleSummary({
    today,
    periodDays: state.periodDays,
    completedCycleLengths: getCompletedCycleLengths(state.periodDays),
  });
}
