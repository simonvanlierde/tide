import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AppStateProvider } from "../../src/state/provider";
import { useHistoryCalendar } from "../../src/features/history/useHistoryCalendar";
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

  it("ignores a cleared native month input without changing the visible month", () => {
    const { result } = renderHook(() => useHistoryCalendar("2026-04-18"), {
      wrapper,
    });

    const before = result.current.monthLabel;
    act(() => result.current.monthPicker.onNativeMonthChange(""));
    expect(result.current.monthLabel).toBe(before);
  });
});
