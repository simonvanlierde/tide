import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { CycleStats } from "../../domain/types";

interface CycleInsightsProps {
  stats: CycleStats;
  onClose: () => void;
}

// The numbers behind the estimate, plus a plain-language note on how they're
// worked out. A native <dialog> gives us the focus trap, Esc-to-close, and
// backdrop for free. Mounted only while open, so it's shown on mount and a
// native close (Esc, backdrop) unmounts it via onClose.
export function CycleInsights({ stats, onClose }: CycleInsightsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const regularity = getRegularity(stats.variabilityDays);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: backdrop tap-to-dismiss on a modal <dialog>; keyboard close is handled natively by Esc
    // biome-ignore lint/a11y/useKeyWithClickEvents: same — Esc closes the dialog for keyboard users, this click only dismisses on the backdrop
    <dialog
      ref={dialogRef}
      className="insights"
      aria-labelledby="insights-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicks land on the backdrop as the <dialog> element itself.
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="insights__head">
        <h2 id="insights-title" className="insights__title">
          Cycle insights
        </h2>
        <button
          type="button"
          className="insights__close"
          aria-label="Close"
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="insights__stats">
        <Stat value={stats.cycleLength} unit="days" label="Cycle length" />
        <Stat value={stats.periodLength} unit="days" label="Period length" />
        <Stat value={stats.cyclesTracked} label="Cycles tracked" />
      </div>

      {stats.cyclesTracked === 0 ? (
        <p className="insights__note">
          Based on a typical 28-day cycle until you’ve logged a full cycle.
        </p>
      ) : null}

      <div className="insights__regularity">
        <span className="insights__regularity-label">Cycle regularity</span>
        <span
          className="insights__meter"
          role="img"
          aria-label={`Cycle regularity: ${regularity.label}`}
        >
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className="insights__meter-seg"
              data-filled={step <= regularity.level}
            />
          ))}
        </span>
        <span className="insights__regularity-word">{regularity.label}</span>
      </div>

      <details className="insights__how">
        <summary className="insights__how-summary">
          How predictions work
        </summary>
        <ul className="insights__how-list">
          <li>
            Everything is worked out on your device from the days you log.
          </li>
          <li>
            Cycle length is the median of your last {6} cycles, so one odd month
            doesn’t throw it off. Before two cycles, a typical 28-day cycle is
            used.
          </li>
          <li>
            Period length is your recent average, kept to a normal 2–7 days.
          </li>
          <li>
            Your next period is your last start plus that cycle length;
            ovulation is estimated 14 days before it.
          </li>
          <li>
            The fertile window runs 5 days before to 1 day after ovulation, and
            widens when your cycles vary more.
          </li>
        </ul>
      </details>
    </dialog>
  );
}

interface StatProps {
  value: number;
  label: string;
  unit?: string;
}

function Stat({ value, label, unit }: StatProps) {
  return (
    <div className="insights__stat">
      <span className="insights__stat-value">{value}</span>
      {unit ? <span className="insights__stat-unit">{unit}</span> : null}
      <span className="insights__stat-label">{label}</span>
    </div>
  );
}

// Map cycle-length spread (standard deviation, in days) to a 0–4 meter and a
// word. Null means fewer than two cycles — nothing to compare yet.
function getRegularity(variabilityDays: number | null) {
  if (variabilityDays === null) {
    return { level: 0, label: "Not enough data yet" };
  }
  if (variabilityDays <= 1) {
    return { level: 4, label: "Very regular" };
  }
  if (variabilityDays <= 2) {
    return { level: 3, label: "Regular" };
  }
  if (variabilityDays <= 4) {
    return { level: 2, label: "Somewhat variable" };
  }
  return { level: 1, label: "Variable" };
}
