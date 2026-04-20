import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  startTransition,
} from "react";
import type { Dispatch, ReactNode } from "react";
import { defaultAppState, loadAppState, saveAppState } from "../data/storage";
import type { AppState } from "../domain/types";
import type { AppStateAction } from "./actions";
import { appStateReducer } from "./reducer";

interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<AppStateAction>;
}

interface AppStateProviderProps {
  children: ReactNode;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appStateReducer, defaultAppState, () =>
    loadAppState(),
  );

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }

  return {
    state: context.state,
    dispatch(action: AppStateAction) {
      startTransition(() => {
        context.dispatch(action);
      });
    },
  };
}
