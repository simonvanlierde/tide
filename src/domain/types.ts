export type IsoDate = `${number}-${number}-${number}`;

export interface CycleSummary {
  cycleDay: number | null;
  phaseLabel: "period" | "follicular" | "ovulatory" | "luteal" | "unknown";
  fertile: boolean;
  ovulationDate: IsoDate | null;
  nextPeriod: {
    date: IsoDate | null;
    daysUntil: number | null;
  };
}
