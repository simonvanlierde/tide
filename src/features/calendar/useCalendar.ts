import { startTransition, useEffect, useMemo, useState } from "react";
import { getPeriodRange } from "../../domain/flow";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useForecast, useLocale } from "../../state/provider";
import { addMonths, formatMonthLabel } from "../../utils/date";
import { buildCalendarCells, buildMonthDays } from "./calendar";

// The calendar screen's model, in two parts: `month` moves between months and
// `log` selects and logs days. Changing month clears what `log` is showing.
export function useCalendar(today: IsoDate) {
  const state = useAppState();
  const forecast = useForecast(today);
  const log = useDayLog(today, forecast.nextPeriod.date);
  const month = useMonth(today, log.clear);
  const { visibleMonth } = month;

  const { showCycleDayNumbers } = state.settings;
  const days = useMemo(
    () => buildCalendarCells(buildMonthDays(visibleMonth, today), forecast, state.intensityByDay, showCycleDayNumbers),
    [visibleMonth, today, forecast, state.intensityByDay, showCycleDayNumbers],
  );
  const helpKey: string =
    (days[0]?.value ?? visibleMonth) > today
      ? "calendar.futureHelp"
      : !state.settings.calendarHelpDismissed
        ? "calendar.firstVisitHelp"
        : "calendar.tapHelp";

  return { days, helpKey, month, log };
}

function useMonth(today: IsoDate, onChange: () => void) {
  const state = useAppState();
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const locale = useLocale();
  const label = useMemo(() => formatMonthLabel(visibleMonth, locale), [visibleMonth, locale]);

  // keepPickerOpen lets the month/year dropdowns change one field at a time
  // without the panel closing between picks; chevrons and "Today" close it.
  // Takes an updater so held PageUp/PageDown and fast swipes step from the
  // latest month, not the last committed one — inside a transition several
  // pages can arrive before a commit.
  function setMonth(nextMonth: IsoDate | ((current: IsoDate) => IsoDate), keepPickerOpen = false) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      if (!keepPickerOpen) {
        setIsPickerOpen(false);
      }
      onChange();
    });
  }

  return {
    visibleMonth,
    label,
    // Same year-month as today → the "Today" reset would be a no-op, so the
    // screen hides it. IsoDate is YYYY-MM-DD, so the first 7 chars are the month.
    isCurrent: visibleMonth.slice(0, 7) === today.slice(0, 7),
    togglePicker() {
      setIsPickerOpen((open) => !open);
    },
    goToPrevious() {
      setMonth((current) => addMonths(current, -1));
    },
    goToNext() {
      setMonth((current) => addMonths(current, 1));
    },
    goToToday() {
      setMonth(today);
    },
    picker: {
      isPickerOpen,
      year: Number(visibleMonth.slice(0, 4)),
      monthIndex: Number(visibleMonth.slice(5, 7)) - 1,
      years: buildYearOptions(Object.keys(state.intensityByDay) as IsoDate[], today, visibleMonth),
      onSelect(year: number, monthIndex: number) {
        const month = String(monthIndex + 1).padStart(2, "0");
        setMonth(`${year}-${month}-01` as IsoDate, true);
      },
    },
  };
}

function useDayLog(today: IsoDate, nextPeriodDate: IsoDate | null) {
  const state = useAppState();
  const actions = useAppStateActions();
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
  const isLogged = (day: IsoDate) => day in state.intensityByDay;

  // Compare within the same render as the new log, so the receipt never
  // briefly shows the old forecast status before adding its explanation.
  const [forecastBeforeLog, setForecastBeforeLog] = useState(nextPeriodDate);
  const forecastMoved = Boolean(justLoggedDay || justLoggedRange) && forecastBeforeLog !== nextPeriodDate;
  const [feedbackPaused, setFeedbackPaused] = useState(false);

  useEffect(() => {
    if (feedbackPaused || (!justLoggedDay && !justLoggedRange)) return;
    const timer = window.setTimeout(() => {
      setJustLoggedDay(null);
      setJustLoggedRange(null);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [feedbackPaused, justLoggedDay, justLoggedRange]);

  // Drops the open flow picker and the just-logged status line. A range pick
  // stays open: a period can run across the month boundary.
  function clear() {
    setSelectedDay(null);
    setJustLoggedDay(null);
    setJustLoggedRange(null);
    setFeedbackPaused(false);
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
    setForecastBeforeLog(nextPeriodDate);
    actions.logPeriodRange(from, day, today);
    if (range.some((entry) => entry <= today && !isLogged(entry))) {
      actions.setSetting("calendarHelpDismissed", true);
    }
    setRangePick(null);
    setJustLoggedRange({
      from: range[0] as IsoDate,
      to: range.at(-1) as IsoDate,
      added: range.filter((entry) => !isLogged(entry) && entry <= today),
    });
  }

  return {
    selectedDay,
    justLoggedDay,
    forecastMoved,
    setFeedbackPaused,
    rangePick,
    justLoggedRange,
    clear,
    // Empty day → one-tap log with no flow level. Logged day → open
    // its picker to change the flow or remove it; tapping the open day closes.
    selectDay(day: IsoDate) {
      if (day > today && (rangePick || !isLogged(day))) return;
      setJustLoggedRange(null);
      if (rangePick) {
        setJustLoggedDay(null);
        setFeedbackPaused(false);
        pickRangeDay(rangePick.from, day);
        return;
      }
      if (!isLogged(day)) {
        setForecastBeforeLog(nextPeriodDate);
        actions.togglePeriodDay(day, today);
        actions.setSetting("calendarHelpDismissed", true);
        setJustLoggedDay(day);
        // Selection follows the tap: close any picker left open on another day.
        setSelectedDay(null);
        return;
      }
      setJustLoggedDay(null);
      setFeedbackPaused(false);
      setSelectedDay((current) => (current === day ? null : day));
    },
    startRangePick() {
      setRangePick({ from: null, tooLong: false });
      clear();
    },
    cancelRangePick() {
      setRangePick(null);
    },
    openDay(day: IsoDate) {
      clear();
      setRangePick(null);
      setSelectedDay(day);
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
      setFeedbackPaused(false);
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
function buildYearOptions(periodDays: IsoDate[], today: IsoDate, visibleMonth: IsoDate): number[] {
  const years = [
    Number(today.slice(0, 4)),
    Number(visibleMonth.slice(0, 4)),
    ...periodDays.map((day) => Number(day.slice(0, 4))),
  ];
  const min = Math.min(...years) - YEAR_BUFFER;
  const max = Math.max(...years) + YEAR_BUFFER;
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}
