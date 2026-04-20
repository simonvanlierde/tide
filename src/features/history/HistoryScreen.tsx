import type { IsoDate } from "../../domain/types";
import { useMemo, useRef, useState } from "react";
import {
  formatMonthInputValue,
  getTodayIsoDate,
  parseMonthInputValue,
  parseIsoDate,
  setIsoDateMonth,
} from "../../utils/date";
import { useAppState } from "../../state/appState";

interface HistoryScreenProps {
  today?: IsoDate;
}

function formatMonthLabel(value: IsoDate) {
  return parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDayButtonLabel(value: IsoDate) {
  return `Toggle ${parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

function getMonthName(monthIndex: number) {
  return new Date(Date.UTC(2026, monthIndex, 1)).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

function supportsMonthInput() {
  const input = document.createElement("input");
  input.setAttribute("type", "month");
  return input.type === "month";
}

function getMonthDays(today: IsoDate) {
  const current = parseIsoDate(today);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const firstWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = last.getUTCDate();
  const days: Array<{ key: string; value: IsoDate | null }> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    days.push({
      key: `blank-${year}-${monthIndex + 1}-${index + 1}`,
      value: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = new Date(Date.UTC(year, monthIndex, day))
      .toISOString()
      .slice(0, 10) as IsoDate;
    days.push({ key: value, value });
  }

  while (days.length % 7 !== 0) {
    days.push({
      key: `blank-${year}-${monthIndex + 1}-tail-${days.length + 1}`,
      value: null,
    });
  }

  return days;
}

export function HistoryScreen({
  today = getTodayIsoDate(),
}: HistoryScreenProps) {
  const { state, togglePeriodDay } = useAppState(today);
  const [visibleMonth, setVisibleMonth] = useState<IsoDate>(today);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const monthDays = getMonthDays(visibleMonth);
  const loggedDays = new Set(state.periodDays);
  const hasNativeMonthInput = useMemo(() => supportsMonthInput(), []);
  const yearOptions = Array.from(
    new Set(
      [
        parseIsoDate(today).getUTCFullYear(),
        ...state.periodDays.map((day) => parseIsoDate(day).getUTCFullYear()),
      ].sort(),
    ),
  );
  const currentYear = parseIsoDate(visibleMonth).getUTCFullYear();
  const currentMonthIndex = parseIsoDate(visibleMonth).getUTCMonth();

  function openPicker() {
    setIsPickerOpen(true);

    if (!hasNativeMonthInput) {
      return;
    }

    window.setTimeout(() => {
      const input = monthInputRef.current;

      if (!input) {
        return;
      }

      if ("showPicker" in input && typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }

      input.focus();
      input.click();
    }, 0);
  }

  return (
    <section className="utility-screen">
      <article className="utility-card">
        <div className="calendar-toolbar calendar-toolbar--compact">
          <button
            type="button"
            className="calendar-picker-button"
            aria-expanded={isPickerOpen}
            aria-controls="history-month-picker"
            onClick={openPicker}
          >
            {formatMonthLabel(visibleMonth)}
          </button>
        </div>
        {isPickerOpen ? (
          <div id="history-month-picker" className="calendar-picker-panel">
            {hasNativeMonthInput ? (
              <label className="calendar-picker-field">
                <span className="settings-label">Month and year</span>
                <input
                  ref={monthInputRef}
                  type="month"
                  aria-label="Select month and year"
                  value={formatMonthInputValue(visibleMonth)}
                  onChange={(event) => {
                    if (!event.target.value) {
                      return;
                    }

                    setVisibleMonth(parseMonthInputValue(event.target.value));
                    setIsPickerOpen(false);
                  }}
                />
              </label>
            ) : (
              <div className="calendar-picker-fallback">
                <label className="calendar-picker-field">
                  <span className="settings-label">Month</span>
                  <select
                    aria-label="Select month"
                    value={currentMonthIndex}
                    onChange={(event) => {
                      setVisibleMonth(
                        setIsoDateMonth(visibleMonth, Number(event.target.value)),
                      );
                    }}
                  >
                    {Array.from({ length: 12 }, (_, monthIndex) => (
                      <option
                        key={getMonthName(monthIndex)}
                        value={monthIndex}
                      >
                        {getMonthName(monthIndex)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="calendar-picker-field">
                  <span className="settings-label">Year</span>
                  <select
                    aria-label="Select year"
                    value={currentYear}
                    onChange={(event) => {
                      setVisibleMonth(
                        parseMonthInputValue(
                          `${event.target.value}-${String(currentMonthIndex + 1).padStart(2, "0")}`,
                        ),
                      );
                    }}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        ) : null}
        <p className="supporting-note">
          Tap any day you had menstrual bleeding.
        </p>
        <section className="calendar-grid" aria-label="History calendar">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
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
                onClick={() => togglePeriodDay(value)}
              >
                {parseIsoDate(value).getUTCDate()}
              </button>
            );
          })}
        </section>
      </article>
      {state.periodDays.length === 0 ? (
        <article className="utility-card">
          <p>No bleeding days logged yet.</p>
        </article>
      ) : null}
    </section>
  );
}
