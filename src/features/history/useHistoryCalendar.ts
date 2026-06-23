import { startTransition, useRef, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions } from "../../state";
import {
  addMonths,
  formatMonthInputValue,
  parseIsoDate,
  parseMonthInputValue,
  setIsoDateMonth,
} from "../../utils/date";
import {
  buildMonthDays,
  formatMonthLabel,
  getHistoryYearOptions,
} from "./calendar";
import { openNativeMonthPicker, supportsNativeMonthInput } from "./monthPicker";

export function useHistoryCalendar(today: IsoDate) {
  const state = useAppState();
  const actions = useAppStateActions();
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hasNativeMonthInput] = useState(() => supportsNativeMonthInput());
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const currentYear = parseIsoDate(visibleMonth).getUTCFullYear();
  const currentMonthIndex = parseIsoDate(visibleMonth).getUTCMonth();

  function setMonth(nextMonth: IsoDate) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      setIsPickerOpen(false);
    });
  }

  return {
    periodDays: state.periodDays,
    isPickerOpen,
    hasNativeMonthInput,
    currentMonthIndex,
    currentYear,
    monthInputRef,
    monthInputValue: formatMonthInputValue(visibleMonth),
    monthLabel: formatMonthLabel(visibleMonth),
    monthDays: buildMonthDays(visibleMonth, today),
    loggedDays: new Set(state.periodDays),
    yearOptions: getHistoryYearOptions(today, state.periodDays),
    goToPreviousMonth() {
      setMonth(addMonths(visibleMonth, -1));
    },
    goToNextMonth() {
      setMonth(addMonths(visibleMonth, 1));
    },
    goToToday() {
      setMonth(today);
    },
    openPicker() {
      setIsPickerOpen(true);

      if (!hasNativeMonthInput || !monthInputRef.current) {
        return;
      }

      window.setTimeout(() => {
        openNativeMonthPicker(monthInputRef.current);
      }, 0);
    },
    onNativeMonthChange(value: string) {
      if (!value) {
        return;
      }

      setMonth(parseMonthInputValue(value));
    },
    onFallbackMonthChange(monthIndex: number) {
      startTransition(() => {
        setVisibleMonth(setIsoDateMonth(visibleMonth, monthIndex));
      });
    },
    onFallbackYearChange(year: number) {
      setMonth(
        parseMonthInputValue(
          `${year}-${String(currentMonthIndex + 1).padStart(2, "0")}`,
        ),
      );
    },
    togglePeriodDay(day: IsoDate) {
      if (day > today) {
        return;
      }

      actions.togglePeriodDay(day);
    },
  };
}
