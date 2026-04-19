import { useAppState } from "../../hooks/useAppState";

export function HistoryScreen() {
  const { state, removePeriodDay } = useAppState();

  return (
    <section>
      <h1>History</h1>
      <ul>
        {state.periodDays.map((day) => (
          <li key={day}>
            <span>{day}</span>
            <button onClick={() => removePeriodDay(day)}>Remove {day}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
