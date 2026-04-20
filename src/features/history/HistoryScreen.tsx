import { startTransition, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions } from "../../state";
import {
  addMonths,
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

  return (
    <section className="utility-screen">
      <article className="utility-card history-calendar">
        <div
          className="history-calendar__header"
          data-testid="history-calendar-header"
        >
          <button
            type="button"
            className="history-calendar__nav"
            aria-label="Previous month"
            onClick={model.goToPreviousMonth}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="calendar-picker-button history-calendar__month-button"
            aria-expanded={model.isPickerOpen}
            aria-controls="history-month-picker"
            onClick={model.openPicker}
          >
            {model.monthLabel}
          </button>
          <button
            type="button"
            className="history-calendar__nav"
            aria-label="Next month"
            onClick={model.goToNextMonth}
          >
            <ChevronRight aria-hidden="true" size={18} />
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
        <HistoryCalendarGrid
          monthDays={model.monthDays}
          loggedDays={model.loggedDays}
          onToggleDay={model.togglePeriodDay}
        />
        <p className="supporting-note history-calendar__help">
          Tap any day you had menstrual bleeding.
        </p>
        <button
          type="button"
          className="history-calendar__today"
          aria-label="Go to current month"
          onClick={model.goToToday}
        >
          Today
        </button>
      </article>
      {model.periodDays.length === 0 ? (
        <article className="utility-card">
          <p>No bleeding days logged yet.</p>
        </article>
      ) : null}
    </section>
  );
}
