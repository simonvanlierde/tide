import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { loadAppState, saveAppState } from "../data/storage";
import type { AppState, IsoDate } from "../domain/types";
import { getTodayIsoDate } from "../utils/date";
import {
  type AppStateAction,
  appStateReducer,
  selectCycleSummary,
} from "./core";

const AppStateContext = createContext<AppState | null>(null);
const AppStateDispatchContext = createContext<Dispatch<AppStateAction> | null>(
  null,
);

interface AppStateProviderProps {
  children: ReactNode;
  initialState?: AppState;
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

  useEffect(() => {
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
      togglePeriodDay(day: IsoDate, today: IsoDate) {
        dispatch({ type: "togglePeriodDay", day, today });
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
    }),
    [dispatch],
  );
}

export function useCycleSummary(today: IsoDate = getTodayIsoDate()) {
  const state = useAppState();
  return useMemo(() => selectCycleSummary(state, today), [state, today]);
}
