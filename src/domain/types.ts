export type IsoDate = `${number}-${number}-${number}`;
export type HomeDisplayMode = "summary" | "linear" | "circular";

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
}

export interface AppState {
  periodDays: IsoDate[];
  settings: AppSettings;
}

export interface PersistedAppStateV1 {
  version: 1;
  state: AppState;
}

export interface BackupPayloadV1 {
  version: 1;
  state: AppState;
}
