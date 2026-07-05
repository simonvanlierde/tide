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
import {
  differenceInDays,
  formatShortDate,
  getTodayIsoDate,
} from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderPrompt } from "../reminders/ReminderPrompt";
import { INFORMATION_COPY } from "../settings/config";
import { CycleDial } from "./CycleDial";

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
    isTodayLogged,
    dismissedFor: state.settings.dismissedFor,
  });
  const learningNote = getLearningNote(summary.estimateMode);
  // Prominent only when a fresh bleed is plausible — currently menstruating or a
  // period is expected soon (stays prominent after dismissing the prompt). Once
  // today is logged it drops to calm: "Remove" is a secondary, undo-style action.
  const logVariant =
    !isTodayLogged &&
    (summary.phaseLabel === "menstrual" || reminderState.isExpectedSoon)
      ? "primary"
      : "quiet";

  return (
    <section className="today-screen">
      <h1 className="visually-hidden">
        Cycle day {summary.cycleDay ?? "unknown"},{" "}
        {getPhaseWord(summary.phaseLabel)}
      </h1>
      <CycleDial
        summary={summary}
        phaseLabel={getPhaseLine(summary.phaseLabel)}
        periodDays={state.periodDays}
        today={today}
        showFertility={state.settings.showFertility}
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
                {formatShortDate(summary.nextPeriod.date)}
              </span>
            ) : null}
          </dd>
        </div>

        {state.settings.showFertility ? (
          <div className="fact">
            <dt className="fact__label">Fertility</dt>
            <dd className="fact__value">
              <span className="fact__value--inline">
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
              </span>
              {summary.ovulationDate ? (
                <span className="fact__meta">
                  {getOvulationPhrase(
                    differenceInDays(summary.ovulationDate, today),
                  )}{" "}
                  · {formatShortDate(summary.ovulationDate)}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {reminderState.shouldPrompt && reminderState.expectedDate ? (
        <ReminderPrompt
          isOverdue={reminderState.isOverdue}
          expectedLabel={formatShortDate(reminderState.expectedDate)}
          onLog={() => actions.togglePeriodDay(today, today)}
          onDismiss={() => actions.dismissReminder(today)}
        />
      ) : (
        <LogAction
          isLogged={isTodayLogged}
          variant={logVariant}
          onToggle={() => actions.togglePeriodDay(today, today)}
        />
      )}
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

function getPhaseLine(phaseLabel: CyclePhase) {
  if (phaseLabel === "unknown") {
    return "Learning";
  }

  return `${getPhaseWord(phaseLabel)} phase`;
}

function getOvulationPhrase(daysUntil: number) {
  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `Ovulation ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }

  if (daysUntil === 0) {
    return "Ovulation expected today";
  }

  return `Ovulation in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
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
