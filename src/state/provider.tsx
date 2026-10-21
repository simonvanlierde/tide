import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { defaultAppState } from "../data/schema";
import {
  clearAppState,
  loadStoredState,
  STORAGE_KEY,
  saveAppState,
} from "../data/storage";
import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
  LanguagePreference,
  ThemePreference,
} from "../domain/types";
import { type MessageKey, resolveLanguage, translate } from "../i18n";
import { type AppStateAction, appStateReducer, selectForecast } from "./core";

const AppStateContext = createContext<AppState | null>(null);
const AppStateDispatchContext = createContext<Dispatch<AppStateAction> | null>(
  null,
);
const ReadOnlyContext = createContext(false);

interface AppStateProviderProps {
  children: ReactNode;
  initialState?: AppState;
}

export function AppStateProvider({
  children,
  initialState,
}: AppStateProviderProps) {
  const [loaded] = useState(() =>
    initialState ? { state: initialState, readOnly: false } : loadStoredState(),
  );
  const [state, dispatch] = useReducer(appStateReducer, loaded.state);
  // A newer build wrote the stored data: saving our normalized copy would
  // strip whatever fields it added, so this tab shows it and never saves.
  const [readOnly, setReadOnly] = useState(loaded.readOnly);

  useEffect(() => {
    if (!readOnly) {
      saveAppState(state);
    }
  }, [state, readOnly]);

  // Ask the browser to keep this origin's storage through disk pressure (and,
  // in Safari, past a week without a visit): the logged days live nowhere
  // else. Asked once there is something to keep, never on a blank first run.
  const hasLoggedDays = Object.keys(state.intensityByDay).length > 0;
  useEffect(() => {
    if (hasLoggedDays) {
      navigator.storage?.persist?.().catch(() => undefined);
    }
  }, [hasLoggedDays]);

  // Another tab (or the installed PWA window) saved: adopt its state instead
  // of overwriting it with ours on our next change. The event only fires for
  // writes from other documents, so this can't loop on our own save above.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        const stored = loadStoredState();
        setReadOnly(stored.readOnly);
        dispatch({ type: "importState", state: stored.state });
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useThemePreference(state.settings.theme);
  useLanguagePreference(state.settings.language);

  return (
    <AppStateContext.Provider value={state}>
      <AppStateDispatchContext.Provider value={dispatch}>
        <ReadOnlyContext.Provider value={readOnly}>
          {children}
        </ReadOnlyContext.Provider>
      </AppStateDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

// Reflect the theme preference onto <html data-theme>, following the OS while
// set to "system". public/theme.js applies the same value before
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
      // Keep the browser chrome (address bar / PWA status bar) in step. Read
      // the ground colour from the tokens so the CSS stays the one source.
      const ground = getComputedStyle(root).getPropertyValue("--bg-top").trim();
      if (ground) {
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute("content", ground);
      }
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

// Reflect the resolved language onto <html lang> so the browser, screen
// readers, and CSS :lang() selectors know what they're reading.
function useLanguagePreference(language: LanguagePreference) {
  useEffect(() => {
    document.documentElement.lang = resolveLanguage(language);
  }, [language]);
}

// The bound translator returned by useT — pass it to module-level helpers that
// need to build localized strings.
export type Translate = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

// The stored language preference, or "system" when rendered outside a provider
// (isolated component tests, Storybook) so leaf components stay self-sufficient.
function useLanguage() {
  return useContext(AppStateContext)?.settings.language ?? "system";
}

// Bound translator for the current language. Components call `const t = useT()`
// then `t("settings.theme")`.
export function useT(): Translate {
  const language = useLanguage();
  return useMemo(() => {
    const lang = resolveLanguage(language);
    return (key: MessageKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars);
  }, [language]);
}

// The resolved BCP-47 locale for date/number formatting (Intl). Read from state
// during render so dates re-format the instant the language changes.
export function useLocale() {
  return resolveLanguage(useLanguage());
}

// True when a newer version of Tide saved the stored data, so this one must
// not write until the page reloads into that version.
export function useIsReadOnly() {
  return useContext(ReadOnlyContext);
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
      logPeriodRange(from: IsoDate, to: IsoDate, today: IsoDate) {
        dispatch({ type: "logPeriodRange", from, to, today });
      },
      dismissReminder(today: IsoDate) {
        dispatch({ type: "dismissReminder", today });
      },
      setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        dispatch({ type: "setSetting", key, value } as AppStateAction);
      },
      importState(state: AppState) {
        dispatch({ type: "importState", state });
      },
      // Wipe every logged day and the orphaned backup blob, so the
      // device holds no history afterwards. Settings reset too.
      resetState() {
        clearAppState();
        dispatch({ type: "importState", state: defaultAppState });
      },
    }),
    [dispatch],
  );
}

// The forecast for `today`. Callers pass the day they render for (useToday, or
// a fixed day in tests), so the app has one clock.
export function useForecast(today: IsoDate) {
  const state = useAppState();
  return useMemo(() => selectForecast(state, today), [state, today]);
}
