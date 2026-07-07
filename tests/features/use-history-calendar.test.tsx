import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useHistoryCalendar } from "../../src/features/history/useHistoryCalendar";
import { AppStateProvider } from "../../src/state/provider";
import { createLearnedCycleState } from "../support/app";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider initialState={createLearnedCycleState()}>
      {children}
    </AppStateProvider>
  );
}

describe("useHistoryCalendar", () => {
  it("closes the flow picker by clearing the selected day", () => {
    const { result } = renderHook(() => useHistoryCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.selectDay("2026-04-02"));
    expect(result.current.selectedDay).toBe("2026-04-02");

    act(() => result.current.closePicker());
    expect(result.current.selectedDay).toBeNull();
  });

  it("jumps to a month and year selected from the picker", () => {
    const { result } = renderHook(() => useHistoryCalendar("2026-04-18"), {
      wrapper,
    });

    // monthIndex is 0-based: 10 → November.
    act(() => result.current.monthPicker.onSelect(2025, 10));
    expect(result.current.monthLabel).toBe("November 2025");
  });

  it("offers a window of years by default, even with little history", () => {
    const { result } = renderHook(() => useHistoryCalendar("2026-04-18"), {
      wrapper,
    });

    // Five years back through one ahead, regardless of how few days are logged.
    expect(result.current.monthPicker.years).toEqual([
      2021, 2022, 2023, 2024, 2025, 2026, 2027,
    ]);
  });

  it("widens the year window to include a month browsed outside it", () => {
    const { result } = renderHook(() => useHistoryCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.monthPicker.onSelect(2030, 0));
    expect(result.current.monthPicker.years).toContain(2030);
  });
});
