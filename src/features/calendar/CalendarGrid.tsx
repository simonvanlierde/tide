import {
  type CSSProperties,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import type { IsoDate, LoggedFlow } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { useLocale, useT } from "../../state/provider";
import {
  formatLongDate,
  getWeekdayLabels,
  parseIsoDate,
} from "../../utils/date";
import type { CalendarDay, DayMarker } from "./calendar";

const MARKER_CLASS: Record<DayMarker, string> = {
  fertile: "is-fertile",
  ovulation: "is-ovulation",
  "predicted-period": "is-predicted-period",
};

const MARKER_LABEL_KEY: Record<DayMarker, MessageKey> = {
  fertile: "marker.fertile",
  ovulation: "marker.ovulation",
  "predicted-period": "marker.predictedPeriod",
};

interface CalendarGridProps {
  monthDays: CalendarDay[];
  loggedDays: Set<IsoDate>;
  dayIntensity: Map<IsoDate, LoggedFlow>;
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
  cycleDayNumbers,
  showCycleDayNumbers,
  cycleMarkers,
  selectedDay,
  justLoggedDay,
  onSelectDay,
}: CalendarGridProps) {
  const t = useT();
  const locale = useLocale();
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  // Roving tabindex: the grid is one tab stop, and arrow keys walk it. Tabbing
  // through 35-42 day buttons to reach the controls below is not navigation,
  // it is a wall. The stop is the selected day, else today, else the first
  // loggable day.
  const [focusedDay, setFocusedDay] = useState<IsoDate | null>(null);
  const loggableDays = monthDays.filter(
    (day) => !day.isFuture || loggedDays.has(day.value),
  );
  const tabStop =
    [focusedDay, selectedDay].find(
      (day) => day && loggableDays.some((entry) => entry.value === day),
    ) ??
    loggableDays.find((day) => day.isToday)?.value ??
    loggableDays[0]?.value ??
    null;

  // Arrows move by a day, Home/End to the ends of the week. A disabled (future)
  // cell can't take focus, so a move that lands on one is simply refused.
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[
      event.key
    ];
    const target =
      step !== undefined
        ? index + step
        : event.key === "Home"
          ? index - (index % 7)
          : event.key === "End"
            ? index - (index % 7) + 6
            : null;
    if (target === null) {
      return;
    }
    event.preventDefault();
    const day = monthDays[target];
    if (!day || (day.isFuture && !loggedDays.has(day.value))) {
      return;
    }
    setFocusedDay(day.value);
    event.currentTarget
      .closest(".calendar-grid__week")
      ?.querySelectorAll<HTMLButtonElement>(".calendar-grid__day")
      [target]?.focus();
  }
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
    <section className="calendar-grid" aria-label={t("calendar.title")}>
      <div className="calendar-grid__header">
        {weekdayLabels.map((day) => (
          <div key={day} className="calendar-grid__weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid__week">
        {monthDays.map((day, index) => {
          const value = day.value;
          const isLogged = loggedDays.has(value);
          // One series only: the running cycle-day count, on days that have
          // happened. The coral run already says which period day a logged
          // cell is, and a number on a future cell would read as a fact.
          const dayNumber =
            showCycleDayNumbers && !isLogged && !day.isFuture
              ? cycleDayNumbers.get(value)
              : undefined;
          // Logged days take the coral fill, deepened by flow level; without a
          // chosen level the base .is-logged coral stands. A prediction only
          // shows on days that aren't already logged.
          const flow = isLogged ? (dayIntensity.get(value) ?? null) : null;
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
          const dayLabel = `${t(isLogged ? "calendar.edit" : "calendar.log")} ${formatLongDate(value, locale)}`;
          // A logged future day (clock moved back, or imported) stays
          // removable; only logging a new future day is blocked.
          const isUnavailable = day.isFuture && !isLogged;
          const dateLabel = isUnavailable
            ? t("calendar.dayUnavailable", { label: dayLabel })
            : dayLabel;
          // Flow is otherwise colour-only, so name it for screen readers.
          const detail = flow
            ? t(`flow.${flow}`)
            : marker
              ? t(MARKER_LABEL_KEY[marker])
              : undefined;

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
              disabled={isUnavailable}
              tabIndex={value === tabStop ? 0 : -1}
              onKeyDown={(event) => moveFocus(event, index)}
              onFocus={() => setFocusedDay(value)}
              aria-label={
                detail
                  ? t("calendar.dayWithMarker", {
                      label: dateLabel,
                      marker: detail,
                    })
                  : dateLabel
              }
              aria-pressed={isSelected}
              onClick={() => onSelectDay(value)}
            >
              {parseIsoDate(value).getUTCDate()}
              {dayNumber ? (
                <span className="calendar-grid__period-day" aria-hidden="true">
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
