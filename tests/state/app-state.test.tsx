import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { useAppState, useAppStateActions } from "../../src/state/provider";
import {
  createAppState,
  createLearnedCycleState,
  renderWithAppState,
} from "../support/app";

function Probe() {
  const state = useAppState();
  const actions = useAppStateActions();

  return (
    <>
      <output aria-label="period-days">{state.periodDays.join(",")}</output>
      <output aria-label="display-mode">
        {state.settings.homeDisplayMode}
      </output>
      <button
        type="button"
        onClick={() => actions.togglePeriodDay("2026-04-05")}
      >
        toggle april 5
      </button>
      <button
        type="button"
        onClick={() => actions.setHomeDisplayMode("circular")}
      >
        set circular
      </button>
    </>
  );
}

describe("app state", () => {
  it("hydrates from local storage when no explicit initial state is provided", () => {
    const storedState = createLearnedCycleState();
    saveAppState(storedState);

    renderWithAppState(<Probe />);

    expect(screen.getByLabelText("period-days")).toHaveTextContent(
      "2026-03-05,2026-03-06,2026-04-02,2026-04-03",
    );
  });

  it("shares one live provider state across multiple mounted screens", async () => {
    const user = userEvent.setup();
    renderWithAppState(
      <>
        <SettingsScreen today="2026-04-18" />
        <TodayScreen today="2026-04-18" />
      </>,
      { state: createLearnedCycleState() },
    );

    await user.click(screen.getByRole("button", { name: /linear/i }));

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("persists provider updates to local storage", async () => {
    const user = userEvent.setup();
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /set circular/i }));

    expect(screen.getByLabelText("display-mode")).toHaveTextContent("circular");
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain(
      '"homeDisplayMode":"circular"',
    );
  });
});
