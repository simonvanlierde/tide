import { useAppState } from "../../hooks/useAppState";

export function HistoryScreen() {
  const { state, removePeriodDay } = useAppState();

  return (
    <section className="utility-screen">
      <h1 className="utility-screen__title">History</h1>
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
