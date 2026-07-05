import { Info } from "lucide-react";
import { getReminderState } from "../../domain/reminders";
import type {
  CycleEstimateMode,
  CyclePhase,
  CycleSummary,
  IsoDate,
} from "../../domain/types";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
} from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { getTodayIsoDate, parseIsoDate } from "../../utils/date";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { INFORMATION_COPY, SNOOZE_OPTIONS } from "../settings/config";
import { CycleDial } from "./CycleDial";
import { TodayReminderActions } from "./TodayReminderActions";

const NEXT_PERIOD_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const isTodayLogged = state.periodDays.includes(today);
  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    reminderWindowDays: state.settings.reminderWindowDays,
    snoozedUntil: state.settings.snoozedUntil,
  });
  const learningNote = getLearningNote(summary.estimateMode);

  return (
    <section className="today-screen">
      <h1 className="visually-hidden">
        Cycle day {summary.cycleDay ?? "unknown"},{" "}
        {getPhaseWord(summary.phaseLabel)}
      </h1>
      <p className="today-screen__lede">
        {getPhaseSentence(summary.phaseLabel)}
      </p>

      <CycleDial
        summary={summary}
        phaseLabel={getPhaseWord(summary.phaseLabel)}
        periodDays={state.periodDays}
        today={today}
      />

      {learningNote ? (
        <p className="today-screen__note">{learningNote}</p>
      ) : null}

      <dl className="fact-list">
        <div className="fact">
          <dt className="fact__label">Next period</dt>
          <dd className="fact__value">
            <span>{getNextPeriodPhrase(summary.nextPeriod.daysUntil)}</span>
            {summary.nextPeriod.date ? (
              <span className="fact__meta">
                {NEXT_PERIOD_DATE_FORMAT.format(
                  parseIsoDate(summary.nextPeriod.date),
                )}
              </span>
            ) : null}
          </dd>
        </div>

        <div className="fact">
          <dt className="fact__label">Fertility</dt>
          <dd className="fact__value fact__value--inline">
            <span>
              {getFertilityEstimate(summary.phaseLabel, summary.fertile)}
            </span>
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
          </dd>
        </div>
      </dl>

      <TodayReminderActions
        isTodayLogged={isTodayLogged}
        shouldShowSnoozeActions={reminderState.shouldNudge}
        snoozeOptions={SNOOZE_OPTIONS}
        onToggleToday={() => actions.togglePeriodDay(today, today)}
        onSnooze={(days) => actions.snoozeReminders(today, days)}
      />
      <div className="status-row">
        <ReminderBanner
          reminderState={reminderState}
          snoozedUntil={state.settings.snoozedUntil}
        />
      </div>
    </section>
  );
}

function getNextPeriodPhrase(
  daysUntil: CycleSummary["nextPeriod"]["daysUntil"],
) {
  if (daysUntil === null) {
    return "Not enough data yet";
  }

  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }

  if (daysUntil === 0) {
    return "Expected today";
  }

  return `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
}

function getPhaseWord(phaseLabel: CyclePhase) {
  if (phaseLabel === "unknown") {
    return "Learning";
  }

  return `${phaseLabel.charAt(0).toUpperCase()}${phaseLabel.slice(1)}`;
}

function getPhaseSentence(phaseLabel: CyclePhase) {
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

function getFertilityEstimate(phaseLabel: CyclePhase, fertile: boolean) {
  if (phaseLabel === "ovulation" || fertile) {
    return "Higher chance today";
  }

  return "Lower chance today";
}

function getLearningNote(estimateMode: CycleEstimateMode) {
  if (estimateMode === "fallback") {
    return "Learning from recent logs. Using a typical 28-day cycle for now.";
  }

  if (estimateMode === "insufficient") {
    return "Log bleeding days to start an estimate.";
  }

  return null;
}
