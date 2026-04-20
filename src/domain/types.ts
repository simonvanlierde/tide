export type IsoDate = `${number}-${number}-${number}`;
export type HomeDisplayMode = "summary" | "linear" | "circular";

export interface HomeCardsSettings {
  showNextPeriodCard: boolean;
  showPhaseCard: boolean;
  showFertilityCard: boolean;
}

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
  homeDisplayMode: HomeDisplayMode;
  homeCards: HomeCardsSettings;
}

export interface AppState {
  periodDays: IsoDate[];
  settings: AppSettings;
}
