export type IsoDate = `${number}-${number}-${number}`;
export type HomeLayoutMode = "simple" | "linear" | "circular";

export interface CycleSummary {
  cycleDay: number | null;
  phaseLabel: "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";
  fertile: boolean;
  ovulationDate: IsoDate | null;
  nextPeriod: {
    date: IsoDate | null;
    daysUntil: number | null;
  };
  estimateMode: "learned" | "fallback" | "insufficient";
}

export interface AppSettings {
  reminderWindowDays: number;
  snoozedUntil: IsoDate | null;
  homeLayoutMode: HomeLayoutMode;
  showPhaseChip: boolean;
  showFertilityChip: boolean;
}

export interface AppState {
  periodDays: IsoDate[];
  settings: AppSettings;
}
