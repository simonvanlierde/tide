import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { createLearnedCycleState, renderWithAppState } from "../support/app";

const frame = () => document.querySelector(".cycle-dial__frame");

function reduceMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("dial motion", () => {
  it("sweeps the ring on the first view of a day only", () => {
    reduceMotion(false);
    const first = renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createLearnedCycleState() });
    expect(frame()).toHaveClass("is-sweeping");
    first.unmount();

    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createLearnedCycleState() });
    expect(frame()).not.toHaveClass("is-sweeping");
  });

  it("ripples the marker once when today is logged", async () => {
    reduceMotion(false);
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createLearnedCycleState() });
    expect(document.querySelector(".cycle-dial__ripple")).toBeNull();

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(document.querySelectorAll(".cycle-dial__ripple")).toHaveLength(1);
  });

  it("does neither under reduced motion", async () => {
    reduceMotion(true);
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createLearnedCycleState() });
    expect(frame()).not.toHaveClass("is-sweeping");

    await user.click(screen.getByRole("button", { name: /log bleeding today/i }));
    expect(document.querySelector(".cycle-dial__ripple")).toBeNull();
  });
});
