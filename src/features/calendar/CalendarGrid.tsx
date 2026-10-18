import { type KeyboardEvent, useMemo, useState } from "react";
import type { DayEstimate, IsoDate } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { useLocale, useT } from "../../state/provider";
import {
  formatLongDate,
  getWeekdayLabels,
  parseIsoDate,
} from "../../utils/date";
import type { CalendarCell } from "./calendar";

const MARKER_CLASS: Record<DayEstimate, string> = {
  fertile: "is-fertile",
  ovulation: "is-ovulation",
  "predicted-period": "is-predicted-period",
};

const MARKER_LABEL_KEY: Record<DayEstimate, MessageKey> = {
  fertile: "marker.fertile",
  ovulation: "marker.ovulation",
  "predicted-period": "marker.predictedPeriod",
};

interface CalendarGridProps {
  days: CalendarCell[];
  selectedDay: IsoDate | null;
  justLoggedDay: IsoDate | null;
  onSelectDay: (day: IsoDate) => void;
}

export function CalendarGrid({
  days,
  selectedDay,
  justLoggedDay,
  onSelectDay,
}: CalendarGridProps) {
  const t = useT();
  const locale = useLocale();
  const weekdays = useMemo(() => {
    const narrow = getWeekdayLabels(locale, "narrow");
    const long = getWeekdayLabels(locale, "long");
    return getWeekdayLabels(locale).map((short, index) => ({
      short,
      narrow: narrow[index],
      long: long[index],
    }));
  }, [locale]);
  // Roving tabindex: the grid is one tab stop, and arrow keys walk it. Tabbing
  // through 35-42 day buttons to reach the controls below is not navigation,
  // it is a wall. The stop is the selected day, else today, else the first
  // loggable day.
  const [focusedDay, setFocusedDay] = useState<IsoDate | null>(null);
  const loggableDays = days.filter((day) => !day.isFuture || day.isLogged);
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
    const day = days[target];
    if (!day || (day.isFuture && !day.isLogged)) {
      return;
    }
    setFocusedDay(day.value);
    event.currentTarget
      .closest(".calendar-grid__body")
      ?.querySelectorAll<HTMLButtonElement>(".calendar-grid__day")
      [target]?.focus();
  }
  const weekStarts = days
    .map((_, index) => index)
    .filter((index) => index % 7 === 0);

  return (
    // A table, so screen readers announce each day's weekday column.
    <table className="calendar-grid" aria-label={t("calendar.title")}>
      <thead>
        <tr className="calendar-grid__header">
          {/* Both forms render and CSS shows one: the narrow letter where a
              column can't hold "WED". The full name is what screen readers say. */}
          {weekdays.map((day) => (
            <th
              key={day.long}
              scope="col"
              className="calendar-grid__weekday"
              aria-label={day.long}
            >
              <span className="calendar-grid__weekday-short" aria-hidden="true">
                {day.short}
              </span>
              <span
                className="calendar-grid__weekday-narrow"
                aria-hidden="true"
              >
                {day.narrow}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="calendar-grid__body">
        {weekStarts.map((weekStart) => (
          <tr key={days[weekStart]?.key} className="calendar-grid__week">
            {days.slice(weekStart, weekStart + 7).map((day, offset) => {
              const index = weekStart + offset;
              // Logged days take the coral fill, deepened by flow level; without a
              // chosen level the base .is-logged coral stands.
              const { value, isLogged, flow, estimate: marker } = day;
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
                <td key={day.key} className="calendar-grid__cell">
                  <button
                    type="button"
                    className={className}
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
                    {day.cycleDay ? (
                      <span
                        className="calendar-grid__period-day"
                        aria-hidden="true"
                      >
                        {day.cycleDay}
                      </span>
                    ) : null}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
