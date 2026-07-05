import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
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
      <output aria-label="reminder-window">
        {state.settings.reminderWindowDays}
      </output>
      <button
        type="button"
        onClick={() => actions.togglePeriodDay("2026-04-05", "2026-04-18")}
      >
        toggle april 5
      </button>
      <button type="button" onClick={() => actions.setReminderWindowDays(6)}>
        set window 6
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
        <Probe />
      </>,
      { state: createLearnedCycleState() },
    );

    await user.click(screen.getByRole("button", { name: /^6 days$/i }));

    expect(screen.getByLabelText("reminder-window")).toHaveTextContent("6");
  });

  it("persists provider updates to local storage", async () => {
    const user = userEvent.setup();
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /set window 6/i }));

    expect(screen.getByLabelText("reminder-window")).toHaveTextContent("6");
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain(
      '"reminderWindowDays":6',
    );
  });
});
