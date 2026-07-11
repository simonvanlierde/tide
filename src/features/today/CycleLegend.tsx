import { useT } from "../../state/provider";

interface CycleLegendProps {
  className: string;
  showFertility: boolean;
}

export function CycleLegend({ className, showFertility }: CycleLegendProps) {
  const t = useT();
  return (
    <div className={className}>
      <span className="cycle-view__legend-item">
        <span
          className="cycle-view__dot cycle-view__dot--period"
          aria-hidden="true"
        />
        {t("legend.period")}
      </span>
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
