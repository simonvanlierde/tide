import type { IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";
import {
  type CalendarDay,
  formatDayButtonLabel,
  HISTORY_WEEKDAY_LABELS,
} from "./calendar";

interface HistoryCalendarGridProps {
  monthDays: CalendarDay[];
  loggedDays: Set<IsoDate>;
  onToggleDay: (day: IsoDate) => void;
}

export function HistoryCalendarGrid({
  monthDays,
  loggedDays,
  onToggleDay,
}: HistoryCalendarGridProps) {
  return (
    <section className="calendar-grid" aria-label="History calendar">
      <div className="calendar-grid__header">
        {HISTORY_WEEKDAY_LABELS.map((day) => (
          <div key={day} className="calendar-grid__weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid__week">
        {monthDays.map((day) => {
          const value = day.value;
          const className = [
            "calendar-grid__day",
            loggedDays.has(value) ? "is-logged" : "",
            day.isToday ? "is-today" : "",
            day.isOutsideMonth ? "is-outside-month" : "",
            day.isFuture ? "is-future" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={day.key}
              type="button"
              className={className}
              disabled={day.isFuture}
              aria-label={
                day.isFuture
                  ? `${formatDayButtonLabel(value)} unavailable`
                  : formatDayButtonLabel(value)
              }
              onClick={() => onToggleDay(value)}
            >
              {parseIsoDate(value).getUTCDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
