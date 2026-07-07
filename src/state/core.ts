import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import { DEFAULT_FLOW, getPredictionDays } from "../domain/flow";
import type {
  AppState,
  FlowIntensity,
  IsoDate,
  ThemePreference,
} from "../domain/types";

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate; today: IsoDate }
  | {
      type: "setDayIntensity";
      day: IsoDate;
      intensity: FlowIntensity;
      today: IsoDate;
    }
  | { type: "dismissReminder"; today: IsoDate }
  | { type: "setShowFertility"; show: boolean }
  | { type: "setShowCycleDayNumbers"; show: boolean }
  | { type: "setTheme"; theme: ThemePreference }
  | { type: "importState"; state: AppState };

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

      // Log at the default flow; removing a day prunes its intensity so the
      // map never outlives the logged day.
      const intensityByDay = { ...state.intensityByDay };
      if (hasLoggedDay) {
        delete intensityByDay[action.day];
      } else {
        intensityByDay[action.day] = DEFAULT_FLOW;
      }

      return {
        ...state,
        periodDays,
        intensityByDay,
      };
    }

    case "setDayIntensity": {
      // The gauge only appears once a day is logged, but stay robust: never set
      // a level on a future, un-logged day.
      const isLogged = state.periodDays.includes(action.day);
      if (!isLogged && action.day > action.today) {
        return state;
      }

      const periodDays = isLogged
        ? state.periodDays
        : [...state.periodDays, action.day].sort();

      return {
        ...state,
        periodDays,
        intensityByDay: {
          ...state.intensityByDay,
          [action.day]: action.intensity,
        },
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

    case "setShowCycleDayNumbers":
      return {
        ...state,
        settings: {
          ...state.settings,
          showCycleDayNumbers: action.show,
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

    // Wholesale replace: the imported state is already normalized by the caller.
    case "importState":
      return action.state;
  }
}

export function selectCycleSummary(state: AppState, today: IsoDate) {
  const predictionDays = getPredictionDays(
    state.periodDays,
    state.intensityByDay,
  );

  return buildCycleSummary({
    today,
    periodDays: predictionDays,
    completedCycleLengths: getCompletedCycleLengths(predictionDays),
  });
}
