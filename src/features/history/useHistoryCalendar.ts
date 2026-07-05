import { startTransition, useMemo, useRef, useState } from "react";
import { getPeriodDayNumbers } from "../../domain/cycle";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
} from "../../state/provider";
import {
  addMonths,
  formatMonthInputValue,
  parseMonthInputValue,
} from "../../utils/date";
import {
  buildCalendarMarkers,
  buildMonthDays,
  formatMonthLabel,
} from "./calendar";
import { openNativeMonthPicker } from "./monthPicker";

export function useHistoryCalendar(today: IsoDate) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<IsoDate | null>(null);
  const monthInputRef = useRef<HTMLInputElement | null>(null);

  const monthDays = useMemo(
    () => buildMonthDays(visibleMonth, today),
    [visibleMonth, today],
  );
  const loggedDays = useMemo(
    () => new Set(state.periodDays),
    [state.periodDays],
  );
  const dayIntensity = useMemo(
    () =>
      new Map<IsoDate, FlowIntensity>(
        Object.entries(state.intensityByDay) as [IsoDate, FlowIntensity][],
      ),
    [state.intensityByDay],
  );
  const periodDayNumbers = useMemo(
    () => getPeriodDayNumbers(state.periodDays),
    [state.periodDays],
  );
  const showFertility = state.settings.showFertility;
  const cycleMarkers = useMemo(
    () => buildCalendarMarkers(summary, showFertility),
    [summary, showFertility],
  );
  const monthLabel = useMemo(
    () => formatMonthLabel(visibleMonth),
    [visibleMonth],
  );

  function setMonth(nextMonth: IsoDate) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      setIsPickerOpen(false);
    });
  }

  function openPicker() {
    setIsPickerOpen(true);

    // The input mounts only after isPickerOpen flips, so defer the ref read to
    // the next tick; on the first open the ref is still null right now.
    window.setTimeout(() => {
      openNativeMonthPicker(monthInputRef.current);
    }, 0);
  }

  return {
    periodDays: state.periodDays,
    isPickerOpen,
    monthLabel,
    monthDays,
    loggedDays,
    dayIntensity,
    periodDayNumbers,
    cycleMarkers,
    showFertility,
    selectedDay,
    selectedIntensity: selectedDay
      ? state.intensityByDay[selectedDay]
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
    // Tapping a day opens its flow picker; tapping the open day closes it.
    selectDay(day: IsoDate) {
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
      monthInputRef,
      monthInputValue: formatMonthInputValue(visibleMonth),
      onNativeMonthChange(value: string) {
        if (!value) {
          return;
        }

        setMonth(parseMonthInputValue(value));
      },
    },
  };
}
