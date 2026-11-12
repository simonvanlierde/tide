import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Forecast, IsoDate, LoggedFlow } from "../../domain/types";
import { useLocale, useT } from "../../state/provider";
import { addDays, formatShortDate } from "../../utils/date";
import { CycleLegend } from "./CycleLegend";
import { buildCycleSegments, type CycleSegment, getSegmentStatus } from "./CycleView";
import { ARC_START_DEG, ARC_SWEEP_DEG, dayAngleDeg, dayIndexFromPoint, pointerAngleDeg } from "./dialGeometry";

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
const prefersMotion = () =>
  typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function firstViewToday(today: IsoDate) {
  if (!prefersMotion() || sweptOn === today) return false;
  sweptOn = today;
  return true;
}

// Day-boundary tick, drawn on its own masked layer near the outer rim (see
// .cycle-dial__ticks) so it reads as a little mark, not a line crossing the
// whole ring.
const TICK_DEG = 0.8;
const TICK_COLOR = "color-mix(in srgb, var(--ink) 16%, transparent)";
// The expected period is an estimate, drawn like the fertile window: an
// outline (see .cycle-dial__estimates) that dissolves toward the top seam.
const PREDICTED_FADE_DEG = 16; // how far the expected outline tapers toward the top
const PREDICTED_TAIL_STEP = 1.25; // tail length past the arc, in day-widths
// How many day-widths the expected-period nub occupies. A period runs longer
// than this, but the dial only hints at the next start — a fuller run would eat
// too much of the ring — so it shows a compact 1.5-day forecast, not periodLength.
const PREDICTED_SPAN_DAYS = 1.5;
// Neighbouring phase colors blend over a couple degrees instead of hard-cutting.
const BLEND_DEG = 1.4;
// The seam fade: day 1 fades in from the top gap, and with no predicted period
// the last logged day fades out into it.
const FADE_DEG = 8;

// Estimated days fill the same band with a wash of their colour, so the ring
// stays one band; the rails from estimateColor mark them as estimates.
// The filled ring: logged days in their flow colour, the idle stretch, and a
// wash under each estimate.
function phaseColor(segment: CycleSegment) {
  // isPeriod first: a day logged without a level still belongs to the period
  // arc, in base coral, rather than falling through to fertile or idle.
  if (segment.isPeriod) {
    return segment.flow ? `var(--flow-${segment.flow})` : "var(--bleed)";
  }
  return segment.isOvulation
    ? "var(--dial-wash-ovulation)"
    : segment.isFertile
      ? "var(--dial-wash-fertile)"
      : "var(--cycle-idle)";
}

function estimateColor(segment: CycleSegment) {
  if (segment.isPeriod) {
    return "transparent";
  }
  return segment.isOvulation
    ? "var(--estimate-ovulation)"
    : segment.isFertile
      ? "var(--estimate-fertile)"
      : "transparent";
}

// The angular window over which the predicted period fades out toward the top.
// Shared by the expected outline and the day ticks so they dissolve together.
function predictedFade(total: number) {
  const step = ARC_SWEEP_DEG / total;
  const tailEnd = ARC_SWEEP_DEG + PREDICTED_TAIL_STEP * step;
  const fadeStart = Math.max(tailEnd - PREDICTED_FADE_DEG, step * (total - 1));
  return { fadeStart, tailEnd };
}

function ringStyle(
  segments: CycleSegment[],
  predictedCount: number,
  color: (segment: CycleSegment) => string,
  predictedColor: string,
) {
  const total = segments.length + predictedCount;
  const step = ARC_SWEEP_DEG / total;
  const stops: string[] = [];
  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1;
    // Day 1 fades in from the gap; interior boundaries blend a touch.
    const start = i === 0 ? FADE_DEG : step * i + BLEND_DEG;
    let end = step * (i + 1) - BLEND_DEG;
    // The last logged day fades out into the gap only when no predicted period
    // follows to carry the ring onward.
    if (isLast && predictedCount === 0) {
      end = step * (i + 1) - FADE_DEG;
    }
    stops.push(`${color(segment)} ${start}deg ${end}deg`);
  });
  if (predictedCount > 0) {
    // The predicted days, tapering out toward the top.
    const { fadeStart, tailEnd } = predictedFade(total);
    const cellStart = step * segments.length + BLEND_DEG;
    stops.push(`${predictedColor} ${cellStart}deg ${Math.max(fadeStart, cellStart)}deg`);
    stops.push(`transparent ${tailEnd}deg 360deg`);
  } else {
    stops.push(`transparent ${ARC_SWEEP_DEG}deg 360deg`);
  }

  return {
    background: `conic-gradient(from ${ARC_START_DEG}deg, ${stops.join(", ")})`,
  };
}

