import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Forecast, IsoDate, LoggedFlow } from "../../domain/types";
import { useLocale, useT } from "../../state/provider";
import { addDays, formatShortDate } from "../../utils/date";
import { CycleLegend } from "./CycleLegend";
import { buildCycleSegments, type CycleSegment, getSegmentStatus } from "./cycleSegments";
import { dayAngleDeg } from "./dialGeometry";
import { estimateColor, getTicksStyle, PREDICTED_SPAN_DAYS, phaseColor, ringStyle } from "./dialStyle";
import { prefersMotion, useDialScrub } from "./useDialScrub";

interface CycleDialProps {
  forecast: Forecast;
  phaseLabel: string;
  /** Shown in the centre while nothing is being scrubbed; null without an estimate.
   * `value` names its own subject ("Period in 19 days"): the centre has no label. */
  estimate?: { value: string; date: string } | null;
  /** Shown in the centre at rest when there is no estimate yet (first run). */
  prompt?: string | null;
  intensityByDay: Record<IsoDate, LoggedFlow>;
  today: IsoDate;
}

// The ring sweeps in on the first view of each day: when the app opens, and
// again after midnight, but not on every tab switch. Kept in memory rather than
// storage, so the dial adds nothing to what Tide stores.
let sweptOn: IsoDate | null = null;

function firstViewToday(today: IsoDate) {
  if (!prefersMotion() || sweptOn === today) return false;
  sweptOn = today;
  return true;
}

