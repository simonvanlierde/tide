import { act, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCHEMA_VERSION } from "../../src/data/schema";
import { STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { getPeriodDays } from "../../src/domain/flow";
import { AppStateProvider, useAppState, useAppStateActions, useForecast } from "../../src/state/provider";
import { createAppState, createLearnedCycleState, renderWithAppState } from "../support/app";

function Probe({ label = "probe" }: { label?: string }) {
  const state = useAppState();
  const actions = useAppStateActions();

  return (
    <>
      <output aria-label={`period-days-${label}`}>{getPeriodDays(state.intensityByDay).join(",")}</output>
      <output aria-label={`dismissed-for-${label}`}>{state.settings.dismissedOn ?? ""}</output>
      <button type="button" onClick={() => actions.togglePeriodDay("2026-04-05", "2026-04-18")}>
        toggle {label}
      </button>
      <button type="button" onClick={() => actions.dismissReminder("2026-04-18")}>
        dismiss {label}
      </button>
      <button type="button" onClick={() => actions.importState(createAppState({ periodDays: ["2026-05-01"] }))}>
        import {label}
      </button>
    </>
  );
}

describe("app state", () => {
  it("hydrates from local storage when no explicit initial state is provided", () => {
    const storedState = createLearnedCycleState();
    saveAppState(storedState);

    renderWithAppState(<Probe />);

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent("2026-03-05,2026-03-06,2026-04-02,2026-04-03");
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

    expect(screen.getByLabelText("period-days-b")).toHaveTextContent("2026-04-05");
  });

  it("persists provider updates to local storage", async () => {
    const user = userEvent.setup();
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /dismiss probe/i }));

    expect(screen.getByLabelText("dismissed-for-probe")).toHaveTextContent("2026-04-18");
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"dismissedOn":"2026-04-18"');
  });

  it("adopts another tab's save without writing a different value back", () => {
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    saveAppState(createAppState({ periodDays: ["2026-04-09"] }));
    const otherTabValue = window.localStorage.getItem(STORAGE_KEY);
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });
    setItem.mockRestore();

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent(/^2026-04-09$/);
    // Writing a different value would fire this event in the other tab and
    // start a ping-pong; an identical rewrite is harmless.
    for (const [key, value] of setItem.mock.calls) {
      if (key === STORAGE_KEY) {
        expect(value).toBe(otherTabValue);
      }
    }
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(otherTabValue);
  });

  it("ignores storage events for other keys", () => {
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });
    saveAppState(createAppState({ periodDays: ["2026-04-09"] }));

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent(/^2026-04-02$/);
  });

  it("never saves over data written by a newer build", async () => {
    const raw = JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 1,
      intensityByDay: { "2026-04-02": "heavy" },
      symptomsByDay: { "2026-04-02": ["cramps"] },
    });
    window.localStorage.setItem(STORAGE_KEY, raw);
    const user = userEvent.setup();

    renderWithAppState(<Probe />);
    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent("2026-04-02");
    await user.click(screen.getByRole("button", { name: /toggle probe/i }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it("stops saving once another tab writes data from a newer build", async () => {
    renderWithAppState(<Probe />, { state: createAppState() });
    const raw = JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 1,
      intensityByDay: { "2026-04-09": "light" },
    });
    window.localStorage.setItem(STORAGE_KEY, raw);

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });
    await userEvent.setup().click(screen.getByRole("button", { name: /dismiss probe/i }));

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent("2026-04-09");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it("replaces provider state from an imported backup", async () => {
    const user = userEvent.setup();
    renderWithAppState(<Probe />, {
      state: createAppState({ periodDays: ["2026-04-02"] }),
    });

    await user.click(screen.getByRole("button", { name: /import probe/i }));

    expect(screen.getByLabelText("period-days-probe")).toHaveTextContent("2026-05-01");
  });

  it("asks for persistent storage once a day is logged, not before", async () => {
    const persist = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, "storage", {
      value: { persist },
      configurable: true,
    });
    const user = userEvent.setup();
    try {
      renderWithAppState(<Probe />, { state: createAppState() });
      expect(persist).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "toggle probe" }));

      expect(persist).toHaveBeenCalledOnce();
    } finally {
      Reflect.deleteProperty(navigator, "storage");
    }
  });

  it("refuses to expose state or actions outside a provider", () => {
    expect(() => renderHook(() => useAppState())).toThrow(/must be used inside AppStateProvider/);
    expect(() => renderHook(() => useAppStateActions())).toThrow(/must be used inside AppStateProvider/);
  });

  it("forecasts for the day the caller passes", () => {
    const { result } = renderHook(() => useForecast("2026-04-18"), {
      wrapper: ({ children }) => (
        <AppStateProvider initialState={createLearnedCycleState()}>{children}</AppStateProvider>
      ),
    });

    expect(result.current.cycleDay).toBe(17);
  });
});

describe("system theme preference", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubMatchMedia(initialMatches: boolean) {
    let matches = initialMatches;
    const listeners = new Set<() => void>();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return matches;
        },
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      })),
    );
    return {
      emitChange(next: boolean) {
        matches = next;
        for (const fn of listeners) fn();
      },
      listenerCount: () => listeners.size,
    };
  }

  it("follows the OS preference and reacts to changes while theme is system", () => {
    const media = stubMatchMedia(true);

    const { unmount } = renderWithAppState(<output>probe</output>, {
      state: createAppState({ settings: { theme: "system" } }),
    });

    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => media.emitChange(false));
    expect(document.documentElement.dataset.theme).toBe("light");

    // The change listener is torn down on unmount.
    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it("keeps the theme-color meta tag in step with the resolved theme", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
    // The provider reads the ground colour from the --bg-top token; jsdom
    // doesn't apply the stylesheet, so supply it inline.
    document.documentElement.style.setProperty("--bg-top", "#0e1a1e");

    try {
      renderWithAppState(<output>probe</output>, {
        state: createAppState({ settings: { theme: "dark" } }),
      });

      expect(meta.getAttribute("content")).toBe("#0e1a1e");
    } finally {
      meta.remove();
      document.documentElement.style.removeProperty("--bg-top");
    }
  });
});
