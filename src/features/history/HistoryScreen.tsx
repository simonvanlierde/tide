import type { IsoDate } from "../../domain/types";
import { useState } from "react";
import { addMonths, getTodayIsoDate, parseIsoDate } from "../../utils/date";
import { useAppState } from "../../hooks/useAppState";

interface HistoryScreenProps {
  today?: IsoDate;
}

function formatMonthLabel(value: IsoDate) {
  return parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

function formatDayButtonLabel(value: IsoDate) {
  return `Toggle ${parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  })}`;
}

function getMonthDays(today: IsoDate) {
  const current = parseIsoDate(today);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const firstWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = last.getUTCDate();
  const days: Array<IsoDate | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10) as IsoDate;
    days.push(value);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function HistoryScreen({ today = getTodayIsoDate() }: HistoryScreenProps) {
  const { state, togglePeriodDay, removePeriodDay } = useAppState(today);
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const monthDays = getMonthDays(visibleMonth);
  const loggedDays = new Set(state.periodDays);
  const latestLogs = [...state.periodDays].sort((left, right) => right.localeCompare(left));
  const yearOptions = Array.from(
    new Set(
      [parseIsoDate(today).getUTCFullYear(), ...state.periodDays.map((day) => parseIsoDate(day).getUTCFullYear())].sort()
    )
  );

  return (
    <section className="utility-screen">
      <h1 className="utility-screen__title">History</h1>

      <article className="utility-card">
        <div className="calendar-toolbar">
          <button type="button" className="text-action" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}>
            Previous month
          </button>
          <h2 className="section-title">{formatMonthLabel(visibleMonth)}</h2>
          <button type="button" className="text-action" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}>
            Next month
          </button>
        </div>
        <label className="calendar-year-jump">
          <span>Jump to year</span>
          <select
            aria-label="Jump to year"
            value={parseIsoDate(visibleMonth).getUTCFullYear()}
            onChange={(event) => {
              const next = parseIsoDate(visibleMonth);
              next.setUTCFullYear(Number(event.target.value));
              setVisibleMonth(next.toISOString().slice(0, 10) as IsoDate);
            }}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <div className="calendar-grid" aria-label="History calendar">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="calendar-grid__weekday">
              {day}
            </div>
          ))}
          {monthDays.map((value, index) =>
            value ? (
              <button
                key={value}
                type="button"
                className={loggedDays.has(value) ? "calendar-grid__day is-logged" : "calendar-grid__day"}
                aria-label={formatDayButtonLabel(value)}
                onClick={() => togglePeriodDay(value)}
              >
                {parseIsoDate(value).getUTCDate()}
              </button>
            ) : (
              <div key={`empty-${index}`} className="calendar-grid__blank" aria-hidden="true" />
            )
          )}
        </div>
      </article>

      <div className="utility-stack">
        {latestLogs.length === 0 ? (
          <article className="utility-card">
            <p>No period days logged yet.</p>
          </article>
        ) : (
          latestLogs.map((day) => (
            <article key={day} className="utility-card utility-card--row">
              <span>{day}</span>
              <button className="text-action" onClick={() => removePeriodDay(day)}>
                Remove {day}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
