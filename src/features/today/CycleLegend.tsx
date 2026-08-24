import { useT } from "../../state/provider";

interface CycleLegendProps {
  className: string;
  showPeriod: boolean;
  showFertility: boolean;
}

export function CycleLegend({
  className,
  showPeriod,
  showFertility,
}: CycleLegendProps) {
  const t = useT();
  if (!showPeriod && !showFertility) {
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
