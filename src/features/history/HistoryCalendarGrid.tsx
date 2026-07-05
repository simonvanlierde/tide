import type { IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";
import {
  type CalendarDay,
  type DayMarker,
  formatDayButtonLabel,
  HISTORY_WEEKDAY_LABELS,
} from "./calendar";

const MARKER_CLASS: Record<DayMarker, string> = {
  fertile: "is-fertile",
  ovulation: "is-ovulation",
  "predicted-period": "is-predicted-period",
};

const MARKER_LABEL: Record<DayMarker, string> = {
  fertile: "fertile window",
  ovulation: "likely ovulation",
  "predicted-period": "expected period",
};

interface HistoryCalendarGridProps {
  monthDays: CalendarDay[];
  loggedDays: Set<IsoDate>;
  periodDayNumbers: Map<IsoDate, number>;
  cycleMarkers: Map<IsoDate, DayMarker>;
  onToggleDay: (day: IsoDate) => void;
}

export function HistoryCalendarGrid({
  monthDays,
  loggedDays,
  periodDayNumbers,
  cycleMarkers,
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
          const isLogged = loggedDays.has(value);
          const periodDay = isLogged ? periodDayNumbers.get(value) : undefined;
          // Logged days take the coral fill; a prediction only shows on days
          // that aren't already logged.
          const marker = isLogged ? undefined : cycleMarkers.get(value);
          const className = [
            "calendar-grid__day",
            isLogged ? "is-logged" : "",
            day.isToday ? "is-today" : "",
            day.isOutsideMonth ? "is-outside-month" : "",
            day.isFuture ? "is-future" : "",
            marker ? MARKER_CLASS[marker] : "",
          ]
            .filter(Boolean)
            .join(" ");
          const dateLabel = day.isFuture
            ? `${formatDayButtonLabel(value)} unavailable`
            : formatDayButtonLabel(value);

          return (
            <button
              key={day.key}
              type="button"
              className={className}
              disabled={day.isFuture}
              aria-label={
                marker ? `${dateLabel}, ${MARKER_LABEL[marker]}` : dateLabel
              }
              onClick={() => onToggleDay(value)}
            >
              {parseIsoDate(value).getUTCDate()}
              {periodDay ? (
                <span className="calendar-grid__period-day" aria-hidden="true">
                  {periodDay}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
