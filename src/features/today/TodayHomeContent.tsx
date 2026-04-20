import type { CycleSummary, HomeDisplayMode, IsoDate } from "../../domain/types";
import { AppIcon, Info } from "../../ui/icons";
import { CircularCycleView } from "./CircularCycleView";
import { LinearCycleView } from "./CycleView";

interface TodayHomeContentProps {
  displayMode: HomeDisplayMode;
  summary: CycleSummary;
  periodDays: IsoDate[];
  today: IsoDate;
  nextPeriodSummary: string;
  fertilityEstimate: string;
  fertilityDisclaimer: string;
}

export function TodayHomeContent({
  displayMode,
  summary,
  periodDays,
  today,
  nextPeriodSummary,
  fertilityEstimate,
  fertilityDisclaimer,
}: TodayHomeContentProps) {
  if (displayMode === "linear") {
    return (
      <LinearCycleView summary={summary} periodDays={periodDays} today={today} />
    );
  }

  if (displayMode === "circular") {
    return (
      <CircularCycleView summary={summary} periodDays={periodDays} today={today} />
    );
  }

  return (
    <section className="today-summary" aria-label="Cycle summary">
      <article className="summary-card summary-card--primary">
        <p className="summary-card__label">Next period</p>
        <p className="summary-card__value">{nextPeriodSummary}</p>
      </article>

      <div className="summary-chip-row">
        <article className="summary-chip">
          <p className="summary-chip__label">Phase</p>
          <p className="summary-chip__value">
            {summary.phaseLabel === "unknown" ? "Learning" : summary.phaseLabel}
          </p>
        </article>

        <article className="summary-chip summary-chip--with-action">
          <div>
            <p className="summary-chip__label">Fertility</p>
            <p className="summary-chip__value">{fertilityEstimate}</p>
          </div>
          <details className="info-popover">
            <summary
              className="info-popover__trigger"
              aria-label="Show fertility disclaimer"
            >
              <AppIcon icon={Info} className="info-popover__icon" />
            </summary>
            <div className="info-popover__content" role="note">
              {fertilityDisclaimer}
            </div>
          </details>
        </article>
      </div>
    </section>
  );
}
