import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { defaultAppState } from "../../src/data/schema";
import type { AppState } from "../../src/domain/types";
import { AppStateProvider } from "../../src/state";

export function createLearnedCycleState() {
  return createAppState({
    periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
  });
}

export function createLearningCycleState() {
  return createAppState({
    periodDays: ["2026-04-19", "2026-04-20"],
  });
}

export function createAppState(overrides: Partial<AppState> = {}): AppState {
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
  ui: ReactElement,
  options: RenderWithAppStateOptions = {},
) {
  return render(
    <AppStateProvider initialState={options.state ?? createAppState()}>
      {ui}
    </AppStateProvider>,
  );
}

export function renderWithAppStateProvider(
  children: ReactNode,
  initialState?: AppState,
) {
  return render(
    <AppStateProvider initialState={initialState}>{children}</AppStateProvider>,
  );
}
