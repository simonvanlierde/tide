import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { DayFlowPicker } from "./DayFlowPicker";
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
      <h1 className="visually-hidden">Calendar</h1>
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
          dayIntensity={model.dayIntensity}
          periodDayNumbers={model.periodDayNumbers}
          cycleMarkers={model.cycleMarkers}
          selectedDay={model.selectedDay}
          onSelectDay={model.selectDay}
        />
        {model.selectedDay ? (
          <DayFlowPicker
            day={model.selectedDay}
            intensity={model.selectedIntensity}
            isLogged={model.isSelectedLogged}
            onSelect={(intensity) =>
              model.setDayIntensity(model.selectedDay as IsoDate, intensity)
            }
            onRemove={() => model.removeDay(model.selectedDay as IsoDate)}
            onClose={model.closePicker}
          />
        ) : (
          <p className="supporting-note history-calendar__help">
            Tap any day to log bleeding and set its flow.
          </p>
        )}
        <CalendarLegend showFertility={model.showFertility} />
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
  { key: "fertile", label: "Fertile", fertility: true },
  { key: "ovulation", label: "Ovulation", fertility: true },
  { key: "predicted", label: "Expected" },
] as const;

// The per-day buttons announce their own marker to screen readers, so the
// visual legend is decorative here.
function CalendarLegend({ showFertility }: { showFertility: boolean }) {
  const items = showFertility
    ? LEGEND_ITEMS
    : LEGEND_ITEMS.filter((item) => !("fertility" in item));

  return (
    <div className="calendar-legend" aria-hidden="true">
      {items.map((item) => (
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
