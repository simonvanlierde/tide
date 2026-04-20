import { getReminderState } from "../../domain/reminders";
import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { useAppState } from "../../hooks/useAppState";
import { CircularCycleView } from "./CircularCycleView";
import { LinearCycleView } from "./CycleView";

interface TodayScreenProps {
  today?: IsoDate;
}

function getNextPeriodSummary(daysUntil: number | null) {
  if (daysUntil === null) {
    return "Period estimate not available yet";
  }

  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `Period expected ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }

  return `Period expected in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
}

function getPhaseSentence(phaseLabel: string) {
  switch (phaseLabel) {
    case "menstrual":
      return "You are currently in the menstrual phase.";
    case "follicular":
      return "Currently in the follicular phase.";
    case "ovulation":
      return "Ovulation is likely around now.";
    case "luteal":
      return "Currently in the luteal phase.";
    default:
      return "Still learning your cycle from recent logs.";
  }
}

function getFertilityEstimate(phaseLabel: string, fertile: boolean) {
  if (phaseLabel === "ovulation" || fertile) {
    return "Fertility estimate: higher chance today";
  }

  return "Fertility estimate: lower chance today";
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
  const nextPeriodSummary = getNextPeriodSummary(summary.nextPeriod.daysUntil);
  const phaseSentence = getPhaseSentence(summary.phaseLabel);
  const fertilityEstimate = getFertilityEstimate(summary.phaseLabel, summary.fertile);

  return (
    <section className="today-screen">
      <h1 className="today-screen__day">Day {summary.cycleDay ?? "--"}</h1>
      <p className="today-screen__lede">{phaseSentence}</p>

      {state.settings.homeDisplayMode === "summary" ? (
        <section className="today-summary" aria-label="Cycle summary">
          {state.settings.homeCards.showNextPeriodCard ? (
            <article className="summary-card summary-card--primary">
              <p className="summary-card__label">Next period</p>
              <p className="summary-card__value">{nextPeriodSummary}</p>
            </article>
          ) : null}

          {state.settings.homeCards.showPhaseCard ? (
            <article className="summary-card">
              <p className="summary-card__label">Current phase</p>
              <p className="summary-card__value">{summary.phaseLabel === "unknown" ? "Learning" : summary.phaseLabel}</p>
            </article>
          ) : null}

          {state.settings.homeCards.showFertilityCard ? (
            <article className="summary-card">
              <p className="summary-card__label">Fertility</p>
              <p className="summary-card__value">{fertilityEstimate}</p>
              <p className="summary-card__note">Informational only and not birth control.</p>
            </article>
          ) : null}
        </section>
      ) : state.settings.homeDisplayMode === "linear" ? (
        <LinearCycleView summary={summary} periodDays={state.periodDays} today={today} />
      ) : (
        <CircularCycleView summary={summary} periodDays={state.periodDays} today={today} />
      )}

      {summary.estimateMode === "fallback" ? (
        <p className="supporting-note">Still learning your cycle from recent logs.</p>
      ) : null}
      {summary.estimateMode === "fallback" ? (
        <p className="supporting-note supporting-note--subtle">Current estimate uses a typical 28-day cycle as a starting point.</p>
      ) : null}
      {summary.estimateMode === "insufficient" ? (
        <p className="supporting-note">Log bleeding days to start building a cycle estimate.</p>
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
