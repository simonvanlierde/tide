import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type TouchEvent, useRef } from "react";
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
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    if (touch) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }

  // A mostly-horizontal swipe flips the month; swipe left for next (pages
  // forward), right for previous. Small or vertical drags are ignored so taps
  // and scrolls still work.
  function handleTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) {
      return;
    }

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) {
      return;
    }

    if (dx < 0) {
      model.goToNextMonth();
    } else {
      model.goToPreviousMonth();
    }
  }

  // PageUp/PageDown change month (the ARIA date-grid convention). Arrow keys are
  // left alone — the flow gauge is a radiogroup that owns them. Skip the month
  // input, which handles its own keys.
  function handleKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    if (event.key === "PageUp") {
      event.preventDefault();
      model.goToPreviousMonth();
    } else if (event.key === "PageDown") {
      event.preventDefault();
      model.goToNextMonth();
    }
  }

  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">Calendar</h1>
      <article
        className="utility-card history-calendar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
      >
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
          showPeriodDayNumbers={model.showPeriodDayNumbers}
          cycleMarkers={model.cycleMarkers}
          selectedDay={model.selectedDay}
          justLoggedDay={model.justLoggedDay}
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
            Tap a day to log bleeding. Tap a logged day to change or remove it.
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
