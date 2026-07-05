import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { useAppState, useAppStateActions } from "../../src/state/provider";
import {
  createAppState,
  createLearnedCycleState,
  renderWithAppState,
} from "../support/app";

function Probe({ label = "probe" }: { label?: string }) {
  const state = useAppState();
  const actions = useAppStateActions();

  return (
    <>
      <output aria-label={`period-days-${label}`}>
        {state.periodDays.join(",")}
      </output>
      <output aria-label={`dismissed-for-${label}`}>
        {state.settings.dismissedFor ?? ""}
      </output>
      <button
        type="button"
        onClick={() => actions.togglePeriodDay("2026-04-05", "2026-04-18")}
      >
        toggle {label}
      </button>
      <button
        type="button"
        onClick={() => actions.dismissReminder("2026-04-18")}
      >
        dismiss {label}
      </button>
    </>
  );
}

describe("app state", () => {
  it("hydrates from local storage when no explicit initial state is provided", () => {
    const storedState = createLearnedCycleState();
    saveAppState(storedState);

    renderWithAppState(<Probe />);

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent(
      "2026-03-05,2026-03-06,2026-04-02,2026-04-03",
    );
  });

  it("shares one live provider state across multiple mounted screens", async () => {
    const user = userEvent.setup();
    renderWithAppState(
      <>
        <Probe label="a" />
        <Probe label="b" />
      </>,
      { state: createAppState() },
    );

    await user.click(screen.getByRole("button", { name: /toggle a/i }));

    expect(screen.getByLabelText("period-days-b")).toHaveTextContent(
      "2026-04-05",
    );
  });

  it("persists provider updates to local storage", async () => {
    const user = userEvent.setup();
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /dismiss probe/i }));

    expect(screen.getByLabelText("dismissed-for-probe")).toHaveTextContent(
      "2026-04-18",
    );
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain(
      '"dismissedFor":"2026-04-18"',
    );
  });
});
