export type IsoDate = `${number}-${number}-${number}`;
export type HomeDisplayMode = "summary" | "linear" | "circular";
export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "unknown";
export type CycleEstimateMode = "learned" | "fallback" | "insufficient";

export interface CycleSummary {
  cycleDay: number | null;
  phaseLabel: CyclePhase;
  fertile: boolean;
  ovulationDate: IsoDate | null;
  nextPeriod: {
    date: IsoDate | null;
    daysUntil: number | null;
  };
  estimateMode: CycleEstimateMode;
}

export interface AppSettings {
  reminderWindowDays: number;
  snoozedUntil: IsoDate | null;
  homeDisplayMode: HomeDisplayMode;
}

export interface AppState {
  periodDays: IsoDate[];
  settings: AppSettings;
}