// Little ticks at every day boundary, on a layer masked to a thin band at the
// outer rim. Through the predicted period they carry on up toward the top,
// fading out in step with the ghosted coral fill.
function getTicksStyle(total: number, predictedCount: number) {
  const step = ARC_SWEEP_DEG / total;
  const fade = predictedCount > 0 ? predictedFade(total) : null;
  const lastBoundary = fade ? 360 : ARC_SWEEP_DEG + TICK_DEG;
  const stops = ["transparent 0deg"];
  for (let i = 1; step * i < lastBoundary; i += 1) {
    const boundary = step * i;
    const alpha =
      fade && boundary > fade.fadeStart ? Math.max(0, (fade.tailEnd - boundary) / (fade.tailEnd - fade.fadeStart)) : 1;
    if (alpha <= 0) {
      continue;
    }
    const color =
      alpha >= 1 ? TICK_COLOR : `color-mix(in srgb, ${TICK_COLOR} ${Math.round(alpha * 100)}%, transparent)`;
    stops.push(
      `transparent ${boundary - TICK_DEG / 2}deg`,
      `${color} ${boundary - TICK_DEG / 2}deg`,
      `${color} ${boundary + TICK_DEG / 2}deg`,
      `transparent ${boundary + TICK_DEG / 2}deg`,
    );
  }
  stops.push("transparent 360deg");
  return {
    background: `conic-gradient(from ${ARC_START_DEG}deg, ${stops.join(", ")})`,
  };
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
  const frameRef = useRef<HTMLDivElement>(null);
  // The cycle day being previewed while scrubbing (null: the live view) and
  // the exact pointer angle, so the ghost dot tracks the finger rather than
  // snapping to the day centre (null for keyboard previews). One state object:
  // a pointermove updates both in a single render.
  const [previewState, setPreviewState] = useState<{
    index: number | null;
    angle: number | null;
  }>({ index: null, angle: null });
  const previewIndex = previewState.index;
  const previewAngle = previewState.angle;
  // The ring's geometry is constant for the length of a drag; measure once on
  // pointerdown instead of forcing layout on every move.
  const dragRect = useRef<DOMRect | null>(null);
  const [sweeping] = useState(() => firstViewToday(today));
  // After a scrub the ghost glides from the finger back to today: the angle it
  // starts from, then (moving) today's angle with a CSS transition.
  const [settle, setSettle] = useState<{ angle: number; moving: boolean } | null>(null);

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

  // Ghost marker under the pointer: free-follows the finger while scrubbing,
  // otherwise sits on the previewed day (keyboard).
  const ghostAngle = previewIndex === null ? null : (previewAngle ?? dayAngleDeg(previewIndex, totalCells));

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

  function updatePreview(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRect.current) {
      dragRect.current = frameRef.current?.getBoundingClientRect() ?? null;
    }
    const rect = dragRect.current;
    if (rect) {
      const index = Math.min(dayIndexFromPoint(event.clientX, event.clientY, rect, totalCells), maxIndex);
      // The ghost free-follows the finger everywhere. On day 1 (against the top
      // seam) it's floored to the cell centre so it can't perch on the seam —
      // but only on the left side: past the centre it free-follows again, so the
      // day 1↔2 border stays scrubbable.
      const angle = pointerAngleDeg(event.clientX, event.clientY, rect);
      const day1Centre = dayAngleDeg(0, totalCells);
      setPreviewState({
        index,
        angle: index === 0 ? Math.max(angle, day1Centre) : angle,
      });
    }
  }

  function clearPreview() {
    dragRect.current = null;
    setPreviewState({ index: null, angle: null });
  }

  function releasePreview() {
    const from = ghostAngle;
    clearPreview();
    if (from !== null && currentIndex >= 0 && prefersMotion()) setSettle({ angle: from, moving: false });
  }

  useEffect(() => {
    if (settle && !settle.moving) {
      const frame = requestAnimationFrame(() => setSettle({ angle: rotation, moving: true }));
      return () => cancelAnimationFrame(frame);
    }
  }, [settle, rotation]);

  function stepPreview(step: number) {
    setPreviewState(({ index }) => {
      const from = typeof index === "number" ? index : Math.max(currentIndex, 0);
      return {
        index: Math.min(Math.max(from + step, 0), maxIndex),
        angle: null,
      };
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      stepPreview(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      stepPreview(-1);
    } else if (event.key === "Escape") {
      clearPreview();
    }
  }

  return (
    <section aria-label={t("dial.overview")} className="cycle-dial">
      {/* Arrow keys scrub a preview of each day; nothing is set, so the
          slider is read-only and the preview reverts on blur/Escape. */}
      <div
        ref={frameRef}
        className={sweeping ? "cycle-dial__frame is-sweeping" : "cycle-dial__frame"}
        role="slider"
        aria-label={t("dial.days")}
        aria-readonly="true"
        aria-valuemin={1}
        aria-valuemax={maxIndex + 1}
        aria-valuenow={isPredictedPreview ? (previewIndex ?? 0) + 1 : (preview?.dayNumber ?? forecast.cycleDay ?? 1)}
        aria-valuetext={valueText}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRect.current = event.currentTarget.getBoundingClientRect();
          updatePreview(event);
        }}
        onPointerMove={(event) => {
          // Only a pressed pointer scrubs; a stray mouse pass shouldn't
          // rewrite the screen's headline number.
          if (event.buttons > 0) {
            updatePreview(event);
          }
        }}
        onPointerUp={releasePreview}
        onPointerLeave={releasePreview}
        onPointerCancel={clearPreview}
        onKeyDown={handleKeyDown}
        onBlur={clearPreview}
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
        </div>
        <div className="cycle-dial__estimates" style={estimatesStyle} aria-hidden="true" />
        <div className="cycle-dial__ticks" style={ticksStyle} aria-hidden="true" />
        <div className="cycle-dial__marker" style={{ transform: `rotate(${rotation}deg)` }}>
          <span aria-hidden="true" className="cycle-dial__marker-dot" />
          {ripples > 0 ? <span key={ripples} aria-hidden="true" className="cycle-dial__ripple" /> : null}
        </div>
        {ghostAngle === null && settle ? (
          <div
            className={settle.moving ? "cycle-dial__ghost is-settling" : "cycle-dial__ghost"}
            style={{ transform: `rotate(${settle.angle}deg)` }}
            aria-hidden="true"
            onTransitionEnd={() => setSettle(null)}
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
