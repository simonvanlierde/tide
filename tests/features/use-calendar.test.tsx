import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useCalendar } from "../../src/features/calendar/useCalendar";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, createLearnedCycleState } from "../support/app";

function wrapper({ children }: { children: ReactNode }) {
  return <AppStateProvider initialState={createLearnedCycleState()}>{children}</AppStateProvider>;
}

describe("useCalendar", () => {
  it("closes the flow picker by clearing the selected day", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.log.selectDay("2026-04-02"));
    expect(result.current.log.selectedDay).toBe("2026-04-02");

    act(() => result.current.log.closePicker());
    expect(result.current.log.selectedDay).toBeNull();
  });

  it("jumps to a month and year selected from the picker", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    // monthIndex is 0-based: 10 → November.
    act(() => result.current.month.picker.onSelect(2025, 10));
    expect(result.current.month.label).toBe("November 2025");
  });

  it("offers a buffered window around the logged and current years", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    // Fixture logs only 2026, so the span is just this year padded a year each
    // side. An older backup widens the low end (see the next test).
    expect(result.current.month.picker.years).toEqual([2025, 2026, 2027]);
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
    expect(result.current.month.picker.years).toEqual([2021, 2022, 2023, 2024, 2025, 2026, 2027]);
  });

  it("widens the year window to include a month browsed outside it", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.month.picker.onSelect(2030, 0));
    expect(result.current.month.picker.years).toContain(2030);
  });

  it("closes the flow picker and the just-logged line on a month change, but keeps a range pick open", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.log.selectDay("2026-04-02"));
    act(() => result.current.month.goToPrevious());
    expect(result.current.log.selectedDay).toBeNull();

    act(() => result.current.log.selectDay("2026-03-20"));
    expect(result.current.log.justLoggedDay).toBe("2026-03-20");
    act(() => result.current.month.goToNext());
    expect(result.current.log.justLoggedDay).toBeNull();

    // A period can run across the month boundary.
    act(() => result.current.log.startRangePick());
    act(() => result.current.log.selectDay("2026-04-10"));
    act(() => result.current.month.goToPrevious());
    expect(result.current.log.rangePick).toEqual({
      from: "2026-04-10",
      tooLong: false,
    });
  });

  it("flags a log that moves the forecast until the month changes", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    // Next to the last period: same cycle, the forecast stays put.
    act(() => result.current.log.selectDay("2026-04-04"));
    expect(result.current.log.forecastMoved).toBe(false);

    // 13 days after it: a new cycle starts, so the next period moves.
    act(() => result.current.log.selectDay("2026-04-16"));
    expect(result.current.log.forecastMoved).toBe(true);

    act(() => result.current.month.goToNext());
    expect(result.current.log.forecastMoved).toBe(false);
  });
});
