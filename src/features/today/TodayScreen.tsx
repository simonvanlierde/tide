import type { CycleEstimateMode, CyclePhase, IsoDate } from "../../domain/types";
import { getReminderState } from "../../domain/reminders";
import { getTodayIsoDate } from "../../utils/date";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
} from "../../state";
import { INFORMATION_COPY, SNOOZE_OPTIONS } from "../settings/config";
import { ReminderBanner } from "../reminders/ReminderBanner";
import { TodayHero } from "./TodayHero";
import { TodayHomeContent } from "./TodayHomeContent";
import { TodayReminderActions } from "./TodayReminderActions";

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
  const shouldShowSnoozeActions =
    !state.settings.snoozedUntil && reminderState.shouldNudge;

  return (
    <section className="today-screen">
      <TodayHero
        cycleDay={summary.cycleDay}
        phaseSentence={getPhaseSentence(summary.phaseLabel)}
        learningNote={getLearningNote(summary.estimateMode)}
      />

      <TodayHomeContent
        displayMode={state.settings.homeDisplayMode}
        summary={summary}
        periodDays={state.periodDays}
        today={today}
        nextPeriodSummary={getNextPeriodSummary(summary.nextPeriod.daysUntil)}
        fertilityEstimate={getFertilityEstimate(summary.phaseLabel, summary.fertile)}
        fertilityDisclaimer={INFORMATION_COPY.fertility}
      />

      <TodayReminderActions
        isTodayLogged={isTodayLogged}
        shouldShowSnoozeActions={shouldShowSnoozeActions}
        snoozeOptions={SNOOZE_OPTIONS}
        onToggleToday={() => actions.togglePeriodDay(today)}
        onSnooze={(days) => actions.snoozeReminders(today, days)}
      />
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
