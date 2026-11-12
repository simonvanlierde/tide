import { CalendarRange, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { followAppLink } from "../../app/links";
import { explainForecast } from "../../domain/cycle";
import { getReminderState } from "../../domain/reminders";
import type { CycleEstimateMode, CyclePhase, CycleSummary, IsoDate } from "../../domain/types";
import {
  type Translate,
  useAppState,
  useAppStateActions,
  useForecast,
  useIsReadOnly,
  useLocale,
  useT,
} from "../../state/provider";
import { useToday } from "../../state/useToday";
import { AppIcon } from "../../ui/icons";
import { differenceInDays, formatShortDate } from "../../utils/date";
import { DetailsButton } from "../diary/DailyDetails";
import { DayEditor } from "../log/DayEditor";
import { LogAction } from "../log/LogAction";
import { BackupReminder } from "../reminders/BackupReminder";
import { ReminderPrompt } from "../reminders/ReminderPrompt";
import { InfoPopover } from "../settings/InfoPopover";
import { CycleDial } from "./CycleDial";
import { CycleHistory } from "./CycleHistory";
import { CycleInsights } from "./CycleInsights";
import { OnboardingCard } from "./OnboardingCard";

type Explainer = typeof import("./ForecastExplainer").ForecastExplainer;

interface TodayScreenProps {
  today?: IsoDate;
}

export function TodayScreen(props: TodayScreenProps) {
  const liveToday = useToday();
  const today = props.today ?? liveToday;
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const locale = useLocale();
  const forecast = useForecast(today);
  const [insightsOpen, setInsightsOpen] = useState(false);
  // The sums load with the insights sheet, so their words stay out of the main
  // bundle. Null until loaded; false when loading them failed.
  const [Explainer, setExplainer] = useState<Explainer | null | false>(null);
  const openInsights = () => {
    setInsightsOpen(true);
    if (explanation && !Explainer) {
      import("./ForecastExplainer").then(
        (m) => setExplainer(() => m.ForecastExplainer),
        () => setExplainer(false),
      );
    }
  };
  const insightsButton = useRef<HTMLButtonElement>(null);
  const [editorSection, setEditorSection] = useState<"bleeding" | "details" | null>(null);
  const detailsId = useId();
  const detailsButton = useRef<HTMLButtonElement>(null);
  const readOnly = useIsReadOnly();
  // null: not asked yet. Estimates stay hidden until the user says yes.
  const showFertility = state.settings.showFertility === true;
  const showOnboarding = !state.settings.onboardingDismissed && !readOnly;
  // Logging, removing or dismissing swaps the button under the user's finger
  // for another control, so focus follows to the replacement once. A change
  // from another tab or a new day leaves focus where it is.
  const [focusPending, setFocusPending] = useState(false);
  // Children's effects run first and move focus; then the flag drops.
  useEffect(() => {
    if (focusPending) {
      setFocusPending(false);
    }
  }, [focusPending]);
  const toggleToday = () => {
    actions.togglePeriodDay(today, today);
    setEditorSection("bleeding");
  };
  const isTodayLogged = today in state.intensityByDay;
  const reminderState = getReminderState({
    today,
    nextPeriodDate: forecast.nextPeriod.date,
    isTodayLogged,
    dismissedOn: state.settings.dismissedOn,
  });
  const learningNote = getLearningNote(t, forecast.estimateMode);
  // Prominent only when a fresh bleed is plausible — currently menstruating or a
  // period is expected soon (stays prominent after dismissing the prompt). Once
  // today is logged it drops to calm: "Remove" is a secondary, undo-style action.
  const isOverdue = forecast.nextPeriod.daysUntil !== null && forecast.nextPeriod.daysUntil < 0;
  // Prominent when a fresh bleed is plausible, and on first run: with nothing
  // logged, the log button is the only thing to do, so it must read as the
  // one action. Once today is logged the whole block turns calm.
  const estimate =
    forecast.estimateMode === "insufficient" || !forecast.nextPeriod.date
      ? null
      : {
          value: getNextPeriodPhrase(t, forecast.nextPeriod.daysUntil),
          date: isOverdue
            ? t("today.expectedOn", { date: formatShortDate(forecast.nextPeriod.date, locale) })
            : formatShortDate(forecast.nextPeriod.date, locale),
        };
  // Explain only an estimate the dial shows.
  const explanation = estimate ? explainForecast(forecast) : null;
  const details = (
    <DetailsButton
      ref={detailsButton}
      day={today}
      open={editorSection !== null}
      controls={detailsId}
      onOpen={() => setEditorSection("details")}
    />
  );
  const logVariant =
    !isTodayLogged &&
    (forecast.phaseLabel === "menstrual" || reminderState.isExpectedSoon || forecast.estimateMode === "insufficient")
      ? "primary"
      : "quiet";

  function closeEditor() {
    const fromDetails = editorSection === "details";
    setEditorSection(null);
    if (fromDetails) requestAnimationFrame(() => detailsButton.current?.focus());
    else setFocusPending(true);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Escape also closes the nonmodal editor when focus has returned to the forecast.
    <section
      className="today-screen"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          editorSection !== null &&
          !event.defaultPrevented &&
          !(event.target instanceof Element && event.target.closest("dialog[open]"))
        ) {
          event.preventDefault();
          closeEditor();
        }
      }}
    >
      <h1 className="visually-hidden">
        {t("today.srCycleDay", {
          day: forecast.cycleDay ?? t("common.unknown"),
          phase: getPhaseWord(t, forecast.phaseLabel),
        })}
      </h1>
      {/* The dial shows the estimate, but a slider's content is not read out. */}
      <p className="visually-hidden">
        {estimate
          ? `${estimate.value}, ${estimate.date}`
          : forecast.estimateMode === "insufficient"
            ? learningNote
            : null}
      </p>

      {showOnboarding && forecast.estimateMode === "insufficient" ? null : (
        <CycleDial
          forecast={forecast}
          phaseLabel={isOverdue ? t("phaseLine.late") : getPhaseLine(t, forecast.phaseLabel)}
          estimate={estimate}
          prompt={forecast.estimateMode === "insufficient" ? learningNote : null}
          intensityByDay={state.intensityByDay}
          today={today}
        />
      )}
      {forecast.estimateMode !== "insufficient" && learningNote ? (
        <p className="today-screen__note">{learningNote}</p>
      ) : null}

      {showOnboarding ? (
        <OnboardingCard
          onDismiss={() => {
            setFocusPending(true);
            actions.setSetting("onboardingDismissed", true);
          }}
        />
      ) : null}

      <div className="today-screen__lead">
        {editorSection === null ? (
          <div className="today-screen__logging">
            {reminderState.shouldPrompt ? (
              <ReminderPrompt
                onLog={toggleToday}
                onDismiss={() => {
                  setFocusPending(true);
                  actions.dismissReminder(today);
                }}
                autoFocus={focusPending}
                aside={details}
              />
            ) : (
              <LogAction
                isLogged={isTodayLogged}
                intensity={state.intensityByDay[today]}
                variant={logVariant}
                onToggle={toggleToday}
                onEdit={() => setEditorSection("bleeding")}
                autoFocus={focusPending}
                aside={details}
              />
            )}
            {!readOnly && Object.keys(state.intensityByDay).length === 0 ? (
              <a className="text-action today-screen__past-period" href="/calendar" onClick={followAppLink}>
                <AppIcon icon={CalendarRange} className="text-action__icon" />
                {t("calendar.logRange")}
              </a>
            ) : null}
          </div>
        ) : null}
        <div id={detailsId}>
          {editorSection !== null ? (
            <DayEditor key={today} day={today} today={today} initialSection={editorSection} onClose={closeEditor} />
          ) : null}
        </div>
      </div>

      <div className="fact-list">
        {forecast.estimateMode === "insufficient" || !showFertility ? null : (
          <dl className="fact-list__rows">
            <div className="fact">
              <dt className="fact__label fact__label--with-info">
                {t("today.fertility")}
                <InfoPopover label={t("today.fertilityInfoLabel")} align="start">
                  <p>{t("settings.fertilityMethod")}</p>
                  <p>{t("today.notBirthControl")}</p>
                </InfoPopover>
              </dt>
              <dd className="fact__value">
                {isOverdue ? (
                  // The cycle ran past its forecast, so this cycle's ovulation
                  // estimate is spent and the next one isn't known yet.
                  <span>{t("today.fertilityUnclear")}</span>
                ) : forecast.ovulationDate ? (
                  <>
                    <span>{getFertilityEstimate(t, forecast.phaseLabel, forecast.fertile)}</span>
                    <span className="fact__meta">
                      {getOvulationPhrase(t, differenceInDays(forecast.ovulationDate, today))}
                    </span>
                  </>
                ) : null}
              </dd>
            </div>
          </dl>
        )}

        <button ref={insightsButton} type="button" className="fact-list__more" onClick={openInsights}>
          {t("today.cycleInsights")}
          <AppIcon icon={ChevronRight} className="fact-list__more-icon" />
        </button>
      </div>

      {insightsOpen ? (
        <CycleInsights
          summary={forecast}
          stats={forecast.stats}
          showFertility={showFertility}
          onClose={() => setInsightsOpen(false)}
          // Null while the explainer chunk loads, so the sheet doesn't swap headings.
          explainer={
            !explanation ? undefined : Explainer ? (
              <Explainer explanation={explanation} />
            ) : Explainer === false ? (
              <p className="insights__note" role="alert">
                {t("today.explainError")}
              </p>
            ) : null
          }
        >
          <CycleHistory today={today} />
        </CycleInsights>
      ) : null}

      <BackupReminder today={today} onDone={() => insightsButton.current?.focus()} />
    </section>
  );
}

