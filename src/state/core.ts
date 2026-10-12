import { buildCycleSummary, getCycleStats } from "../domain/cycle";
import { getPredictionDays } from "../domain/flow";
import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
} from "../domain/types";

// One action per settings field, typed so each key only takes its own value.
type SetSettingAction = {
  [K in keyof AppSettings]: {
    type: "setSetting";
    key: K;
    value: AppSettings[K];
  };
}[keyof AppSettings];

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate; today: IsoDate }
  | {
      type: "setDayIntensity";
      day: IsoDate;
      intensity: FlowIntensity;
      today: IsoDate;
    }
  | { type: "dismissReminder"; today: IsoDate }
  | SetSettingAction
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
        settings: { ...state.settings, dismissedOn: action.today },
      };

    case "setSetting":
      return {
        ...state,
        settings: { ...state.settings, [action.key]: action.value },
      };

    // Wholesale replace: the imported state is already normalized by the caller.
    case "importState":
      return action.state;
  }
}

// Future-dated days (imported, or left by a clock that moved back) must not
// feed the cycle-length history, the stats, or the past fertile windows.
export function selectPastPredictionDays(state: AppState, today: IsoDate) {
  return getPredictionDays(state.intensityByDay).filter((day) => day <= today);
}

export function selectCycleSummary(state: AppState, today: IsoDate) {
  return buildCycleSummary({
    today,
    periodDays: selectPastPredictionDays(state, today),
  });
}

export function selectCycleStats(state: AppState, today: IsoDate) {
  return getCycleStats(selectPastPredictionDays(state, today));
}
