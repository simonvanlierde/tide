import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { getPeriodRange } from "../../domain/flow";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import {
  useAppState,
  useAppStateActions,
  useForecast,
  useLocale,
} from "../../state/provider";
import { addMonths, formatMonthLabel } from "../../utils/date";
import { buildCalendarCells, buildMonthDays } from "./calendar";

export function useCalendar(today: IsoDate) {
  const state = useAppState();
  const actions = useAppStateActions();
  const forecast = useForecast(today);
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<IsoDate | null>(null);
  // The day just logged by a one-tap; drives its one-shot "tap to edit" pulse.
  const [justLoggedDay, setJustLoggedDay] = useState<IsoDate | null>(null);
  // Logging a past period in one go: null when not picking, else the first
  // day picked so far (null until tapped) and whether the last tap ran past
  // the cap.
  const [rangePick, setRangePick] = useState<{
    from: IsoDate | null;
    tooLong: boolean;
  } | null>(null);
  // The range just logged, and the days it added, for its status line and undo.
  const [justLoggedRange, setJustLoggedRange] = useState<{
    from: IsoDate;
    to: IsoDate;
    added: IsoDate[];
  } | null>(null);

  const { showCycleDayNumbers } = state.settings;
  const days = useMemo(
    () =>
      buildCalendarCells(
        buildMonthDays(visibleMonth, today),
        forecast,
        state.intensityByDay,
        showCycleDayNumbers,
      ),
    [visibleMonth, today, forecast, state.intensityByDay, showCycleDayNumbers],
  );
  const isLogged = (day: IsoDate) => day in state.intensityByDay;
  const helpKey: MessageKey =
    Object.keys(state.intensityByDay).length === 0
      ? "calendar.emptyHelp"
      : (days[0]?.value ?? visibleMonth) > today
        ? "calendar.futureHelp"
        : "calendar.tapHelp";

  // A log can move the next-period date (a big enough gap starts a new cycle),
  // which repaints every forecast fill in the month. Say so rather than letting
  // the grid change under the user's hand. No timer on the status line: it
  // stands until the next tap, month change, or undo makes it stale, so Undo is
  // never snatched away mid-read.
  const previousForecast = useRef(forecast.nextPeriod.date);
  const [forecastMoved, setForecastMoved] = useState(false);
  useEffect(() => {
    const moved = previousForecast.current !== forecast.nextPeriod.date;
    previousForecast.current = forecast.nextPeriod.date;
    if (moved && (justLoggedDay || justLoggedRange)) {
      setForecastMoved(true);
    }
  }, [forecast.nextPeriod.date, justLoggedDay, justLoggedRange]);

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
      setJustLoggedRange(null);
      setForecastMoved(false);
      // A range pick stays open: a period can run across the month boundary.
    });
  }

  function pickRangeDay(from: IsoDate | null, day: IsoDate) {
    if (from === null) {
      setRangePick({ from: day, tooLong: false });
      return;
    }
    const range = getPeriodRange(from, day);
    if (!range) {
      setRangePick({ from, tooLong: true });
      return;
    }
    actions.logPeriodRange(from, day, today);
    setRangePick(null);
    setJustLoggedRange({
      from: range[0] as IsoDate,
      to: range.at(-1) as IsoDate,
      added: range.filter((entry) => !isLogged(entry) && entry <= today),
    });
  }

  function openPicker() {
    setIsPickerOpen((open) => !open);
  }

  return {
    // Same year-month as today → the "Today" reset would be a no-op, so the
    // screen hides it. IsoDate is YYYY-MM-DD, so the first 7 chars are the month.
    isCurrentMonth: visibleMonth.slice(0, 7) === today.slice(0, 7),
    monthLabel,
    days,
    helpKey,
    selectedDay,
    justLoggedDay,
    forecastMoved,
    // A day logged without a level leaves the gauge unselected: it is a
    // question to answer, not a choice already made on the user's behalf.
    selectedIntensity:
      selectedDay && isLogged(selectedDay)
        ? state.intensityByDay[selectedDay]
        : undefined,
    isSelectedLogged: selectedDay ? isLogged(selectedDay) : false,
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
    // Empty day → one-tap log with no flow level. Logged day → open
    // its picker to change the flow or remove it; tapping the open day closes.
    selectDay(day: IsoDate) {
      setJustLoggedRange(null);
      if (rangePick) {
        setJustLoggedDay(null);
        setForecastMoved(false);
        pickRangeDay(rangePick.from, day);
        return;
      }
      if (!isLogged(day)) {
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
    rangePick,
    justLoggedRange,
    startRangePick() {
      setRangePick({ from: null, tooLong: false });
      setSelectedDay(null);
      setJustLoggedDay(null);
      setJustLoggedRange(null);
      setForecastMoved(false);
    },
    cancelRangePick() {
      setRangePick(null);
    },
    closePicker() {
      setSelectedDay(null);
    },
    undoJustLogged() {
      if (justLoggedDay && isLogged(justLoggedDay)) {
        actions.togglePeriodDay(justLoggedDay, today);
      }
      // One undo for the whole range: only the days it added, so days that
      // were logged before keep their flow.
      for (const day of justLoggedRange?.added ?? []) {
        if (isLogged(day)) {
          actions.togglePeriodDay(day, today);
        }
      }
      setJustLoggedDay(null);
      setJustLoggedRange(null);
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
      years: buildYearOptions(
        Object.keys(state.intensityByDay) as IsoDate[],
        today,
        visibleMonth,
      ),
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
