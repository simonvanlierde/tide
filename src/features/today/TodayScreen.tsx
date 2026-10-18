import { ChevronRight } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { explainForecast } from "../../domain/cycle";
import { getReminderState } from "../../domain/reminders";
import type {
  CycleEstimateMode,
  CyclePhase,
  CycleSummary,
  IsoDate,
} from "../../domain/types";
import { plural, type SupportedLanguage } from "../../i18n";
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
import { LogAction } from "../log/LogAction";
import { ReminderPrompt } from "../reminders/ReminderPrompt";
import { InfoPopover } from "../settings/InfoPopover";
import { CycleDial } from "./CycleDial";
import { CycleInsights } from "./CycleInsights";
import { FertilityQuestion } from "./FertilityQuestion";

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
  // The sheet loads on first open, so its words stay out of the main bundle.
  // Null until loaded; false when loading it failed.
  const [Explainer, setExplainer] = useState<Explainer | null | false>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const openExplainer = () =>
    import("./ForecastExplainer").then(
      (m) => {
        setExplainer(() => m.ForecastExplainer);
        setExplainOpen(true);
      },
      () => setExplainer(false),
    );
  const insightsButton = useRef<HTMLButtonElement>(null);
  const readOnly = useIsReadOnly();
  // null: not asked yet. Estimates stay hidden until the user says yes.
  const showFertility = state.settings.showFertility === true;
  const askFertility =
    state.settings.showFertility === null &&
    forecast.nextPeriod.date !== null &&
    !readOnly;
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
    setFocusPending(true);
    actions.togglePeriodDay(today, today);
  };
  const isTodayLogged = today in state.intensityByDay;
  const reminderState = getReminderState({
    today,
    nextPeriodDate: forecast.nextPeriod.date,
    isTodayLogged,
    dismissedOn: state.settings.dismissedOn,
  });
  const explanation = explainForecast(forecast);
  const learningNote = getLearningNote(t, forecast.estimateMode);
  // Prominent only when a fresh bleed is plausible — currently menstruating or a
  // period is expected soon (stays prominent after dismissing the prompt). Once
  // today is logged it drops to calm: "Remove" is a secondary, undo-style action.
  const isOverdue =
    forecast.nextPeriod.daysUntil !== null && forecast.nextPeriod.daysUntil < 0;
  // Prominent when a fresh bleed is plausible, and on first run: with nothing
  // logged, the log button is the only thing to do, so it must read as the
  // one action. Once today is logged the whole block turns calm.
  const logVariant =
    !isTodayLogged &&
    (forecast.phaseLabel === "menstrual" ||
      reminderState.isExpectedSoon ||
      forecast.estimateMode === "insufficient")
      ? "primary"
      : "quiet";

  return (
    <section className="today-screen">
      <h1 className="visually-hidden">
        {t("today.srCycleDay", {
          day: forecast.cycleDay ?? t("common.unknown"),
          phase: getPhaseWord(t, forecast.phaseLabel),
        })}
      </h1>
      <CycleDial
        forecast={forecast}
        phaseLabel={
          isOverdue ? t("phaseLine.late") : getPhaseLine(t, forecast.phaseLabel)
        }
        intensityByDay={state.intensityByDay}
        today={today}
      />

      {learningNote ? (
        <p className="today-screen__note">{learningNote}</p>
      ) : null}
      {/* Import is disabled while read-only, so the link would lead nowhere. */}
      {Object.keys(state.intensityByDay).length === 0 && !readOnly ? (
        <p className="today-screen__note">
          {t("today.importPrompt")}{" "}
          {/* biome-ignore lint/a11y/useValidAnchor: real page navigation with an href; the handler only keeps it client-side, like the tab bar */}
          <a href="/settings#import" onClick={openImport}>
            {t("today.importLink")}
          </a>
        </p>
      ) : null}

      <div className="fact-list">
        {/* With no estimate, the learning note above is the one line that
            says so; empty rows would only repeat it. */}
        {forecast.estimateMode === "insufficient" ? null : (
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
                  {getNextPeriodPhrase(
                    t,
                    locale,
                    forecast.nextPeriod.daysUntil,
                  )}
                </span>
                {forecast.nextPeriod.date ? (
                  <span className="fact__meta">
                    {isOverdue
                      ? t("today.expectedOn", {
                          date: formatShortDate(
                            forecast.nextPeriod.date,
                            locale,
                          ),
                        })
                      : formatShortDate(forecast.nextPeriod.date, locale)}
                  </span>
                ) : null}
              </dd>
            </div>

            {showFertility ? (
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
                  ) : forecast.ovulationDate ? (
                    <>
                      <span>
                        {getFertilityEstimate(
                          t,
                          forecast.phaseLabel,
                          forecast.fertile,
                        )}
                      </span>
                      <span className="fact__meta">
                        {getOvulationPhrase(
                          t,
                          locale,
                          differenceInDays(forecast.ovulationDate, today),
                        )}
                      </span>
                      <span className="fact__meta">
                        {t("today.notBirthControl")}
                      </span>
                    </>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        <button
          ref={insightsButton}
          type="button"
          className="fact-list__more"
          onClick={() => setInsightsOpen(true)}
        >
          {t("today.cycleInsights")}
          <AppIcon icon={ChevronRight} className="fact-list__more-icon" />
        </button>
        {explanation ? (
          <button
            type="button"
            className="fact-list__more"
            onClick={openExplainer}
          >
            {t("today.howWorkedOut")}
            <AppIcon icon={ChevronRight} className="fact-list__more-icon" />
          </button>
        ) : null}
      </div>

      {askFertility ? (
        <FertilityQuestion
          onAnswer={(show) => {
            actions.setSetting("showFertility", show);
            // The card goes away under the user's focus; continue from the
            // control just before it.
            insightsButton.current?.focus();
          }}
        />
      ) : null}

      {insightsOpen ? (
        <CycleInsights
          summary={forecast}
          stats={forecast.stats}
          showFertility={showFertility}
          onClose={() => setInsightsOpen(false)}
        />
      ) : null}

      {Explainer === false ? (
        <p className="today-screen__note" role="alert">
          {t("today.explainError")}
        </p>
      ) : null}

      {explainOpen && explanation && Explainer ? (
        <Explainer
          explanation={explanation}
          onClose={() => setExplainOpen(false)}
        />
      ) : null}

      {reminderState.shouldPrompt && reminderState.expectedDate ? (
        <ReminderPrompt
          isOverdue={reminderState.isOverdue}
          expectedLabel={formatShortDate(reminderState.expectedDate, locale)}
          onLog={toggleToday}
          onDismiss={() => {
            setFocusPending(true);
            actions.dismissReminder(today);
          }}
          autoFocus={focusPending}
        />
      ) : (
        <LogAction
          isLogged={isTodayLogged}
          intensity={state.intensityByDay[today]}
          variant={logVariant}
          onToggle={toggleToday}
          onSelectIntensity={(intensity) =>
            actions.setDayIntensity(today, intensity, today)
          }
          autoFocus={focusPending}
        />
      )}
      <p className="today-screen__privacy">{t("today.privacy")}</p>
    </section>
  );
}

// Client-side, like the tab bar: the app shell follows popstate, then focuses
// the #import target. A modified click opens the page the browser's way.
function openImport(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  window.history.pushState(null, "", event.currentTarget.href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getNextPeriodPhrase(
  t: Translate,
  locale: SupportedLanguage,
  daysUntil: CycleSummary["nextPeriod"]["daysUntil"],
) {
  if (daysUntil === null) {
    return t("common.unknown");
  }

  if (daysUntil < 0) {
    const daysLate = Math.abs(daysUntil);
    return t(plural("today.daysLate", daysLate, locale), { n: daysLate });
  }

  if (daysUntil === 0) {
    return t("today.expectedToday");
  }

  return t(plural("today.inDays", daysUntil, locale), { n: daysUntil });
}

function getPhaseWord(t: Translate, phaseLabel: CyclePhase) {
  return t(phaseLabel === "unknown" ? "phase.learning" : `phase.${phaseLabel}`);
}

function getPhaseLine(t: Translate, phaseLabel: CyclePhase) {
  return t(
    phaseLabel === "unknown" ? "phaseLine.learning" : `phaseLine.${phaseLabel}`,
  );
}

function getOvulationPhrase(
  t: Translate,
  locale: SupportedLanguage,
  daysUntil: number,
) {
  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return t(plural("today.ovulationDaysAgo", daysAgo, locale), { n: daysAgo });
  }

  if (daysUntil === 0) {
    return t("today.ovulationToday");
  }

  return t(plural("today.ovulationInDays", daysUntil, locale), {
    n: daysUntil,
  });
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
