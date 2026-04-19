import { useState } from "react";
import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { useAppState } from "../../hooks/useAppState";

export function HistoryScreen() {
  const { state, togglePeriodDay, removePeriodDay } = useAppState();
  const [selectedDay, setSelectedDay] = useState<IsoDate>(getTodayIsoDate());

  return (
    <section className="utility-screen">
      <h1 className="utility-screen__title">History</h1>
      <article className="utility-card">
        <h2 className="section-title">Log a past day</h2>
        <label className="file-input">
          <span>Period day</span>
          <input
            type="date"
            aria-label="Period day"
            value={selectedDay}
            max={getTodayIsoDate()}
            onChange={(event) => setSelectedDay(event.target.value as IsoDate)}
          />
        </label>
        <button className="primary-action" onClick={() => togglePeriodDay(selectedDay)}>
          Save period day
        </button>
      </article>
      <div className="utility-stack">
        {state.periodDays.map((day) => (
          <article key={day} className="utility-card utility-card--row">
            <span>{day}</span>
            <button className="text-action" onClick={() => removePeriodDay(day)}>
              Remove {day}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
