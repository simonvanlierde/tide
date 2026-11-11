import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { createAppState, createLearnedCycleState, renderWithAppState } from "../support/app";

// Both lazy chunks fail to load, as they would offline before the app is cached.
vi.mock("../../src/features/today/ForecastExplainer", () => {
  throw new Error("chunk failed to load");
});
vi.mock("../../src/data/calendarFile", () => {
  throw new Error("chunk failed to load");
});
vi.mock("../../src/data/otherApps", () => {
  throw new Error("chunk failed to load");
});

describe("a lazy chunk that fails to load", () => {
  it("reports a failed import reader without changing existing history", async () => {
    const user = userEvent.setup();
    renderWithAppState(<SettingsScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File(["{}"], "clue.json", { type: "application/json" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/import couldn't be opened/i);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("says so in Cycle insights when the sums fail to load", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: createLearnedCycleState(),
    });

    await user.click(screen.getByRole("button", { name: /cycle insights/i }));

    // The rest of the sheet still opens; only the sums are missing.
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't be opened/i);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("says so in Settings instead of saving nothing", async () => {
    const user = userEvent.setup();
    renderWithAppState(<SettingsScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-03-05", "2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /add to calendar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/calendar file couldn't be made/i);
  });
});
