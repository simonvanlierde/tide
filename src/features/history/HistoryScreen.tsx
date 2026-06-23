import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { HistoryCalendarGrid } from "./HistoryCalendarGrid";
import { HistoryMonthPicker } from "./HistoryMonthPicker";
import { useHistoryCalendar } from "./useHistoryCalendar";

interface HistoryScreenProps {
  today?: IsoDate;
}

export function HistoryScreen({
  today = getTodayIsoDate(),
}: HistoryScreenProps) {
  const model = useHistoryCalendar(today);

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
