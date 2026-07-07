import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { getPeriodDays } from "../../domain/flow";
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
  useCycleStats,
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
import { InfoPopover } from "../settings/InfoPopover";
import { CycleDial } from "./CycleDial";
import { CycleInsights } from "./CycleInsights";

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const stats = useCycleStats();
  const [insightsOpen, setInsightsOpen] = useState(false);
  const isTodayLogged = today in state.intensityByDay;
  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    isTodayLogged,
    dismissedOn: state.settings.dismissedOn,
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
        periodDays={getPeriodDays(state.intensityByDay)}
        intensityByDay={state.intensityByDay}
        today={today}
        showFertility={state.settings.showFertility}
      />

      {learningNote ? (
        <p className="today-screen__note">{learningNote}</p>
      ) : null}

      <div className="fact-list">
        <dl className="fact-list__rows">
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
              <dt className="fact__label fact__label--with-info">
                Fertility
                <InfoPopover label="How fertility is estimated" align="start">
                  <p>{INFORMATION_COPY.fertilityMethod}</p>
                  <p>{INFORMATION_COPY.fertility}</p>
                </InfoPopover>
              </dt>
              <dd className="fact__value">
                <span>
                  {getFertilityEstimate(summary.phaseLabel, summary.fertile)}
                </span>
                {summary.ovulationDate ? (
                  <span className="fact__meta">
                    {getOvulationPhrase(
                      differenceInDays(summary.ovulationDate, today),
                    )}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          className="fact-list__more"
          onClick={() => setInsightsOpen(true)}
        >
          Cycle insights
          <AppIcon icon={ChevronRight} className="fact-list__more-icon" />
        </button>
      </div>

      {insightsOpen ? (
        <CycleInsights
          summary={summary}
          stats={stats}
          onClose={() => setInsightsOpen(false)}
        />
      ) : null}

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
          intensity={state.intensityByDay[today]}
          variant={logVariant}
          onToggle={() => actions.togglePeriodDay(today, today)}
          onSelectIntensity={(intensity) =>
            actions.setDayIntensity(today, intensity, today)
          }
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
    return "Ovulation today";
  }

  return `Ovulation in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
}

function getFertilityEstimate(phaseLabel: CyclePhase, fertile: boolean) {
  if (phaseLabel === "ovulation" || fertile) {
    return "Higher today";
  }

  return "Lower today";
}

function getLearningNote(estimateMode: CycleEstimateMode) {
  if (estimateMode === "fallback") {
    return "Using a typical 28-day cycle until we learn your pattern.";
  }

  if (estimateMode === "insufficient") {
    return "Log bleeding to start an estimate.";
  }

  return null;
}
