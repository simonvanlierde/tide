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
import { plural } from "../../i18n";
import {
  type Translate,
  useAppState,
  useAppStateActions,
  useCycleStats,
  useCycleSummary,
  useLocale,
  useT,
} from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import {
  differenceInDays,
  formatShortDate,
  getTodayIsoDate,
} from "../../utils/date";
import { LogAction } from "../log/LogAction";
import { ReminderPrompt } from "../reminders/ReminderPrompt";
import { InfoPopover } from "../settings/InfoPopover";
import { CycleDial } from "./CycleDial";
import { CycleInsights } from "./CycleInsights";

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen({ today = getTodayIsoDate() }: TodayScreenProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const locale = useLocale();
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
  const learningNote = getLearningNote(t, summary.estimateMode);
  // Prominent only when a fresh bleed is plausible — currently menstruating or a
  // period is expected soon (stays prominent after dismissing the prompt). Once
  // today is logged it drops to calm: "Remove" is a secondary, undo-style action.
  const isOverdue =
    summary.nextPeriod.daysUntil !== null && summary.nextPeriod.daysUntil < 0;
  // Prominent when a fresh bleed is plausible, and on first run: with nothing
  // logged, the log button is the only thing to do, so it must read as the
  // one action. Once today is logged the whole block turns calm.
  const logVariant =
    !isTodayLogged &&
    (summary.phaseLabel === "menstrual" ||
      reminderState.isExpectedSoon ||
      summary.estimateMode === "insufficient")
      ? "primary"
      : "quiet";

  return (
    <section className="today-screen">
      <h1 className="visually-hidden">
        {t("today.srCycleDay", {
          day: summary.cycleDay ?? t("common.unknown"),
          phase: getPhaseWord(t, summary.phaseLabel),
        })}
      </h1>
      <CycleDial
        summary={summary}
        phaseLabel={
          isOverdue ? t("phaseLine.late") : getPhaseLine(t, summary.phaseLabel)
        }
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
          {/* Once the forecast date has passed, "next period" with a date in
              the past contradicts itself; the row becomes "Period · N days
              late · Expected <date>". */}
          <div className="fact">
            <dt className="fact__label">
              {t(isOverdue ? "today.periodLate" : "today.nextPeriod")}
            </dt>
            <dd className="fact__value">
              <span>
                {getNextPeriodPhrase(t, summary.nextPeriod.daysUntil)}
              </span>
              {summary.nextPeriod.date ? (
                <span className="fact__meta">
                  {isOverdue
                    ? t("today.expectedOn", {
                        date: formatShortDate(summary.nextPeriod.date, locale),
                      })
                    : formatShortDate(summary.nextPeriod.date, locale)}
                </span>
              ) : null}
            </dd>
          </div>

          {state.settings.showFertility ? (
            <div className="fact">
              <dt className="fact__label fact__label--with-info">
                {t("today.fertility")}
                <InfoPopover
                  label={t("today.fertilityInfoLabel")}
                  align="start"
                >
                  <p>{t("settings.fertilityMethod")}</p>
                  <p>{t("settings.fertilityDisclaimer")}</p>
                </InfoPopover>
              </dt>
              <dd className="fact__value">
                {isOverdue ? (
                  // The cycle ran past its forecast, so this cycle's ovulation
                  // estimate is spent and the next one isn't known yet.
                  <span>{t("today.fertilityUnclear")}</span>
                ) : summary.ovulationDate ? (
                  <>
                    <span>
                      {getFertilityEstimate(
                        t,
                        summary.phaseLabel,
                        summary.fertile,
                      )}
                    </span>
                    <span className="fact__meta">
                      {getOvulationPhrase(
                        t,
                        differenceInDays(summary.ovulationDate, today),
                      )}
                    </span>
                  </>
                ) : (
                  // No ovulation estimate means no fertility claim, rather
                  // than a confident "lower" from zero data.
                  <span>{t("today.notEnoughData")}</span>
                )}
              </dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          className="fact-list__more"
          onClick={() => setInsightsOpen(true)}
        >
          {t("today.cycleInsights")}
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
          expectedLabel={formatShortDate(reminderState.expectedDate, locale)}
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
      <p className="today-screen__privacy">{t("today.privacy")}</p>
    </section>
  );
}

function getNextPeriodPhrase(
  t: Translate,
  daysUntil: CycleSummary["nextPeriod"]["daysUntil"],
) {
  if (daysUntil === null) {
    return t("today.notEnoughData");
  }

  if (daysUntil < 0) {
    const daysLate = Math.abs(daysUntil);
    return t(plural("today.daysLate", daysLate), { n: daysLate });
  }

  if (daysUntil === 0) {
    return t("today.expectedToday");
  }

  return t(plural("today.inDays", daysUntil), { n: daysUntil });
}

function getPhaseWord(t: Translate, phaseLabel: CyclePhase) {
  return t(phaseLabel === "unknown" ? "phase.learning" : `phase.${phaseLabel}`);
}

function getPhaseLine(t: Translate, phaseLabel: CyclePhase) {
  return t(
    phaseLabel === "unknown" ? "phaseLine.learning" : `phaseLine.${phaseLabel}`,
  );
}

function getOvulationPhrase(t: Translate, daysUntil: number) {
  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return t(plural("today.ovulationDaysAgo", daysAgo), { n: daysAgo });
  }

  if (daysUntil === 0) {
    return t("today.ovulationToday");
  }

  return t(plural("today.ovulationInDays", daysUntil), { n: daysUntil });
}

function getFertilityEstimate(
  t: Translate,
  phaseLabel: CyclePhase,
  fertile: boolean,
) {
  if (phaseLabel === "ovulation" || fertile) {
    return t("today.higherToday");
  }

  return t("today.lowerToday");
}

function getLearningNote(t: Translate, estimateMode: CycleEstimateMode) {
  if (estimateMode === "fallback") {
    return t("today.learningFallback");
  }

  if (estimateMode === "insufficient") {
    return t("today.learningInsufficient");
  }

  return null;
}
