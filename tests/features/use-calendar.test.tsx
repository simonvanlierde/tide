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

  it("renders a moved forecast in the first receipt without an intermediate status", () => {
    const receipts: boolean[] = [];
    const { result } = renderHook(
      () => {
        const calendar = useCalendar("2026-04-18");
        if (calendar.log.justLoggedDay === "2026-04-16") receipts.push(calendar.log.forecastMoved);
        return calendar;
      },
      { wrapper },
    );
    act(() => result.current.log.selectDay("2026-04-16"));
    expect(receipts.length).toBeGreaterThan(0);
    expect(receipts.every(Boolean)).toBe(true);
  });

  it("expires a day receipt after ten seconds and gives each new log its full time", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => vi.advanceTimersByTime(9000));
    act(() => result.current.log.selectDay("2026-04-05"));
    act(() => vi.advanceTimersByTime(9000));
    expect(result.current.log.justLoggedDay).toBe("2026-04-05");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.log.justLoggedDay).toBeNull();
  });

  it("expires a range receipt without changing its logged days", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.startRangePick());
    act(() => result.current.log.selectDay("2026-04-10"));
    act(() => result.current.log.selectDay("2026-04-12"));
    expect(result.current.log.justLoggedRange?.added).toHaveLength(3);
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.log.justLoggedRange).toBeNull();
    expect(result.current.days.find((day) => day.value === "2026-04-11")?.isLogged).toBe(true);
  });

  it("keeps Undo while feedback is being read and restarts its time after leaving", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => vi.advanceTimersByTime(9000));
    act(() => result.current.log.setFeedbackPaused(true));
    act(() => vi.advanceTimersByTime(60000));
    expect(result.current.log.justLoggedDay).toBe("2026-04-04");
    act(() => result.current.log.setFeedbackPaused(false));
    act(() => vi.advanceTimersByTime(9999));
    expect(result.current.log.justLoggedDay).toBe("2026-04-04");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.log.justLoggedDay).toBeNull();
  });

  it("keeps replacement feedback paused while the user still reads it", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => result.current.log.setFeedbackPaused(true));
    act(() => result.current.log.selectDay("2026-04-05"));
    act(() => vi.advanceTimersByTime(11000));
    expect(result.current.log.justLoggedDay).toBe("2026-04-05");
    act(() => result.current.log.setFeedbackPaused(false));
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.log.justLoggedDay).toBeNull();
  });

  it("cancels receipts on undo and when starting a range", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => result.current.log.undoJustLogged());
    expect(result.current.log.justLoggedDay).toBeNull();
    expect(result.current.days.find((day) => day.value === "2026-04-04")?.isLogged).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => result.current.log.startRangePick());
    expect(result.current.log.justLoggedDay).toBeNull();
    expect(result.current.log.rangePick).toEqual({ from: null, tooLong: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels receipt timers on month changes and unmount", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCalendar("2026-04-18"), { wrapper });
    act(() => result.current.log.selectDay("2026-04-04"));
    act(() => result.current.month.goToPrevious());
    expect(result.current.log.justLoggedDay).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.log.selectDay("2026-03-10"));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

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
