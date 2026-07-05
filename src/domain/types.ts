export type IsoDate = `${number}-${number}-${number}`;
export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "unknown";
export type CycleEstimateMode = "learned" | "fallback" | "insufficient";
export type ThemePreference = "system" | "light" | "dark";

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
  /** Day the reminder was dismissed with "Not yet"; hidden while it equals today. */
  dismissedFor: IsoDate | null;
  /** Show fertile-window and ovulation estimates on the home screen and calendar. */
  showFertility: boolean;
  theme: ThemePreference;
}

export interface AppState {
  periodDays: IsoDate[];
  settings: AppSettings;
}
