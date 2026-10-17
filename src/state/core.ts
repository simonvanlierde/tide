import { forecast } from "../domain/cycle";
import { getPeriodRange, getPredictionDays } from "../domain/flow";
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
  | { type: "logPeriodRange"; from: IsoDate; to: IsoDate; today: IsoDate }
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

    // A past period in one go: every day not yet logged gets a one-tap log,
    // through the same case (and the same future-day check) as a single tap.
    // Days already logged keep their flow. A run past the cap changes nothing.
    case "logPeriodRange":
      return (getPeriodRange(action.from, action.to) ?? []).reduce(
        (next, day) =>
          day in next.intensityByDay
            ? next
            : appStateReducer(next, {
                type: "togglePeriodDay",
                day,
                today: action.today,
              }),
        state,
      );

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

export function selectForecast(state: AppState, today: IsoDate) {
  return forecast({
    today,
    periodDays: getPredictionDays(state.intensityByDay),
  });
}
