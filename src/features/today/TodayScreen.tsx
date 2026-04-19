import { getReminderState } from "../../domain/reminders";
import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { useAppState } from "../../hooks/useAppState";
import { CycleView } from "./CycleView";

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
  const snoozeOptions = [1, 3, 7] as const;
  const nextPeriodSummary =
    summary.nextPeriod.daysUntil === null
      ? "Next period estimate not available yet"
      : summary.nextPeriod.daysUntil < 0
        ? `Next period ${Math.abs(summary.nextPeriod.daysUntil)} day${Math.abs(summary.nextPeriod.daysUntil) === 1 ? "" : "s"} late`
        : `Next period in ${summary.nextPeriod.daysUntil} day${summary.nextPeriod.daysUntil === 1 ? "" : "s"}`;

  return (
    <section className="today-screen">
      <h1 className="today-screen__day">Day {summary.cycleDay ?? "--"}</h1>
      <CycleView summary={summary} periodDays={state.periodDays} today={today} />
      <p className="today-screen__summary">{nextPeriodSummary}</p>
      {summary.phaseLabel === "unknown" ? (
        <p className="supporting-note">Learning your cycle rhythm</p>
      ) : null}
      {summary.estimateMode === "fallback" ? (
        <p className="supporting-note supporting-note--subtle">
          Early estimate based on a typical 28-day cycle.
        </p>
      ) : null}

      <LogAction isLogged={isTodayLogged} onToggle={toggleTodayPeriodDay} />
      {state.settings.snoozedUntil ? null : reminderState.shouldNudge ? (
        <div className="snooze-actions" role="group" aria-label="Snooze reminders">
          {snoozeOptions.map((days) => (
            <button
              key={days}
              className="secondary-action secondary-action--chip"
              onClick={() => snoozeReminders(days)}
            >
              Snooze {days} {days === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
      ) : null}
      <ReminderBanner
        today={today}
        nextPeriodDate={summary.nextPeriod.date}
        settings={state.settings}
      />
    </section>
  );
}
