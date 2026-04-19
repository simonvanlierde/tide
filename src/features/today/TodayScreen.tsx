import { getReminderState } from "../../domain/reminders";
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
  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    reminderWindowDays: state.settings.reminderWindowDays,
    snoozedUntil: state.settings.snoozedUntil,
    notificationPermission:
      typeof Notification === "undefined" ? "default" : Notification.permission
  });
  const fertilityStatus =
    summary.phaseLabel === "ovulation"
      ? "Ovulation likely"
      : summary.fertile
        ? "Fertile window"
        : "Not fertile";

  return (
    <section className="today-screen">
      <div className="status-eyebrow">
        {summary.phaseLabel === "ovulation"
          ? "Ovulation likely now"
          : summary.phaseLabel === "menstrual"
            ? "Period in progress"
            : summary.fertile
              ? "Fertile window active"
              : "Lower fertility likelihood"}
      </div>

      <h1 className="today-screen__day">Day {summary.cycleDay ?? "--"}</h1>
      {summary.phaseLabel === "unknown" ? (
        <p className="today-screen__summary">Learning your cycle rhythm</p>
      ) : null}
      {summary.estimateMode === "fallback" ? (
        <p className="supporting-note supporting-note--subtle">
          Early estimate based on a typical 28-day cycle.
        </p>
      ) : null}

      <div className="metric-grid metric-grid--three">
        <article className="metric-card">
          <div className="metric-card__label">Next period</div>
          <div className="metric-card__value">
            {summary.nextPeriod.daysUntil === null ? "--" : `${summary.nextPeriod.daysUntil} days`}
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-card__label">Phase</div>
          <div className="metric-card__value">{summary.phaseLabel}</div>
        </article>
        <article className="metric-card">
          <div className="metric-card__label">Status</div>
          <div className="metric-card__value">{fertilityStatus}</div>
        </article>
      </div>

      <LogAction isLogged={isTodayLogged} onToggle={toggleTodayPeriodDay} />
      {state.settings.snoozedUntil ? null : reminderState.shouldNudge ? (
        <button className="secondary-action" onClick={() => snoozeReminders(3)}>
          Snooze reminders for 3 days
        </button>
      ) : null}
      <ReminderBanner
        today={today}
        nextPeriodDate={summary.nextPeriod.date}
        settings={state.settings}
      />
    </section>
  );
}
