import type { IsoDate } from "../../domain/types";
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
import {
  getFertilityEstimate,
  getLearningNote,
  getNextPeriodSummary,
  getPhaseSentence,
} from "./copy";

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    reminderWindowDays: state.settings.reminderWindowDays,
    snoozedUntil: state.settings.snoozedUntil,
  });

  const model = {
    summary,
    periodDays: state.periodDays,
    settings: state.settings,
    isTodayLogged: state.periodDays.includes(today),
    phaseSentence: getPhaseSentence(summary.phaseLabel),
    learningNote: getLearningNote(summary.estimateMode),
    nextPeriodSummary: getNextPeriodSummary(summary.nextPeriod.daysUntil),
    fertilityEstimate: getFertilityEstimate(summary.phaseLabel, summary.fertile),
    fertilityDisclaimer: INFORMATION_COPY.fertility,
    displayMode: state.settings.homeDisplayMode,
    shouldShowSnoozeActions:
      !state.settings.snoozedUntil && reminderState.shouldNudge,
    snoozeOptions: SNOOZE_OPTIONS,
    toggleToday() {
      actions.togglePeriodDay(today);
    },
    snooze(days: number) {
      actions.snoozeReminders(today, days);
    },
  };

  return (
    <section className="today-screen">
      <TodayHero
        cycleDay={model.summary.cycleDay}
        phaseSentence={model.phaseSentence}
        learningNote={model.learningNote}
      />

      <TodayHomeContent
        displayMode={model.displayMode}
        summary={model.summary}
        periodDays={model.periodDays}
        today={today}
        nextPeriodSummary={model.nextPeriodSummary}
        fertilityEstimate={model.fertilityEstimate}
        fertilityDisclaimer={model.fertilityDisclaimer}
      />

      <TodayReminderActions
        isTodayLogged={model.isTodayLogged}
        shouldShowSnoozeActions={model.shouldShowSnoozeActions}
        snoozeOptions={model.snoozeOptions}
        onToggleToday={model.toggleToday}
        onSnooze={model.snooze}
      />
      <div className="status-row">
        <ReminderBanner
          today={today}
          nextPeriodDate={model.summary.nextPeriod.date}
          settings={model.settings}
        />
      </div>
    </section>
  );
}
