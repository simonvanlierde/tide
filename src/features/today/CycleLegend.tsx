import { useT } from "../../state/provider";

interface CycleLegendProps {
  className: string;
  showPeriod: boolean;
  showExpected: boolean;
  showFertility: boolean;
}

export function CycleLegend({
  className,
  showPeriod,
  showExpected,
  showFertility,
}: CycleLegendProps) {
  const t = useT();
  if (!showPeriod && !showExpected && !showFertility) {
    return null;
  }
  return (
    <div className={className}>
      {showPeriod ? (
        <span className="cycle-view__legend-item">
          <span
            className="cycle-view__dot cycle-view__dot--period"
            aria-hidden="true"
          />
          {t("legend.period")}
        </span>
      ) : null}
      {showExpected ? (
        <span className="cycle-view__legend-item">
          <span
            className="cycle-view__dot cycle-view__dot--expected"
            aria-hidden="true"
          />
          {t("legend.expected")}
        </span>
      ) : null}
      {showFertility ? (
        <>
          <span className="cycle-view__legend-item">
            <span
              className="cycle-view__dot cycle-view__dot--fertile"
              aria-hidden="true"
            />
            {t("legend.fertileWindow")}
          </span>
          <span className="cycle-view__legend-item">
            <span
              className="cycle-view__dot cycle-view__dot--ovulation"
              aria-hidden="true"
            />
            {t("legend.ovulation")}
          </span>
        </>
      ) : null}
    </div>
  );
}
