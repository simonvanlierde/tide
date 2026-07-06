import type { FlowIntensity, IsoDate } from "../../domain/types";
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
  dayIntensity: Map<IsoDate, FlowIntensity>;
  periodDayNumbers: Map<IsoDate, number>;
  cycleMarkers: Map<IsoDate, DayMarker>;
  selectedDay: IsoDate | null;
  justLoggedDay: IsoDate | null;
  onSelectDay: (day: IsoDate) => void;
}

export function HistoryCalendarGrid({
  monthDays,
  loggedDays,
  dayIntensity,
  periodDayNumbers,
  cycleMarkers,
  selectedDay,
  justLoggedDay,
  onSelectDay,
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
          // Logged days take the coral fill, deepened by flow level; a
          // prediction only shows on days that aren't already logged.
          const flow = isLogged
            ? (dayIntensity.get(value) ?? "medium")
            : undefined;
          const marker = isLogged ? undefined : cycleMarkers.get(value);
          const isSelected = value === selectedDay;
          const className = [
            "calendar-grid__day",
            isLogged ? "is-logged" : "",
            value === justLoggedDay ? "is-just-logged" : "",
            flow ? `is-flow-${flow}` : "",
            day.isToday ? "is-today" : "",
            isSelected ? "is-selected" : "",
            day.isOutsideMonth ? "is-outside-month" : "",
            day.isFuture ? "is-future" : "",
            marker ? MARKER_CLASS[marker] : "",
          ]
            .filter(Boolean)
            .join(" ");
          const dateLabel = day.isFuture
            ? `${formatDayButtonLabel(value, isLogged)} unavailable`
            : formatDayButtonLabel(value, isLogged);

          return (
            <button
              key={day.key}
              type="button"
              className={className}
              disabled={day.isFuture}
              aria-label={
                marker ? `${dateLabel}, ${MARKER_LABEL[marker]}` : dateLabel
              }
              aria-pressed={isSelected}
              onClick={() => onSelectDay(value)}
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
