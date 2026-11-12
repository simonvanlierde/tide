import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCalendar } from "../../src/features/calendar/useCalendar";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, createLearnedCycleState } from "../support/app";

function wrapper({ children }: { children: ReactNode }) {
  return <AppStateProvider initialState={createLearnedCycleState()}>{children}</AppStateProvider>;
}

describe("useCalendar", () => {
  afterEach(() => vi.useRealTimers());

  function logRange(
    getLog: () => ReturnType<typeof useCalendar>["log"],
    from: "2026-04-04" | "2026-04-16" = "2026-04-04",
  ) {
    act(() => getLog().startRangePick());
    act(() => getLog().selectRangeDay(from));
    act(() => getLog().selectRangeDay(from));
  }

  it("selects available days without writing bleeding or dismissing guidance", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.openDay("2026-04-04"));
    expect(result.current.log.selectedDay).toBe("2026-04-04");
    expect(result.current.days.find((day) => day.value === "2026-04-04")?.isLogged).toBe(false);
    act(() => result.current.log.selectRangeDay("2026-04-05"));
    expect(result.current.days.find((day) => day.value === "2026-04-05")?.isLogged).toBe(false);
    act(() => result.current.log.openDay("2026-04-19"));
    expect(result.current.log.selectedDay).toBe("2026-04-04");
  });

  it("renders a moved forecast in the first range receipt without an intermediate status", () => {
    const receipts: boolean[] = [];
    const { result } = renderHook(
      () => {
        const calendar = useCalendar("2026-04-18");
        if (calendar.log.justLoggedRange?.from === "2026-04-16") receipts.push(calendar.log.forecastMoved);
        return calendar;
      },
      { wrapper },
    );
    logRange(() => result.current.log, "2026-04-16");
    expect(receipts.length).toBeGreaterThan(0);
    expect(receipts.every(Boolean)).toBe(true);
  });

  it("expires a range receipt without changing its logged days", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.startRangePick());
    act(() => result.current.log.selectRangeDay("2026-04-10"));
    act(() => result.current.log.selectRangeDay("2026-04-12"));
    expect(result.current.log.justLoggedRange?.added).toHaveLength(3);
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.log.justLoggedRange).toBeNull();
    expect(result.current.days.find((day) => day.value === "2026-04-11")?.isLogged).toBe(true);
  });

  it("gives a replacement range receipt its full ten seconds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    logRange(() => result.current.log);
    act(() => vi.advanceTimersByTime(9000));
    logRange(() => result.current.log, "2026-04-16");
    act(() => vi.advanceTimersByTime(9999));
    expect(result.current.log.justLoggedRange?.from).toBe("2026-04-16");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.log.justLoggedRange).toBeNull();
  });

  it("keeps range Undo while feedback is being read and restarts its time after leaving", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    logRange(() => result.current.log);
    act(() => vi.advanceTimersByTime(9000));
    act(() => result.current.log.setFeedbackPaused(true));
    act(() => vi.advanceTimersByTime(60000));
    expect(result.current.log.justLoggedRange?.from).toBe("2026-04-04");
    act(() => result.current.log.setFeedbackPaused(false));
    act(() => vi.advanceTimersByTime(9999));
    expect(result.current.log.justLoggedRange?.from).toBe("2026-04-04");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.log.justLoggedRange).toBeNull();
  });

  it("cancels receipt timers on undo, a new range, month changes and unmount", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    logRange(() => result.current.log);
    act(() => result.current.log.undoJustLogged());
    expect(result.current.log.justLoggedRange).toBeNull();
    expect(result.current.days.find((day) => day.value === "2026-04-04")?.isLogged).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    logRange(() => result.current.log);
    act(() => result.current.log.startRangePick());
    expect(result.current.log.justLoggedRange).toBeNull();
    expect(result.current.log.rangePick).toEqual({ from: null, tooLong: false });
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.log.selectRangeDay("2026-04-04"));
    act(() => result.current.log.selectRangeDay("2026-04-04"));
    act(() => result.current.month.goToPrevious());
    expect(result.current.log.justLoggedRange).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    logRange(() => result.current.log);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("closes the flow picker by clearing the selected day", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper,
    });

    act(() => result.current.log.openDay("2026-04-02"));
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

  it("includes diary-only years in the month picker", () => {
    const { result } = renderHook(() => useCalendar("2026-04-18"), {
      wrapper: ({ children }) => (
        <AppStateProvider
          initialState={createAppState({
            detailsByDay: {
              "2020-06-12": { symptoms: null, mood: null, note: "Saved note" },
            },
          })}
        >
          {children}
        </AppStateProvider>
      ),
    });
    expect(result.current.month.picker.years[0]).toBe(2019);
    expect(result.current.month.picker.years).toContain(2020);
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

    act(() => result.current.log.openDay("2026-04-02"));
    act(() => result.current.month.goToPrevious());
    expect(result.current.log.selectedDay).toBeNull();

    logRange(() => result.current.log);
    expect(result.current.log.justLoggedRange?.from).toBe("2026-04-04");
    act(() => result.current.month.goToNext());
    expect(result.current.log.justLoggedRange).toBeNull();

    // A period can run across the month boundary.
    act(() => result.current.log.startRangePick());
    act(() => result.current.log.selectRangeDay("2026-04-10"));
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
    logRange(() => result.current.log);
    expect(result.current.log.forecastMoved).toBe(false);

    // 13 days after it: a new cycle starts, so the next period moves.
    logRange(() => result.current.log, "2026-04-16");
    expect(result.current.log.forecastMoved).toBe(true);

    act(() => result.current.month.goToNext());
    expect(result.current.log.forecastMoved).toBe(false);
  });
});
