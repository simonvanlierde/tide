import { normalizeAppState } from "../data/schema";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, HomeDisplayMode, IsoDate } from "../domain/types";
import { addDays } from "../utils/date";

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate }
  | { type: "setReminderWindowDays"; days: number }
  | { type: "snoozeReminders"; today: IsoDate; days: number }
  | { type: "clearReminderSnooze" }
  | { type: "setHomeDisplayMode"; mode: HomeDisplayMode }
  | { type: "replaceState"; state: unknown };

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "togglePeriodDay": {
      const hasLoggedDay = state.periodDays.includes(action.day);
      const periodDays = hasLoggedDay
        ? state.periodDays.filter((value) => value !== action.day)
        : sortPeriodDays([...state.periodDays, action.day]);

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

    case "setHomeDisplayMode":
      return {
        ...state,
        settings: {
          ...state.settings,
          homeDisplayMode: action.mode,
        },
      };

    case "replaceState":
      return normalizeAppState(action.state);
  }
}

export function selectCycleSummary(state: AppState, today: IsoDate) {
  return buildCycleSummary({
    today,
    periodDays: state.periodDays,
    completedCycleLengths: getCompletedCycleLengths(state.periodDays),
  });
}
