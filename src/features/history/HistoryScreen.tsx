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
        <HistoryMonthPicker {...model.monthPicker} />
        <HistoryCalendarGrid
          monthDays={model.monthDays}
          loggedDays={model.loggedDays}
          cycleMarkers={model.cycleMarkers}
          onToggleDay={model.togglePeriodDay}
        />
        <CalendarLegend />
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

const LEGEND_ITEMS = [
  { key: "logged", label: "Logged" },
  { key: "fertile", label: "Fertile" },
  { key: "ovulation", label: "Ovulation" },
  { key: "predicted", label: "Expected" },
] as const;

// The per-day buttons announce their own marker to screen readers, so the
// visual legend is decorative here.
function CalendarLegend() {
  return (
    <div className="calendar-legend" aria-hidden="true">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.key} className="calendar-legend__item">
          <span
            className={`calendar-legend__swatch calendar-legend__swatch--${item.key}`}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
