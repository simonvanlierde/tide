import { startTransition, useMemo, useState } from "react";
import { getPastOvulationDates, getPeriodDayNumbers } from "../../domain/cycle";
import {
  DEFAULT_FLOW,
  getPeriodDays,
  getPredictionDays,
} from "../../domain/flow";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
} from "../../state/provider";
import { addMonths } from "../../utils/date";
import {
  buildCalendarMarkers,
  buildCycleDayNumbers,
  buildMonthDays,
  formatMonthLabel,
} from "./calendar";

export function useHistoryCalendar(today: IsoDate) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<IsoDate | null>(null);
  // The day just logged by a one-tap; drives its one-shot "tap to edit" pulse.
  const [justLoggedDay, setJustLoggedDay] = useState<IsoDate | null>(null);

  const monthDays = useMemo(
    () => buildMonthDays(visibleMonth, today),
    [visibleMonth, today],
  );
  const periodDays = useMemo(
    () => getPeriodDays(state.intensityByDay),
    [state.intensityByDay],
  );
  const loggedDays = useMemo(() => new Set(periodDays), [periodDays]);
  const dayIntensity = useMemo(
    () =>
      new Map<IsoDate, FlowIntensity>(
        Object.entries(state.intensityByDay) as [IsoDate, FlowIntensity][],
      ),
    [state.intensityByDay],
  );
  const periodDayNumbers = useMemo(
    // Number days from the same spotting-filtered set the cycle summary uses, so
    // the calendar and the Today dial agree on "day N" of a period.
    () => getPeriodDayNumbers(getPredictionDays(state.intensityByDay)),
    [state.intensityByDay],
  );
  const showFertility = state.settings.showFertility;
  const showCycleDayNumbers = state.settings.showCycleDayNumbers;
  // Ovulation for each completed past cycle, so their fertile windows show the
  // same as the forecast does for the current cycle.
  const pastOvulationDates = useMemo(
    () => getPastOvulationDates(periodDays),
    [periodDays],
  );
  const cycleMarkers = useMemo(
    () =>
      buildCalendarMarkers(
        summary,
        showFertility,
        monthDays[0]?.value ?? visibleMonth,
        monthDays.at(-1)?.value ?? visibleMonth,
        pastOvulationDates,
      ),
    [summary, showFertility, monthDays, visibleMonth, pastOvulationDates],
  );
  // Fills every non-logged day of the current cycle with its cycle-day number,
  // so the calendar shows a running count up to the next expected period.
  const cycleDayNumbers = useMemo(
    () =>
      buildCycleDayNumbers(
        summary,
        monthDays[0]?.value ?? visibleMonth,
        monthDays.at(-1)?.value ?? visibleMonth,
      ),
    [summary, monthDays, visibleMonth],
  );
  const monthLabel = useMemo(
    () => formatMonthLabel(visibleMonth),
    [visibleMonth],
  );

  // keepPickerOpen lets the month/year dropdowns change one field at a time
  // without the panel closing between picks; chevrons and "Today" close it.
  function setMonth(nextMonth: IsoDate, keepPickerOpen = false) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      if (!keepPickerOpen) {
        setIsPickerOpen(false);
      }
      // Close the flow picker too: it edits a specific day, which the new month
      // no longer shows.
      setSelectedDay(null);
      setJustLoggedDay(null);
    });
  }

  function openPicker() {
    setIsPickerOpen((open) => !open);
  }

  return {
    periodDays,
    isPickerOpen,
    // Same year-month as today → the "Today" reset would be a no-op, so the
    // screen hides it. IsoDate is YYYY-MM-DD, so the first 7 chars are the month.
    isCurrentMonth: visibleMonth.slice(0, 7) === today.slice(0, 7),
    monthLabel,
    monthDays,
    loggedDays,
    dayIntensity,
    periodDayNumbers,
    cycleDayNumbers,
    cycleMarkers,
    showFertility,
    showCycleDayNumbers,
    selectedDay,
    justLoggedDay,
    // Mirror the grid: a logged day with no stored level reads as the default
    // flow, so the picker's gauge matches the day's coral fill.
    selectedIntensity:
      selectedDay && loggedDays.has(selectedDay)
        ? (state.intensityByDay[selectedDay] ?? DEFAULT_FLOW)
        : undefined,
    isSelectedLogged: selectedDay ? loggedDays.has(selectedDay) : false,
    openPicker,
    goToPreviousMonth() {
      setMonth(addMonths(visibleMonth, -1));
    },
    goToNextMonth() {
      setMonth(addMonths(visibleMonth, 1));
    },
    goToToday() {
      setMonth(today);
    },
    // Empty day → one-tap log at the default flow (medium). Logged day → open
    // its picker to change the flow or remove it; tapping the open day closes.
    selectDay(day: IsoDate) {
      if (!loggedDays.has(day)) {
        actions.togglePeriodDay(day, today);
        setJustLoggedDay(day);
        // Selection follows the tap: close any picker left open on another day.
        setSelectedDay(null);
        return;
      }
      setJustLoggedDay(null);
      setSelectedDay((current) => (current === day ? null : day));
    },
    closePicker() {
      setSelectedDay(null);
    },
    setDayIntensity(day: IsoDate, intensity: FlowIntensity) {
      actions.setDayIntensity(day, intensity, today);
    },
    removeDay(day: IsoDate) {
      actions.togglePeriodDay(day, today);
      setSelectedDay(null);
    },
    monthPicker: {
      isPickerOpen,
      year: Number(visibleMonth.slice(0, 4)),
      monthIndex: Number(visibleMonth.slice(5, 7)) - 1,
      years: buildYearOptions(periodDays, today, visibleMonth),
      onSelect(year: number, monthIndex: number) {
        const month = String(monthIndex + 1).padStart(2, "0");
        setMonth(`${year}-${month}-01` as IsoDate, true);
      },
    },
  };
}

// How far back and forward the year dropdown reaches by default, so there's
// always somewhere to jump even before much history exists.
const YEARS_BACK = 1;
const YEARS_FORWARD = 1;

// Years offered by the jump-to-month picker: a window around this year, widened
// to cover any older logged period and the month currently on screen so the
// year dropdown can always show its own value.
function buildYearOptions(
  periodDays: IsoDate[],
  today: IsoDate,
  visibleMonth: IsoDate,
): number[] {
  const todayYear = Number(today.slice(0, 4));
  const visibleYear = Number(visibleMonth.slice(0, 4));
  const loggedYears = periodDays.map((day) => Number(day.slice(0, 4)));
  const min = Math.min(todayYear - YEARS_BACK, visibleYear, ...loggedYears);
  const max = Math.max(todayYear + YEARS_FORWARD, visibleYear);
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}