export function CycleDial({
  forecast,
  phaseLabel,
  estimate = null,
  prompt = null,
  intensityByDay,
  today,
}: CycleDialProps) {
  const t = useT();
  const locale = useLocale();
  // Resolve a segment's status key to text, falling back to the phase line.
  const statusText = (segment: CycleSegment) => {
    const key = getSegmentStatus(segment, forecast);
    return key ? t(key) : phaseLabel;
  };
  const isLate = (forecast.nextPeriod.daysUntil ?? 0) < 0;
  // Logged bleeding today is the only way into the menstrual phase.
  const bleedingToday = forecast.phaseLabel === "menstrual" && forecast.cycleDay !== null;
  const nowLine =
    forecast.cycleDay === null
      ? phaseLabel
      : bleedingToday
        ? t("dial.periodDay", { n: forecast.cycleDay })
        : isLate
          ? // Late: the headline already says so.
            t("dial.day", { n: forecast.cycleDay })
          : `${t("dial.day", { n: forecast.cycleDay })} · ${phaseLabel}`;
  const [sweeping] = useState(() => firstViewToday(today));

  const segments = useMemo(
    () => buildCycleSegments(forecast, intensityByDay, today),
    [forecast, intensityByDay, today],
  );
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);
  // Logging today rings the marker once; the counter restarts the animation.
  const loggedToday = segments[currentIndex]?.isPeriod === true;
  const wasLogged = useRef(loggedToday);
  const [ripples, setRipples] = useState(0);
  useEffect(() => {
    if (loggedToday && !wasLogged.current && prefersMotion()) setRipples((n) => n + 1);
    wasLogged.current = loggedToday;
  }, [loggedToday]);

  // A compact expected-period nub past the logged cycle (plus a decorative tail
  // drawn in the gradient). Kept to PREDICTED_SPAN_DAYS so it hints at the next
  // start without eating the ring. Modelled here, not in the segment data, so it
  // can be previewed like any other day.
  //
  // Only shown for a genuinely upcoming period: once it's due today or overdue,
  // the next-period date has already been folded into the ring as its "Period
  // expected" tail, so a nub past the arc would double it and mislabel a past
  // date as a future cycle day.
  const nextDate = forecast.nextPeriod.date;
  const hasPrediction = nextDate !== null && nextDate > today && Boolean(segments[0]?.date);
  const cycleDayCount = segments.length;
  const predictedCount = hasPrediction ? PREDICTED_SPAN_DAYS : 0;
  const totalCells = cycleDayCount + predictedCount;
  // Three conic gradients with up to ~40 stops each: rebuilt only when the data
  // changes, not on every scrub frame.
  const dialStyle = useMemo(
    () => ringStyle(segments, predictedCount, phaseColor, "var(--dial-wash-period)"),
    [segments, predictedCount],
  );
  const estimatesStyle = useMemo(
    () => ringStyle(segments, predictedCount, estimateColor, "var(--estimate-period)"),
    [segments, predictedCount],
  );
  const ticksStyle = useMemo(() => getTicksStyle(totalCells, predictedCount), [totalCells, predictedCount]);
  // Last scrubbable cell: the first expected-period day, or the final logged day
  // with no forecast. The 1.5-day nub is a visual hint, so scrubbing must stop
  // at this whole cell rather than the fractional end of the ring.
  const maxIndex = hasPrediction ? cycleDayCount : cycleDayCount - 1;

  const rotation = currentIndex >= 0 ? dayAngleDeg(currentIndex, totalCells) : 0;

  const { frameRef, frameProps, previewIndex, ghostAngle, settle, endSettle } = useDialScrub({
    totalCells,
    maxIndex,
    currentIndex,
    rotation,
  });

  const isPredictedPreview = previewIndex !== null && previewIndex >= cycleDayCount;
  const preview = previewIndex === null || isPredictedPreview ? null : segments[previewIndex];
  // Which day of the predicted run is under the pointer: nextPeriod + offset.
  const predictedPreviewDate =
    isPredictedPreview && nextDate ? addDays(nextDate, (previewIndex ?? cycleDayCount) - cycleDayCount) : null;
  const centerDay = isPredictedPreview ? (previewIndex ?? 0) + 1 : (preview?.dayNumber ?? forecast.cycleDay);
  const centerStatus = isPredictedPreview ? t("status.periodExpected") : preview ? statusText(preview) : phaseLabel;
  const centerDate = isPredictedPreview ? predictedPreviewDate : preview ? preview.date : today;
  // Screen-reader value: "Day N, <date>, <status>" — the date is dropped when
  // there isn't one, and the pieces are joined with commas in every language.
  const valueText = isPredictedPreview
    ? [
        t("dial.day", { n: (previewIndex ?? 0) + 1 }),
        predictedPreviewDate ? formatShortDate(predictedPreviewDate, locale) : "",
        t("status.periodExpected"),
      ]
        .filter(Boolean)
        .join(", ")
    : preview
      ? [
          t("dial.day", { n: preview.dayNumber }),
          preview.date ? formatShortDate(preview.date, locale) : "",
          statusText(preview),
        ]
          .filter(Boolean)
          .join(", ")
      : [
          t("dial.day", { n: forecast.cycleDay ?? t("common.unknown") }),
          formatShortDate(today, locale),
          phaseLabel,
        ].join(", ");

  return (
    <section aria-label={t("dial.overview")} className="cycle-dial">
      {/* Arrow keys scrub a preview of each day. The value really moves, so
          this is no read-only slider; nothing is saved, and the preview reverts
          on blur/Escape. */}
      <div
        ref={frameRef}
        className={sweeping ? "cycle-dial__frame is-sweeping" : "cycle-dial__frame"}
        role="slider"
        aria-label={t("dial.days")}
        aria-valuemin={1}
        aria-valuemax={maxIndex + 1}
        aria-valuenow={isPredictedPreview ? (previewIndex ?? 0) + 1 : (preview?.dayNumber ?? forecast.cycleDay ?? 1)}
        aria-valuetext={valueText}
        tabIndex={0}
        {...frameProps}
      >
        <div className="cycle-dial__ring" style={dialStyle}>
          <div className="cycle-dial__inner">
            {/* At rest the centre reads in time order: today, a rule, then what
                comes next. While bleeding is logged today leads; otherwise the
                next-period estimate is the headline. */}
            {estimate && previewIndex === null ? (
              <>
                {bleedingToday ? (
                  <strong
                    className="cycle-dial__estimate"
                    style={{ "--chars": headlineChars(nowLine) } as CSSProperties}
                  >
                    {nowLine}
                  </strong>
                ) : (
                  <span className="cycle-dial__phase cycle-dial__phase--small">{nowLine}</span>
                )}
                {bleedingToday ? (
                  // While bleeding, how long it usually lasts beats a date weeks
                  // away. Only a learned length: the fallback's would be a guess.
                  forecast.estimateMode === "learned" ? (
                    <>
                      <span aria-hidden="true" className="cycle-dial__rule" />
                      <span className="cycle-dial__next">
                        {t("dial.usualPeriodLength", { n: forecast.periodLength })}
                      </span>
                    </>
                  ) : null
                ) : (
                  <>
                    <span aria-hidden="true" className="cycle-dial__rule" />
                    <strong
                      className="cycle-dial__estimate"
                      style={{ "--chars": headlineChars(estimate.value) } as CSSProperties}
                    >
                      {estimate.value}
                    </strong>
                    <span className="cycle-dial__date cycle-dial__date--small">{estimate.date}</span>
                  </>
                )}
              </>
            ) : prompt && previewIndex === null ? (
              <span className="cycle-dial__prompt">{prompt}</span>
            ) : (
              <>
                {/* No cycle day yet: no numeral, rather than a "--" placeholder.
                    The learning note under the dial says what to do. */}
                {centerDay === null ? null : (
                  // The label sits beside the numeral, so the numeral is the headline.
                  <span className="cycle-dial__day-row">
                    <span className="cycle-dial__day-label">{t("dial.cycleDay")}</span>
                    <strong className="cycle-dial__day">{centerDay}</strong>
                  </span>
                )}
                <span className="cycle-dial__phase">{centerStatus}</span>
                {centerDate ? <span className="cycle-dial__date">{formatShortDate(centerDate, locale)}</span> : null}
              </>
            )}
          </div>
          {/* Inside the ring so its sweep mask draws them in with the band;
              positioned against the frame, so they still cover the whole disc. */}
          <div className="cycle-dial__estimates" style={estimatesStyle} aria-hidden="true" />
          <div className="cycle-dial__ticks" style={ticksStyle} aria-hidden="true" />
        </div>
        <div className="cycle-dial__marker" style={{ transform: `rotate(${rotation}deg)` }}>
          <span aria-hidden="true" className="cycle-dial__marker-dot" />
          {ripples > 0 ? <span key={ripples} aria-hidden="true" className="cycle-dial__ripple" /> : null}
        </div>
        {ghostAngle === null && settle ? (
          <div
            className={settle.moving ? "cycle-dial__ghost is-settling" : "cycle-dial__ghost"}
            style={{ transform: `rotate(${settle.angle}deg)` }}
            aria-hidden="true"
            onTransitionEnd={endSettle}
          >
            <span className="cycle-dial__ghost-dot" />
          </div>
        ) : null}
        {ghostAngle !== null ? (
          <div className="cycle-dial__ghost" style={{ transform: `rotate(${ghostAngle}deg)` }} aria-hidden="true">
            <span className="cycle-dial__ghost-dot" />
          </div>
        ) : null}
      </div>
      <CycleLegend
        className="cycle-dial__legend"
        // The key only names colours the ring actually shows: no coral dot
        // over an all-grey first-run ring, no periwinkle or amber without an
        // ovulation estimate.
        showPeriod={Object.keys(intensityByDay).length > 0}
        showExpected={hasPrediction}
        showFertility={forecast.ovulationDate !== null}
      />
    </section>
  );
}

// The headline wraps to two balanced lines, so it is sized to a bit over half
// its length, and never below its longest word, which can't break.
function headlineChars(text: string) {
  return Math.max(Math.ceil(text.length * 0.6), ...text.split(/\s+/).map((word) => word.length));
}
