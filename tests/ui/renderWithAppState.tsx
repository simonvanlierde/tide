import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { defaultAppState } from "../../src/data/storage";
import type { AppState } from "../../src/domain/types";
import { AppStateProvider } from "../../src/state/appState";

interface RenderWithAppStateOptions {
  state?: AppState;
}

export function renderWithAppState(
  ui: ReactElement,
  options: RenderWithAppStateOptions = {},
) {
  window.localStorage.clear();
  window.localStorage.setItem(
    "tide.period-tracker.state",
    JSON.stringify(options.state ?? defaultAppState),
  );

  return render(<AppStateProvider>{ui}</AppStateProvider>);
}
