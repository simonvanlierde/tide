import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { saveAppState } from "../../src/data/storage";
import { AppStateProvider } from "../../src/state/appState";
import { createAppState } from "../support/appState";

interface RenderWithAppStateOptions {
  state?: ReturnType<typeof createAppState>;
}

export function renderWithAppState(
  ui: ReactElement,
  options: RenderWithAppStateOptions = {},
) {
  window.localStorage.clear();
  saveAppState(options.state ?? createAppState());

  return render(<AppStateProvider>{ui}</AppStateProvider>);
}
