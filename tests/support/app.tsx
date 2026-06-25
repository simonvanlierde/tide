import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { defaultAppState } from "../../src/data/schema";
import type { AppSettings, AppState, IsoDate } from "../../src/domain/types";
import { AppStateProvider } from "../../src/state";

export const LEARNED_PERIOD_DAYS: IsoDate[] = [
  "2026-03-05",
  "2026-03-06",
  "2026-04-02",
  "2026-04-03",
];

export const LEARNING_PERIOD_DAYS: IsoDate[] = ["2026-04-19", "2026-04-20"];

export function createLearnedCycleState() {
  return createAppState({ periodDays: LEARNED_PERIOD_DAYS });
}

export function createLearningCycleState() {
  return createAppState({ periodDays: LEARNING_PERIOD_DAYS });
}

type AppStateOverrides = Partial<Omit<AppState, "settings">> & {
  settings?: Partial<AppSettings>;
};

export function createAppState(overrides: AppStateOverrides = {}): AppState {
  return {
    ...defaultAppState,
    ...overrides,
    settings: {
      ...defaultAppState.settings,
      ...overrides.settings,
    },
  };
}

interface RenderWithAppStateOptions {
  state?: AppState;
}

export function renderWithAppState(
  ui: ReactNode,
  { state }: RenderWithAppStateOptions = {},
) {
  return render(<AppStateProvider initialState={state}>{ui}</AppStateProvider>);
}
