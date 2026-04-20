import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { Dispatch, ReactNode } from "react";
import { importBackup } from "../data/exportImport";
import { defaultAppState, loadAppState, saveAppState } from "../data/storage";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type {
  AppState,
  HomeCardsSettings,
  HomeDisplayMode,
  IsoDate,
} from "../domain/types";
import { addDays, getTodayIsoDate } from "../utils/date";

type AppStateAction =
  | { type: "replaceState"; state: AppState }
  | { type: "togglePeriodDay"; day: IsoDate }
  | { type: "setReminderWindowDays"; days: number }
  | { type: "snoozeReminders"; today: IsoDate; days: number }
  | { type: "clearReminderSnooze" }
  | { type: "setHomeDisplayMode"; mode: HomeDisplayMode }
  | {
      type: "setHomeCardVisibility";
      card: keyof HomeCardsSettings;
      visible: boolean;
    };

interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<AppStateAction>;
}

interface AppStateProviderProps {
  children: ReactNode;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

async function readBackupFile(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read backup file"));
    };

    reader.onerror = () => {
      reject(new Error("Could not read backup file"));
    };

    reader.readAsText(file);
  });
}

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "replaceState":
      return action.state;
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
    case "setHomeCardVisibility":
      return {
        ...state,
        settings: {
          ...state.settings,
          homeCards: {
            ...state.settings.homeCards,
            [action.card]: action.visible,
          },
        },
      };
    default:
      return state;
  }
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appStateReducer, defaultAppState, () =>
    loadAppState(),
  );

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

function useAppStateContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }

  return context;
}

export function useAppState(today: IsoDate = getTodayIsoDate()) {
  const { state, dispatch } = useAppStateContext();

  const summary = useMemo(
    () =>
      buildCycleSummary({
        today,
        periodDays: state.periodDays,
        completedCycleLengths: getCompletedCycleLengths(state.periodDays),
      }),
    [state.periodDays, today],
  );

  function toggleTodayPeriodDay() {
    dispatch({ type: "togglePeriodDay", day: today });
  }

  function togglePeriodDay(day: IsoDate) {
    dispatch({ type: "togglePeriodDay", day });
  }

  function snoozeReminders(days: number) {
    dispatch({ type: "snoozeReminders", today, days });
  }

  function clearReminderSnooze() {
    dispatch({ type: "clearReminderSnooze" });
  }

  function setReminderWindowDays(days: number) {
    dispatch({ type: "setReminderWindowDays", days });
  }

  function setHomeDisplayMode(mode: HomeDisplayMode) {
    dispatch({ type: "setHomeDisplayMode", mode });
  }

  function setHomeCardVisibility(
    card: keyof HomeCardsSettings,
    visible: boolean,
  ) {
    dispatch({ type: "setHomeCardVisibility", card, visible });
  }

  function exportState() {
    return JSON.stringify(state, null, 2);
  }

  async function importState(file: File) {
    const payload = await readBackupFile(file);
    const nextState = importBackup(payload);
    dispatch({ type: "replaceState", state: nextState });
    return nextState;
  }

  return {
    state,
    summary,
    toggleTodayPeriodDay,
    togglePeriodDay,
    snoozeReminders,
    clearReminderSnooze,
    setReminderWindowDays,
    setHomeDisplayMode,
    setHomeCardVisibility,
    exportState,
    importState,
  };
}
