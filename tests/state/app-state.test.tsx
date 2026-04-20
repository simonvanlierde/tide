import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { saveAppState } from "../../src/data/storage";
import {
  useAppState,
  useAppStateActions,
} from "../../src/state";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import {
  createAppState,
  renderWithAppStateProvider,
} from "../support/app";

function Probe() {
  const state = useAppState();
  const actions = useAppStateActions();

  return (
    <>
      <output aria-label="period-days">{state.periodDays.join(",")}</output>
      <output aria-label="display-mode">{state.settings.homeDisplayMode}</output>
      <button type="button" onClick={() => actions.togglePeriodDay("2026-04-05")}>
        toggle april 5
      </button>
      <button type="button" onClick={() => actions.setHomeDisplayMode("circular")}>
        set circular
      </button>
    </>
  );
}

describe("app state", () => {
  it("hydrates from local storage when no explicit initial state is provided", () => {
    const storedState = createAppState({
      periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
    });
    saveAppState(storedState);

    renderWithAppStateProvider(<Probe />);

    expect(screen.getByLabelText("period-days")).toHaveTextContent(
      "2026-03-05,2026-03-06,2026-04-02,2026-04-03",
    );
  });

  it("shares one live provider state across multiple mounted screens", () => {
    renderWithAppStateProvider(
      <>
        <SettingsScreen today="2026-04-18" />
        <TodayScreen today="2026-04-18" />
      </>,
      createAppState({
        periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /linear/i }));

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("persists provider updates to local storage", () => {
    renderWithAppStateProvider(
      <Probe />,
      createAppState({
        periodDays: ["2026-04-02"],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /set circular/i }));

    expect(screen.getByLabelText("display-mode")).toHaveTextContent("circular");
    expect(window.localStorage.getItem("tide.period-tracker.state")).toContain(
      "\"homeDisplayMode\":\"circular\"",
    );
  });
});
