import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { getPastOvulationDates } from "../../domain/cycle";
import { getPeriodDays, getPredictionDays } from "../../domain/flow";
import type { FlowIntensity, IsoDate, LoggedFlow } from "../../domain/types";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
  useLocale,
} from "../../state/provider";
import { addMonths, formatMonthLabel } from "../../utils/date";
import type { LegendKey } from "./CalendarScreen";
import {
  buildCalendarMarkers,
  buildCycleDayNumbers,
  buildMonthDays,
} from "./calendar";

export function useCalendar(today: IsoDate) {
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
  // Spotting-filtered days: the same set the cycle summary predicts from, so
  // cycle-start detection (numbering, past ovulation) can't diverge from it.
  const predictionDays = useMemo(
    () => getPredictionDays(state.intensityByDay),
    [state.intensityByDay],
  );
  const loggedDays = useMemo(() => new Set(periodDays), [periodDays]);
  const dayIntensity = useMemo(
    () =>
      new Map<IsoDate, LoggedFlow>(
        Object.entries(state.intensityByDay) as [IsoDate, LoggedFlow][],
      ),
    [state.intensityByDay],
  );
  const showFertility = state.settings.showFertility;
  const showCycleDayNumbers = state.settings.showCycleDayNumbers;
  // Ovulation for each completed past cycle, so their fertile windows show the
  // same as the forecast does for the current cycle.
  const pastOvulationDates = useMemo(
    () => getPastOvulationDates(predictionDays),
    [predictionDays],
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
        today,
        monthDays[0]?.value ?? visibleMonth,
        monthDays.at(-1)?.value ?? visibleMonth,
      ),
    [summary, today, monthDays, visibleMonth],
  );
  // Which legend entries this month actually needs.
  const presentMarkers = useMemo(() => {
    const present = new Set<LegendKey>();
    for (const day of monthDays) {
      if (loggedDays.has(day.value)) {
        present.add("logged");
        continue;
      }
      const marker = cycleMarkers.get(day.value);
      if (marker === "predicted-period") present.add("predicted");
      else if (marker === "ovulation") present.add("ovulation");
      else if (marker === "fertile") present.add("fertile");
    }
    return present;
  }, [monthDays, loggedDays, cycleMarkers]);
  const isWholeMonthFuture = (monthDays[0]?.value ?? visibleMonth) > today;
  // Whether any corner number is actually drawn this month — the grid hides
  // them on logged and future days, so the setting alone doesn't answer it.
  const showsCycleDayNumbers =
    showCycleDayNumbers &&
    monthDays.some(
      (day) =>
        !day.isFuture &&
        !loggedDays.has(day.value) &&
        cycleDayNumbers.has(day.value),
    );

  // A log can move the next-period date (a big enough gap starts a new cycle),
  // which repaints every forecast fill in the month. Say so rather than letting
  // the grid change under the user's hand. No timer on the status line: it
  // stands until the next tap, month change, or undo makes it stale, so Undo is
  // never snatched away mid-read.
  const previousForecast = useRef(summary.nextPeriod.date);
  const [forecastMoved, setForecastMoved] = useState(false);
  useEffect(() => {
    const moved = previousForecast.current !== summary.nextPeriod.date;
    previousForecast.current = summary.nextPeriod.date;
    if (moved && justLoggedDay) {
      setForecastMoved(true);
    }
  }, [summary.nextPeriod.date, justLoggedDay]);

  const locale = useLocale();
  const monthLabel = useMemo(
    () => formatMonthLabel(visibleMonth, locale),
    [visibleMonth, locale],
  );

  // keepPickerOpen lets the month/year dropdowns change one field at a time
  // without the panel closing between picks; chevrons and "Today" close it.
  // Takes an updater so held PageUp/PageDown and fast swipes step from the
  // latest month, not the last committed one — inside a transition several
  // pages can arrive before a commit.
  function setMonth(
    nextMonth: IsoDate | ((current: IsoDate) => IsoDate),
    keepPickerOpen = false,
  ) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      if (!keepPickerOpen) {
        setIsPickerOpen(false);
      }
      // Close the flow picker too: it edits a specific day, which the new month
      // no longer shows.
      setSelectedDay(null);
      setJustLoggedDay(null);
      setForecastMoved(false);
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
    presentMarkers,
    isWholeMonthFuture,
    cycleDayNumbers,
    cycleMarkers,
    showFertility,
    showCycleDayNumbers,
    showsCycleDayNumbers,
    selectedDay,
    justLoggedDay,
    forecastMoved,
    // A day logged without a level leaves the gauge unselected: it is a
    // question to answer, not a choice already made on the user's behalf.
    selectedIntensity:
      selectedDay && loggedDays.has(selectedDay)
        ? state.intensityByDay[selectedDay]
        : undefined,
    isSelectedLogged: selectedDay ? loggedDays.has(selectedDay) : false,
    openPicker,
    goToPreviousMonth() {
      setMonth((current) => addMonths(current, -1));
    },
    goToNextMonth() {
      setMonth((current) => addMonths(current, 1));
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
        setForecastMoved(false);
        // Selection follows the tap: close any picker left open on another day.
        setSelectedDay(null);
        return;
      }
      setJustLoggedDay(null);
      setForecastMoved(false);
      setSelectedDay((current) => (current === day ? null : day));
    },
    closePicker() {
      setSelectedDay(null);
    },
    undoJustLogged() {
      if (justLoggedDay && loggedDays.has(justLoggedDay)) {
        actions.togglePeriodDay(justLoggedDay, today);
      }
      setJustLoggedDay(null);
      setForecastMoved(false);
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

// Years padded on each side of the covered span, so a user who started logging
// in January can still reach the year before, and there's always a year ahead.
const YEAR_BUFFER = 1;

// Years offered by the jump-to-month picker. The span always covers every logged
// year, the current year, the month currently on screen, and the years between
// them; YEAR_BUFFER pads each end. So an old backup spanning 2022–2024 in 2026
// yields 2021–2027.
function buildYearOptions(
  periodDays: IsoDate[],
  today: IsoDate,
  visibleMonth: IsoDate,
): number[] {
  const years = [
    Number(today.slice(0, 4)),
    Number(visibleMonth.slice(0, 4)),
    ...periodDays.map((day) => Number(day.slice(0, 4))),
  ];
  const min = Math.min(...years) - YEAR_BUFFER;
  const max = Math.max(...years) + YEAR_BUFFER;
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}
