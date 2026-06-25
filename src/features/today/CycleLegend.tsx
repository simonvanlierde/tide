interface CycleLegendProps {
  className: string;
}

export function CycleLegend({ className }: CycleLegendProps) {
  return (
    <div className={className}>
      <span className="cycle-view__legend-item">
        <span
          className="cycle-view__dot cycle-view__dot--period"
          aria-hidden="true"
        />
        Period
      </span>
      <span className="cycle-view__legend-item">
        <span
          className="cycle-view__dot cycle-view__dot--fertile"
          aria-hidden="true"
        />
        Fertile window
      </span>
      <span className="cycle-view__legend-item">
        <span
          className="cycle-view__dot cycle-view__dot--ovulation"
          aria-hidden="true"
        />
        Ovulation
      </span>
    </div>
  );
}
