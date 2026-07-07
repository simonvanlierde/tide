import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useCalendar } from "../../src/features/calendar/useCalendar";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, createLearnedCycleState } from "../support/app";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider initialState={createLearnedCycleState()}>
      {children}
    </AppStateProvider>
  );
}

describe("useCalendar", () => {
  it("closes the flow picker by clearing the selected day", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.selectDay("2026-04-02"));
    expect(result.current.selectedDay).toBe("2026-04-02");

    act(() => result.current.closePicker());
    expect(result.current.selectedDay).toBeNull();
  });

  it("jumps to a month and year selected from the picker", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    // monthIndex is 0-based: 10 → November.
    act(() => result.current.monthPicker.onSelect(2025, 10));
    expect(result.current.monthLabel).toBe("November 2025");
  });

  it("offers a buffered window around the logged and current years", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    // Fixture logs only 2026, so the span is just this year padded a year each
    // side. An older backup widens the low end (see the next test).
    expect(result.current.monthPicker.years).toEqual([2025, 2026, 2027]);
  });

  it("reaches back to the earliest logged year plus a buffer", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper: ({ children }) => (
        <AppStateProvider
          initialState={createAppState({
            periodDays: ["2022-05-01", "2024-08-10"],
          })}
        >
          {children}
        </AppStateProvider>
      ),
    });

    // Logs span 2022–2024, today is 2026: cover 2022–2026, pad to 2021–2027.
    expect(result.current.monthPicker.years).toEqual([
      2021, 2022, 2023, 2024, 2025, 2026, 2027,
    ]);
  });

  it("widens the year window to include a month browsed outside it", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.monthPicker.onSelect(2030, 0));
    expect(result.current.monthPicker.years).toContain(2030);
  });
});
