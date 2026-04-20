import type { IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";
import { formatDayButtonLabel, HISTORY_WEEKDAY_LABELS } from "./calendar";

interface HistoryCalendarGridProps {
  monthDays: Array<{ key: string; value: IsoDate | null }>;
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
      {HISTORY_WEEKDAY_LABELS.map((day) => (
        <div key={day} className="calendar-grid__weekday">
          {day}
        </div>
      ))}
      {monthDays.map((day) => {
        if (day.value === null) {
          return (
            <div
              key={day.key}
              className="calendar-grid__blank"
              aria-hidden="true"
            />
          );
        }

        const value = day.value;

        return (
          <button
            key={day.key}
            type="button"
            className={
              loggedDays.has(value)
                ? "calendar-grid__day is-logged"
                : "calendar-grid__day"
            }
            aria-label={formatDayButtonLabel(value)}
            onClick={() => onToggleDay(value)}
          >
            {parseIsoDate(value).getUTCDate()}
          </button>
        );
      })}
    </section>
  );
}
