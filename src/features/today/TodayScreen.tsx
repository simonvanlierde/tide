import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { useAppState } from "../../hooks/useAppState";

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const { state, summary, toggleTodayPeriodDay, snoozeReminders } = useAppState(today);
  const isTodayLogged = state.periodDays.includes(today);

  return (
    <section>
      <h1>Today</h1>
      <p>Day {summary.cycleDay ?? "--"}</p>
      <p>Fertile window: {summary.fertile ? "likely active" : "not likely active"}</p>
      <p>Phase: {summary.phaseLabel}</p>
      <p>
        Next period {summary.nextPeriod.daysUntil === null ? "not available yet" : `in ${summary.nextPeriod.daysUntil} days`}
      </p>
      <LogAction isLogged={isTodayLogged} onToggle={toggleTodayPeriodDay} />
      <button onClick={() => snoozeReminders(3)}>Snooze reminders for 3 days</button>
      <ReminderBanner snoozedUntil={state.settings.snoozedUntil} />
    </section>
  );
}
