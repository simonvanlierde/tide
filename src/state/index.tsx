import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { normalizeAppState } from "../data/schema";
import { loadAppState, saveAppState } from "../data/storage";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, HomeDisplayMode, IsoDate } from "../domain/types";
import { addDays, getTodayIsoDate } from "../utils/date";

export type AppStateAction =
  | { type: "togglePeriodDay"; day: IsoDate }
  | { type: "setReminderWindowDays"; days: number }
  | { type: "snoozeReminders"; today: IsoDate; days: number }
  | { type: "clearReminderSnooze" }
  | { type: "setHomeDisplayMode"; mode: HomeDisplayMode }
  | { type: "replaceState"; state: unknown };

const AppStateContext = createContext<AppState | null>(null);
const AppStateDispatchContext = createContext<Dispatch<AppStateAction> | null>(
  null,
);

interface AppStateProviderProps {
  children: ReactNode;
  initialState?: AppState;
}

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

export function AppStateProvider({
  children,
  initialState,
}: AppStateProviderProps) {
  const [state, dispatch] = useReducer(
    appStateReducer,
    initialState ?? null,
    (value: AppState | null) => value ?? loadAppState(),
  );

  useLayoutEffect(() => {
    saveAppState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppStateDispatchContext.Provider value={dispatch}>
        {children}
      </AppStateDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return state;
}

function useAppStateDispatch() {
  const dispatch = useContext(AppStateDispatchContext);

  if (!dispatch) {
    throw new Error("useAppStateDispatch must be used inside AppStateProvider");
  }

  return dispatch;
}

export function useAppStateActions() {
  const dispatch = useAppStateDispatch();

  return useMemo(
    () => ({
      togglePeriodDay(day: IsoDate) {
        dispatch({ type: "togglePeriodDay", day });
      },
      setReminderWindowDays(days: number) {
        dispatch({ type: "setReminderWindowDays", days });
      },
      snoozeReminders(today: IsoDate, days: number) {
        dispatch({ type: "snoozeReminders", today, days });
      },
      clearReminderSnooze() {
        dispatch({ type: "clearReminderSnooze" });
      },
      setHomeDisplayMode(mode: HomeDisplayMode) {
        dispatch({ type: "setHomeDisplayMode", mode });
      },
      replaceState(state: unknown) {
        dispatch({ type: "replaceState", state });
      },
    }),
    [dispatch],
  );
}

export function useCycleSummary(today: IsoDate = getTodayIsoDate()) {
  return selectCycleSummary(useAppState(), today);
}
