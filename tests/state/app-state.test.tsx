import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { saveAppState } from "../../src/data/storage";
import { createAppState } from "../support/appState";
import { AppStateProvider, appStateReducer } from "../../src/state/appState";
import type { AppState } from "../../src/domain/types";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { TodayScreen } from "../../src/features/today/TodayScreen";

describe("appStateReducer", () => {
  it("toggles a bleeding day and keeps period days sorted", () => {
    const initialState: AppState = createAppState({
      periodDays: ["2026-04-12", "2026-04-02"],
    });

    const state = appStateReducer(initialState, {
      type: "togglePeriodDay",
      day: "2026-04-05",
    });

    expect(state.periodDays).toEqual([
      "2026-04-02",
      "2026-04-05",
      "2026-04-12",
    ]);
  });
});

describe("AppStateProvider", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
    saveAppState(
      createAppState({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
      }),
    );
  });

  it("shares one live state store across multiple mounted screens", () => {
    render(
      <AppStateProvider>
        <SettingsScreen today="2026-04-18" />
        <TodayScreen today="2026-04-18" />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /linear/i }));

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });
});
