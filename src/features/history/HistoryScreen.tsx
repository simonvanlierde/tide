import { startTransition, useRef, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions } from "../../state";
import {
  formatMonthInputValue,
  getTodayIsoDate,
  parseIsoDate,
  parseMonthInputValue,
  setIsoDateMonth,
} from "../../utils/date";
import { HistoryCalendarGrid } from "./HistoryCalendarGrid";
import { HistoryMonthPicker } from "./HistoryMonthPicker";
import {
  buildMonthDays,
  formatMonthLabel,
  getHistoryYearOptions,
} from "./calendar";
import { openNativeMonthPicker, supportsNativeMonthInput } from "./monthPicker";

interface HistoryScreenProps {
  today?: IsoDate;
}

export function HistoryScreen({
  today = getTodayIsoDate(),
}: HistoryScreenProps) {
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

  const model = {
    periodDays: state.periodDays,
    isPickerOpen,
    hasNativeMonthInput,
    currentMonthIndex,
    currentYear,
    monthInputRef,
    monthInputValue: formatMonthInputValue(visibleMonth),
    monthLabel: formatMonthLabel(visibleMonth),
    monthDays: buildMonthDays(visibleMonth),
    loggedDays: new Set(state.periodDays),
    yearOptions: getHistoryYearOptions(today, state.periodDays),
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
      actions.togglePeriodDay(day);
    },
  };

  return (
    <section className="utility-screen">
      <article className="utility-card">
        <div className="calendar-toolbar calendar-toolbar--compact">
          <button
            type="button"
            className="calendar-picker-button"
            aria-expanded={model.isPickerOpen}
            aria-controls="history-month-picker"
            onClick={model.openPicker}
          >
            {model.monthLabel}
          </button>
        </div>
        <HistoryMonthPicker
          isPickerOpen={model.isPickerOpen}
          hasNativeMonthInput={model.hasNativeMonthInput}
          currentMonthIndex={model.currentMonthIndex}
          currentYear={model.currentYear}
          monthInputValue={model.monthInputValue}
          yearOptions={model.yearOptions}
          monthInputRef={model.monthInputRef}
          onNativeMonthChange={model.onNativeMonthChange}
          onFallbackMonthChange={model.onFallbackMonthChange}
          onFallbackYearChange={model.onFallbackYearChange}
        />
        <p className="supporting-note">
          Tap any day you had menstrual bleeding.
        </p>
        <HistoryCalendarGrid
          monthDays={model.monthDays}
          loggedDays={model.loggedDays}
          onToggleDay={model.togglePeriodDay}
        />
      </article>
      {model.periodDays.length === 0 ? (
        <article className="utility-card">
          <p>No bleeding days logged yet.</p>
        </article>
      ) : null}
    </section>
  );
}