function getNextPeriodPhrase(t: Translate, daysUntil: CycleSummary["nextPeriod"]["daysUntil"]) {
  if (daysUntil === null) {
    return t("common.unknown");
  }

  if (daysUntil < 0) {
    const daysLate = Math.abs(daysUntil);
    return t("today.periodDaysLate", { n: daysLate });
  }

  if (daysUntil === 0) {
    return t("today.periodExpectedToday");
  }

  return t("today.periodInDays", { n: daysUntil });
}

function getPhaseWord(t: Translate, phaseLabel: CyclePhase) {
  return t(phaseLabel === "unknown" ? "phase.learning" : `phase.${phaseLabel}`);
}

function getPhaseLine(t: Translate, phaseLabel: CyclePhase) {
  return t(phaseLabel === "unknown" ? "phaseLine.learning" : `phaseLine.${phaseLabel}`);
}

function getOvulationPhrase(t: Translate, daysUntil: number) {
  if (daysUntil < 0) {
    const daysSince = Math.abs(daysUntil);
    return t("today.ovulationDaysAgo", { n: daysSince });
  }

  if (daysUntil === 0) {
    return t("today.ovulationToday");
  }

  return t("today.ovulationInDays", {
    n: daysUntil,
  });
}

function getFertilityEstimate(t: Translate, phaseLabel: CyclePhase, fertile: boolean) {
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
