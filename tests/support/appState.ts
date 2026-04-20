import { defaultAppState } from "../../src/data/storage";
import type { AppState } from "../../src/domain/types";

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
