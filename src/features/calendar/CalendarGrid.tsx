import type { CSSProperties } from "react";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";
import {
  CALENDAR_WEEKDAY_LABELS,
  type CalendarDay,
  type DayMarker,
  formatDayButtonLabel,
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

interface CalendarGridProps {
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

export function CalendarGrid({
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
}: CalendarGridProps) {
  // Days render in date order, so consecutive predicted-period cells belong to
  // the same run. One forward pass gives each its offset within the run, so each
  // day of the expected period fades a step further than the last. A run clipped
  // by the visible window's start restarts at 0, which is only cosmetic.
  const forecastSteps: number[] = [];
  let forecastRun = 0;
  for (const day of monthDays) {
    const isPredicted =
      !loggedDays.has(day.value) &&
      cycleMarkers.get(day.value) === "predicted-period";
    forecastSteps.push(isPredicted ? forecastRun : 0);
    forecastRun = isPredicted ? forecastRun + 1 : 0;
  }

  return (
    <section className="calendar-grid" aria-label="Calendar">
      <div className="calendar-grid__header">
        {CALENDAR_WEEKDAY_LABELS.map((day) => (
          <div key={day} className="calendar-grid__weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid__week">
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
          const isPredictedPeriod = marker === "predicted-period";
          const forecastStep = forecastSteps[index] ?? 0;
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
