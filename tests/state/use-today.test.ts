import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToday } from "../../src/state/useToday";

afterEach(() => {
  vi.useRealTimers();
});

describe("useToday", () => {
  it("rolls over at local midnight while the app stays open", () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(new Date(2026, 3, 18, 23, 59, 30));
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-04-18");

    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(result.current).toBe("2026-04-19");

    // The next midnight is armed too.
    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    });
    expect(result.current).toBe("2026-04-20");
  });

  it("re-reads the date when a backgrounded app comes back", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 3, 18, 22, 0));
    const { result } = renderHook(() => useToday());

    // Hidden overnight, so no timer fired.
    vi.setSystemTime(new Date(2026, 3, 19, 7, 0));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("2026-04-19");
  });
});
