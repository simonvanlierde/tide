import type { CSSProperties } from "react";
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
  cycleDayNumbers: Map<IsoDate, number>;
  showCycleDayNumbers: boolean;
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
  cycleDayNumbers,
  showCycleDayNumbers,
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
        {/* Days render in date order, so consecutive predicted-period cells
            belong to the same run — track the offset to fade each day of the
            expected period a little more. A run clipped by the visible window's
            start restarts at 0, which is only cosmetic. */}
        {monthDays.map((day, index) => {
          const value = day.value;
          const isLogged = loggedDays.has(value);
          // Logged days keep their per-period number; other days show the
          // running cycle-day count. Both hide when the setting is off.
          const dayNumber = showCycleDayNumbers
            ? isLogged
              ? periodDayNumbers.get(value)
              : cycleDayNumbers.get(value)
            : undefined;
          // Logged days take the coral fill, deepened by flow level; a
          // prediction only shows on days that aren't already logged.
          const flow = isLogged
            ? (dayIntensity.get(value) ?? "medium")
            : undefined;
          const marker = isLogged ? undefined : cycleMarkers.get(value);
          // Count the predicted-period days immediately before this one so each
          // day of the expected run fades a step further than the last.
          const isPredictedPeriod = marker === "predicted-period";
          let forecastStep = 0;
          if (isPredictedPeriod) {
            for (let i = index - 1; i >= 0; i--) {
              const prev = monthDays[i]?.value;
              if (
                !prev ||
                loggedDays.has(prev) ||
                cycleMarkers.get(prev) !== "predicted-period"
              ) {
                break;
              }
              forecastStep++;
            }
          }
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
              style={
                isPredictedPeriod
                  ? ({ "--forecast-step": forecastStep } as CSSProperties)
                  : undefined
              }
              disabled={day.isFuture}
              aria-label={
                marker ? `${dateLabel}, ${MARKER_LABEL[marker]}` : dateLabel
              }
              aria-pressed={isSelected}
              onClick={() => onSelectDay(value)}
            >
              {parseIsoDate(value).getUTCDate()}
              {dayNumber ? (
                <span
                  className={
                    isLogged
                      ? "calendar-grid__period-day"
                      : "calendar-grid__period-day calendar-grid__period-day--cycle"
                  }
                  aria-hidden="true"
                >
                  {dayNumber}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
