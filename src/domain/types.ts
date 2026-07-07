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
  /** Fertile-window day offsets from ovulation; widens with cycle irregularity. */
  fertileWindow: { start: number; end: number };
  nextPeriod: {
    date: IsoDate | null;
    daysUntil: number | null;
  };
  /** Average days between cycle starts; drives the repeating period forecast. */
  cycleLength: number;
  /** Learned length of an expected period run, in days (clamped 3–5). */
  periodLength: number;
  estimateMode: CycleEstimateMode;
}

export interface CycleStats {
  /** Completed cycles observed so far — the history the estimate is built on. */
  cyclesTracked: number;
  /**
   * Standard deviation of recent cycle lengths, in days: how much the cycle
   * varies. Null until at least two cycles exist to compare.
   */
  variabilityDays: number | null;
}

export interface AppSettings {
  /** Day the reminder was dismissed with "Not yet"; suppresses the prompt only
   * while it equals today. Transient UI state — persisted locally, not exported. */
  dismissedOn: IsoDate | null;
  /** Show fertile-window and ovulation estimates on the home screen and calendar. */
  showFertility: boolean;
  /** Number the days of the current cycle (day 1, 2, 3…) on the calendar. */
  showCycleDayNumbers: boolean;
  theme: ThemePreference;
}

export interface AppState {
  /**
   * Flow level per logged day, keyed by ISO date — the single source of truth
   * for which days are logged. A key here IS a logged day, and every logged day
   * carries a flow (a one-tap log defaults to medium). Derive the sorted day
   * list with getPeriodDays().
   */
  intensityByDay: Record<IsoDate, FlowIntensity>;
  settings: AppSettings;
}
