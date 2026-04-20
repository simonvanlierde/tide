import { normalizeAppState } from "../data/schema";
import type { AppState, IsoDate } from "../domain/types";
import { addDays } from "../utils/date";
import type { AppStateAction } from "./actions";

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "replaceState":
      return normalizeAppState(action.state);
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
    default:
      return state;
  }
}
