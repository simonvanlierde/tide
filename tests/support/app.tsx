import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { defaultAppState } from "../../src/data/schema";

import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
} from "../../src/domain/types";
import { AppStateProvider } from "../../src/state/provider";

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

interface AppStateOverrides {
  // Convenience: seed these days at the default (medium) flow. Explicit
  // intensityByDay entries override the default for the same day.
  periodDays?: IsoDate[];
  intensityByDay?: Record<IsoDate, FlowIntensity>;
  settings?: Partial<AppSettings>;
}

export function createAppState(overrides: AppStateOverrides = {}): AppState {
  const { periodDays = [], intensityByDay = {}, settings } = overrides;
  return {
    intensityByDay: {
      // Seeded days carry an explicit level; a one-tap log in the app stores null.
      ...Object.fromEntries(periodDays.map((day) => [day, "medium"])),
      ...intensityByDay,
    },
    settings: {
      ...defaultAppState.settings,
      ...settings,
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
