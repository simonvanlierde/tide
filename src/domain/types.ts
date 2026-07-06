export type IsoDate = `${number}-${number}-${number}`;
export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "unknown";
export type CycleEstimateMode = "learned" | "fallback" | "insufficient";
export type ThemePreference = "system" | "light" | "dark";
export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";

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
  /** Number each logged bleeding day within its period (day 1, 2, 3…) on the calendar. */
  showPeriodDayNumbers: boolean;
  theme: ThemePreference;
}

export interface AppState {
  periodDays: IsoDate[];
  /**
   * Flow level per logged day. Sparse: days logged before this feature (or with
   * a plain one-tap log) are absent and render at the default level. Keys are
   * pruned to `periodDays`, so a key here is always a logged day.
   */
  intensityByDay: Record<IsoDate, FlowIntensity>;
  settings: AppSettings;
}
