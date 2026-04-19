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
    <section className="today-screen">
      <div className="status-eyebrow">
        {summary.fertile ? "Fertile window active" : "Lower fertility likelihood"}
      </div>

      <h1 className="today-screen__day">Day {summary.cycleDay ?? "--"}</h1>
      <p className="today-screen__summary">
        {summary.phaseLabel === "unknown" ? "Learning your cycle rhythm" : `${summary.phaseLabel} phase`}
        {summary.ovulationDate ? " • ovulation estimated soon" : ""}
      </p>

      <div className="metric-grid">
        <article className="metric-card">
          <div className="metric-card__label">Next period</div>
          <div className="metric-card__value">
            {summary.nextPeriod.daysUntil === null ? "--" : `${summary.nextPeriod.daysUntil} days`}
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-card__label">Ovulation</div>
          <div className="metric-card__value">{summary.ovulationDate ? "Estimated" : "--"}</div>
        </article>
        <article className="metric-card">
          <div className="metric-card__label">Phase</div>
          <div className="metric-card__value">{summary.phaseLabel}</div>
        </article>
        <article className="metric-card">
          <div className="metric-card__label">Status</div>
          <div className="metric-card__value">{summary.fertile ? "Fertile" : "Not fertile"}</div>
        </article>
      </div>

      <LogAction isLogged={isTodayLogged} onToggle={toggleTodayPeriodDay} />
      <button className="secondary-action" onClick={() => snoozeReminders(3)}>
        Snooze reminders for 3 days
      </button>
      <ReminderBanner
        today={today}
        nextPeriodDate={summary.nextPeriod.date}
        settings={state.settings}
      />
    </section>
  );
}
