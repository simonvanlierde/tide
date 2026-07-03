import { startTransition, useRef, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions } from "../../state/provider";
import {
  addMonths,
  formatMonthInputValue,
  parseMonthInputValue,
} from "../../utils/date";
import { buildMonthDays, formatMonthLabel } from "./calendar";
import { openNativeMonthPicker } from "./monthPicker";

export function useHistoryCalendar(today: IsoDate) {
  const state = useAppState();
  const actions = useAppStateActions();
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const monthInputRef = useRef<HTMLInputElement | null>(null);

  function setMonth(nextMonth: IsoDate) {
    startTransition(() => {
      setVisibleMonth(nextMonth);
      setIsPickerOpen(false);
    });
  }

  function openPicker() {
    setIsPickerOpen(true);

    if (!monthInputRef.current) {
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
