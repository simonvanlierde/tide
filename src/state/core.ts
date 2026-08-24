import {
  buildCycleSummary,
  getCompletedCycleLengths,
  getCycleStats,
} from "../domain/cycle";
import { getPredictionDays } from "../domain/flow";
import type {
  AppState,
  FlowIntensity,
  IsoDate,
  LanguagePreference,
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
  | { type: "setLanguage"; language: LanguagePreference }
  | { type: "importState"; state: AppState };

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "togglePeriodDay": {
      const hasLoggedDay = action.day in state.intensityByDay;

      // Never log a future-dated day; always allow removing an existing one
      // (e.g. a stale entry left after the device clock moved backwards).
      if (!hasLoggedDay && action.day > action.today) {
        return state;
      }

      // A one-tap log records the day with no flow level: the user said they
      // bled, not how much. Removing drops the entry (the map is the set of
      // logged days, so no separate list to keep in sync).
      const intensityByDay = { ...state.intensityByDay };
      if (hasLoggedDay) {
        delete intensityByDay[action.day];
      } else {
        intensityByDay[action.day] = null;
      }

      return {
        ...state,
        intensityByDay,
      };
    }

    case "setDayIntensity": {
      // The gauge only appears once a day is logged, but stay robust: never set
      // a level on a future, un-logged day.
      const isLogged = action.day in state.intensityByDay;
      if (!isLogged && action.day > action.today) {
        return state;
      }

      return {
        ...state,
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
          dismissedOn: action.today,
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

    // biome-ignore lint/security/noSecrets: an action type name, not a credential
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

    case "setLanguage":
      return {
        ...state,
        settings: {
          ...state.settings,
          language: action.language,
        },
      };

    // Wholesale replace: the imported state is already normalized by the caller.
    case "importState":
      return action.state;
  }
}

export function selectCycleSummary(state: AppState, today: IsoDate) {
  // Future-dated days (imported, or left by a clock that moved back) must not
  // feed the cycle-length history either.
  const predictionDays = getPredictionDays(state.intensityByDay).filter(
    (day) => day <= today,
  );

  return buildCycleSummary({
    today,
    periodDays: predictionDays,
    completedCycleLengths: getCompletedCycleLengths(predictionDays),
  });
}

export function selectCycleStats(state: AppState) {
  return getCycleStats(getPredictionDays(state.intensityByDay));
}
