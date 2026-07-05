import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, IsoDate, ThemePreference } from "../domain/types";

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate; today: IsoDate }
  | { type: "dismissReminder"; today: IsoDate }
  | { type: "setShowFertility"; show: boolean }
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

    case "dismissReminder":
      return {
        ...state,
        settings: {
          ...state.settings,
          dismissedFor: action.today,
        },
      };

    case "setShowFertility":
      return {
        ...state,
        settings: {
          ...state.settings,
          showFertility: action.show,
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
