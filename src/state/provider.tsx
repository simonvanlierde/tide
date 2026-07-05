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
import type {
  AppState,
  FlowIntensity,
  IsoDate,
  ThemePreference,
} from "../domain/types";
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

  useThemePreference(state.settings.theme);

  return (
    <AppStateContext.Provider value={state}>
      <AppStateDispatchContext.Provider value={dispatch}>
        {children}
      </AppStateDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

// Reflect the theme preference onto <html data-theme>, following the OS while
// set to "system". An inline script in index.html applies the same value before
// first paint so there is no flash on load.
function useThemePreference(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement;

    function apply() {
      const prefersDark =
        typeof window.matchMedia === "function" &&
        window.matchMedia(DARK_MEDIA_QUERY).matches;
      const dark = theme === "dark" || (theme === "system" && prefersDark);
      root.dataset.theme = dark ? "dark" : "light";
      // Keep the browser chrome (address bar / PWA status bar) in step.
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#0e1a1e" : "#f5f9f9");
    }

    apply();

    if (theme !== "system" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia(DARK_MEDIA_QUERY);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
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
      setDayIntensity(day: IsoDate, intensity: FlowIntensity, today: IsoDate) {
        dispatch({ type: "setDayIntensity", day, intensity, today });
      },
      dismissReminder(today: IsoDate) {
        dispatch({ type: "dismissReminder", today });
      },
      setShowFertility(show: boolean) {
        dispatch({ type: "setShowFertility", show });
      },
      setTheme(theme: ThemePreference) {
        dispatch({ type: "setTheme", theme });
      },
    }),
    [dispatch],
  );
}

export function useCycleSummary(today: IsoDate = getTodayIsoDate()) {
  const state = useAppState();
  return useMemo(() => selectCycleSummary(state, today), [state, today]);
}
