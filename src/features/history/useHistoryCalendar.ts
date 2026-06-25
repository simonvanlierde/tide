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

  function openPicker() {
    setIsPickerOpen(true);

    if (!hasNativeMonthInput || !monthInputRef.current) {
      return;
    }

    window.setTimeout(() => {
      openNativeMonthPicker(monthInputRef.current);
    }, 0);
  }

  return {
    periodDays: state.periodDays,
    isPickerOpen,
    monthLabel: formatMonthLabel(visibleMonth),
    monthDays: buildMonthDays(visibleMonth, today),
    loggedDays: new Set(state.periodDays),
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
    togglePeriodDay(day: IsoDate) {
      if (day > today) {
        return;
      }

      actions.togglePeriodDay(day);
    },
    monthPicker: {
      isPickerOpen,
      hasNativeMonthInput,
      currentMonthIndex,
      currentYear,
      monthInputRef,
      monthInputValue: formatMonthInputValue(visibleMonth),
      yearOptions: getHistoryYearOptions(today),
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
    },
  };
}
