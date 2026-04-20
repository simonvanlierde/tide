import { getReminderState } from "../../domain/reminders";
import type { IsoDate } from "../../domain/types";
import { useAppState } from "../../state/appState";
import { getTodayIsoDate } from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { AppIcon, Info } from "../../ui/icons";
import { INFORMATION_COPY, SNOOZE_OPTIONS } from "../settings/config";
import { CircularCycleView } from "./CircularCycleView";
import { LinearCycleView } from "./CycleView";
import {
  getFertilityEstimate,
  getLearningNote,
  getNextPeriodSummary,
  getPhaseSentence,
} from "./viewModel";

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const { state, summary, toggleTodayPeriodDay, snoozeReminders } =
    useAppState(today);
  const isTodayLogged = state.periodDays.includes(today);
  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    reminderWindowDays: state.settings.reminderWindowDays,
    snoozedUntil: state.settings.snoozedUntil,
    notificationPermission:
      typeof Notification === "undefined" ? "default" : Notification.permission,
  });
  const nextPeriodSummary = getNextPeriodSummary(summary.nextPeriod.daysUntil);
  const phaseSentence = getPhaseSentence(summary.phaseLabel);
  const fertilityEstimate = getFertilityEstimate(
    summary.phaseLabel,
    summary.fertile,
  );
  const learningNote = getLearningNote(summary.estimateMode);

  return (
    <section className="today-screen">
      <header className="today-hero">
        <p className="today-hero__eyebrow">Cycle today</p>
        <h1 className="today-screen__day">Day {summary.cycleDay ?? "--"}</h1>
        <p className="today-screen__lede">{phaseSentence}</p>
        {learningNote ? <p className="today-hero__aside">{learningNote}</p> : null}
      </header>

      {state.settings.homeDisplayMode === "linear" ? (
        <LinearCycleView
          summary={summary}
          periodDays={state.periodDays}
          today={today}
        />
      ) : state.settings.homeDisplayMode === "circular" ? (
        <CircularCycleView
          summary={summary}
          periodDays={state.periodDays}
          today={today}
        />
      ) : (
        <section className="today-summary" aria-label="Cycle summary">
          <article className="summary-card summary-card--primary">
            <p className="summary-card__label">Next period</p>
            <p className="summary-card__value">{nextPeriodSummary}</p>
          </article>

          <div className="summary-chip-row">
            <article className="summary-chip">
              <p className="summary-chip__label">Phase</p>
              <p className="summary-chip__value">
                {summary.phaseLabel === "unknown" ? "Learning" : summary.phaseLabel}
              </p>
            </article>

            <article className="summary-chip summary-chip--with-action">
              <div>
                <p className="summary-chip__label">Fertility</p>
                <p className="summary-chip__value">{fertilityEstimate}</p>
              </div>
              <details className="info-popover">
                <summary
                  className="info-popover__trigger"
                  aria-label="Show fertility disclaimer"
                >
                  <AppIcon icon={Info} className="info-popover__icon" />
                </summary>
                <div className="info-popover__content" role="note">
                  {INFORMATION_COPY.fertility}
                </div>
              </details>
            </article>
          </div>
        </section>
      )}

      <LogAction isLogged={isTodayLogged} onToggle={toggleTodayPeriodDay} />
      {state.settings.snoozedUntil ? null : reminderState.shouldNudge ? (
        <fieldset className="snooze-actions chip-fieldset">
          <legend className="settings-label">Snooze reminders</legend>
          {SNOOZE_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              className="secondary-action secondary-action--chip"
              onClick={() => snoozeReminders(days)}
            >
              Snooze {days} {days === 1 ? "day" : "days"}
            </button>
          ))}
        </fieldset>
      ) : null}
      <div className="status-row">
        <ReminderBanner
          today={today}
          nextPeriodDate={summary.nextPeriod.date}
          settings={state.settings}
        />
      </div>
    </section>
  );
}
