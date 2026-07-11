import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_LUTEAL_LENGTH,
  FERTILE_WINDOW_END,
  FERTILE_WINDOW_START,
  MAX_PERIOD_LENGTH,
  MIN_PERIOD_LENGTH,
  RECENT_CYCLE_WINDOW,
} from "../../domain/cycle";
import type { CycleStats, CycleSummary } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { useT } from "../../state/provider";

interface CycleInsightsProps {
  summary: CycleSummary;
  stats: CycleStats;
  onClose: () => void;
}

// The numbers behind the estimate, plus a plain-language note on how they're
// worked out. A native <dialog> gives us the focus trap, Esc-to-close, and
// backdrop for free. Mounted only while open, so it's shown on mount and a
// native close (Esc, backdrop) unmounts it via onClose.
export function CycleInsights({ summary, stats, onClose }: CycleInsightsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useT();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const regularity = getRegularity(stats.variabilityDays);
  const regularityLabel = t(regularity.labelKey);

  // Close through the native dialog so the browser restores focus to the trigger
  // before onClose unmounts us. Unmounting an open <dialog> directly (Esc aside)
  // skips that focus restoration, stranding keyboard users on <body>.
  const requestClose = () => dialogRef.current?.close();

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
          requestClose();
        }
      }}
    >
      <div className="insights__head">
        <h2 id="insights-title" className="insights__title">
          {t("insights.title")}
        </h2>
        <button
          type="button"
          className="insights__close"
          aria-label={t("common.close")}
          onClick={requestClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="insights__stats">
        <Stat
          value={summary.cycleLength}
          unit={t("common.days")}
          label={t("insights.cycleLength")}
        />
        <Stat
          value={summary.periodLength}
          unit={t("common.days")}
          label={t("insights.periodLength")}
        />
        <Stat value={stats.cyclesTracked} label={t("insights.cyclesTracked")} />
      </div>

      {stats.cyclesTracked === 0 ? (
        <p className="insights__note">
          {t("insights.basedOn", { cycle: DEFAULT_CYCLE_LENGTH })}
        </p>
      ) : null}

      <div className="insights__regularity">
        <span className="insights__regularity-label">
          {t("insights.regularity")}
        </span>
        <span
          className="insights__meter"
          role="img"
          aria-label={t("insights.regularityAria", { label: regularityLabel })}
        >
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className="insights__meter-seg"
              data-filled={step <= regularity.level}
            />
          ))}
        </span>
        <span className="insights__regularity-word">{regularityLabel}</span>
      </div>

      <details className="insights__how">
        <summary className="insights__how-summary">{t("insights.how")}</summary>
        <ul className="insights__how-list">
          <li>{t("insights.how1")}</li>
          <li>
            {t("insights.how2", {
              recent: RECENT_CYCLE_WINDOW,
              cycle: DEFAULT_CYCLE_LENGTH,
            })}
          </li>
          <li>
            {t("insights.how3", {
              min: MIN_PERIOD_LENGTH,
              max: MAX_PERIOD_LENGTH,
            })}
          </li>
          <li>{t("insights.how4", { luteal: DEFAULT_LUTEAL_LENGTH })}</li>
          <li>
            {t("insights.how5", {
              before: Math.abs(FERTILE_WINDOW_START),
              after: FERTILE_WINDOW_END,
            })}
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
function getRegularity(variabilityDays: number | null): {
  level: number;
  labelKey: MessageKey;
} {
  if (variabilityDays === null) {
    return { level: 0, labelKey: "regularity.none" };
  }
  if (variabilityDays <= 1) {
    return { level: 4, labelKey: "regularity.veryRegular" };
  }
  if (variabilityDays <= 2) {
    return { level: 3, labelKey: "regularity.regular" };
  }
  if (variabilityDays <= 4) {
    return { level: 2, labelKey: "regularity.somewhatVariable" };
  }
  return { level: 1, labelKey: "regularity.variable" };
}
