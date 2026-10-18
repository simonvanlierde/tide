import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { FlowIntensity, IsoDate } from "../../src/domain/types";
import { useCalendar } from "../../src/features/calendar/useCalendar";
import { AppStateProvider } from "../../src/state/provider";
import { addDays } from "../../src/utils/date";
import { createAppState } from "../support/app";

// Random histories driven through random taps, month changes and undos. Each
// run's outputs are hashed into a snapshot, so any change to what the calendar
// shows or how it reacts fails here, not only the cases written out by hand.

const TODAY: IsoDate = "2026-04-18";
const RUNS = 120;
const STEPS = 40;
const FLOWS: FlowIntensity[] = ["spotting", "light", "medium", "heavy"];

// mulberry32: small, seedable, the same sequence on every machine.
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(next: () => number, items: readonly T[]): T {
  return items[Math.floor(next() * items.length)] as T;
}

function randomHistory(next: () => number) {
  const intensityByDay: Record<IsoDate, FlowIntensity> = {};
  let start = addDays(TODAY, -Math.floor(next() * 300) - 20);
  // Up to a few future-dated days too, as an import can leave behind.
  const end = addDays(TODAY, Math.floor(next() * 10));
  while (start <= end) {
    const length = 1 + Math.floor(next() * 8);
    for (let day = 0; day < length; day++) {
      if (next() > 0.15) {
        intensityByDay[addDays(start, day)] = pick(next, FLOWS);
      }
    }
    start = addDays(start, 18 + Math.floor(next() * 25));
  }
  return createAppState({
    intensityByDay,
    settings: {
      showFertility: pick(next, [true, false, null]),
      showCycleDayNumbers: next() > 0.5,
    },
  });
}

type Model = ReturnType<typeof useCalendar>;

// Everything the screen reads from the hook, by name.
function view(model: Model) {
  return {
    isCurrentMonth: model.isCurrentMonth,
    monthLabel: model.monthLabel,
    days: model.days
      .map(
        (day) =>
          `${day.value}:${day.isLogged ? (day.flow ?? "-") : ""}:${day.estimate ?? ""}:${day.cycleDay ?? ""}`,
      )
      .join(","),
    helpKey: model.helpKey,
    selectedDay: model.selectedDay,
    justLoggedDay: model.justLoggedDay,
    forecastMoved: model.forecastMoved,
    selectedIntensity: model.selectedIntensity,
    isSelectedLogged: model.isSelectedLogged,
    rangePick: model.rangePick,
    justLoggedRange: model.justLoggedRange,
    picker: model.monthPicker,
  };
}

function step(next: () => number, model: Model) {
  const day = pick(next, model.days).value;
  const selected = model.selectedDay;
  const actions = [
    () => model.selectDay(day),
    () => model.selectDay(day),
    () => model.selectDay(day),
    () => model.goToPreviousMonth(),
    () => model.goToNextMonth(),
    () => model.goToToday(),
    () => model.openPicker(),
    () =>
      model.monthPicker.onSelect(
        pick(next, model.monthPicker.years),
        Math.floor(next() * 12),
      ),
    () => model.startRangePick(),
    () => model.cancelRangePick(),
    () => model.closePicker(),
    () => model.undoJustLogged(),
    () => selected && model.setDayIntensity(selected, pick(next, FLOWS)),
    () => selected && model.removeDay(selected),
  ];
  pick(next, actions)();
}

function hash(text: string) {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value = Math.imul(value ^ text.charCodeAt(index), 0x01000193) >>> 0;
  }
  return value.toString(16).padStart(8, "0");
}

function run(seed: number) {
  const next = random(seed);
  const state = randomHistory(next);
  const { result, unmount } = renderHook(() => useCalendar(TODAY), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AppStateProvider initialState={state}>{children}</AppStateProvider>
    ),
  });
  const trace = [JSON.stringify(view(result.current))];
  for (let index = 0; index < STEPS; index++) {
    act(() => step(next, result.current));
    trace.push(JSON.stringify(view(result.current)));
  }
  unmount();
  return hash(trace.join("\n"));
}

describe("useCalendar over random histories", () => {
  it("shows and reacts the same as recorded", () => {
    const hashes = Array.from({ length: RUNS }, (_, seed) => run(seed + 1));
    expect(hashes.join(" ")).toMatchSnapshot();
  });
});
