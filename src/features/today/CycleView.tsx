import type { CycleSummary, IsoDate } from "../../domain/types";

interface CycleViewProps {
  summary: CycleSummary;
  periodDays: IsoDate[];
  today: IsoDate;
}

function getCycleStatusLabel(summary: CycleSummary) {
  if (summary.phaseLabel === "ovulation") {
    return "Ovulation likely now";
  }

  if (summary.fertile) {
    return "Fertile window";
  }

  if (summary.phaseLabel === "menstrual") {
    return "Period in progress";
  }

  return "Lower chance of pregnancy";
}

export function CycleView({ summary, periodDays, today }: CycleViewProps) {
  const totalDays = summary.nextPeriod.daysUntil !== null && summary.cycleDay !== null
    ? Math.max(summary.cycleDay + summary.nextPeriod.daysUntil, summary.cycleDay, 28)
    : 28;
  const currentCycleStart = summary.cycleDay !== null ? summary.cycleDay - 1 : null;
  const loggedCycleDays =
    currentCycleStart === null
      ? new Set<number>()
      : new Set(
          periodDays
            .filter((day) => day <= today)
            .map((day) => {
              const value = Math.floor(
                (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
                  (24 * 60 * 60 * 1000)
              );
              return summary.cycleDay! + value;
            })
            .filter((day) => day >= 1 && day <= totalDays)
        );
  const fertileStart =
    summary.cycleDay !== null && summary.ovulationDate && summary.nextPeriod.date
      ? summary.cycleDay + Math.round(
          (Date.parse(`${summary.ovulationDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
            (24 * 60 * 60 * 1000)
        ) - 5
      : null;
  const ovulationDay =
    summary.cycleDay !== null && summary.ovulationDate
      ? summary.cycleDay + Math.round(
          (Date.parse(`${summary.ovulationDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
            (24 * 60 * 60 * 1000)
        )
      : null;

  return (
    <section aria-label="Cycle view" className="cycle-view">
      <div className="cycle-view__summary">
        <span className="cycle-view__eyebrow">{getCycleStatusLabel(summary)}</span>
        <div className="cycle-view__legend">
          <span className="cycle-view__legend-item">
            <span className="cycle-view__dot cycle-view__dot--period" aria-hidden="true" />
            Period
          </span>
          <span className="cycle-view__legend-item">
            <span className="cycle-view__dot cycle-view__dot--fertile" aria-hidden="true" />
            Fertile window
          </span>
          <span className="cycle-view__legend-item">
            <span className="cycle-view__dot cycle-view__dot--ovulation" aria-hidden="true" />
            Ovulation
          </span>
        </div>
      </div>

      <div className="cycle-view__track">
        {Array.from({ length: totalDays }, (_, index) => {
          const dayNumber = index + 1;
          const isCurrent = dayNumber === summary.cycleDay;
          const isLogged = loggedCycleDays.has(dayNumber);
          const isOvulation = ovulationDay === dayNumber;
          const isFertile =
            fertileStart !== null &&
            ovulationDay !== null &&
            dayNumber >= fertileStart &&
            dayNumber <= ovulationDay + 1;
          const className = [
            "cycle-view__segment",
            isLogged ? "is-period" : "",
            isFertile ? "is-fertile" : "",
            isOvulation ? "is-ovulation" : "",
            isCurrent ? "is-current" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={dayNumber}
              className={className}
              aria-label={`Cycle day ${dayNumber}${isCurrent ? ", today" : ""}`}
              title={`Cycle day ${dayNumber}`}
            />
          );
        })}
      </div>

      <div className="cycle-view__labels">
        <span>Day 1</span>
        <span>Day {totalDays}</span>
      </div>
    </section>
  );
}
