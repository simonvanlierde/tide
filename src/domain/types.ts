import type { LanguagePreference } from "../i18n";

export type { LanguagePreference } from "../i18n";
export type IsoDate = `${number}-${number}-${number}`;
export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  /** Any non-period day while fertility estimates are off. */
  | "between"
  | "unknown";
export type CycleEstimateMode = "learned" | "fallback" | "insufficient";
export type ThemePreference = "system" | "light" | "dark";
export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";
/**
 * What a logged day records: the flow level the user picked, or null when they
 * only said "I bled today". Null is a logged day like any other — it just
 * doesn't claim an intensity nobody entered.
 */
export type LoggedFlow = FlowIntensity | null;

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
  /** Learned length of an expected period run, in days (clamped 2-7). */
  periodLength: number;
  estimateMode: CycleEstimateMode;
}

/** An estimate drawn on one day. */
export type DayEstimate = "fertile" | "ovulation" | "predicted-period";

export interface DayInfo {
  /** Day number within the current cycle (1 on its first day); null outside it. */
  cycleDay: number | null;
  /**
   * The estimate on this day, if any. An expected period wins over the fertile
   * window, and each window's ovulation day wins over its fertile days.
   */
  estimate: DayEstimate | null;
}

/** The cycle summary plus the whole timeline it implies, built once. */
export interface Forecast extends CycleSummary {
  /** First day of the current cycle; null without a live forecast. */
  cycleStart: IsoDate | null;
  /**
   * Last day of the current cycle: the day before the next expected period,
   * or today once that period is overdue. Null without a live forecast.
   */
  cycleEnd: IsoDate | null;
  stats: CycleStats;
  /** What the forecast says about any date, past or future. */
  dayInfo: (date: IsoDate) => DayInfo;
}

export interface CycleStats {
  /** Completed cycles observed so far — the history the estimate is built on. */
  cyclesTracked: number;
  /** The earliest logged cycle start; null with nothing logged. */
  firstCycleStart: IsoDate | null;
  /** The recent completed cycle lengths the estimate uses, oldest first. */
  recentCycleLengths: number[];
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
  /** Show fertile-window and ovulation estimates on the home screen and
   * calendar. null until the user answers the question on Today; estimates
   * stay hidden until then. */
  showFertility: boolean | null;
  /** Number the days of the current cycle (day 1, 2, 3…) on the calendar. */
  showCycleDayNumbers: boolean;
  theme: ThemePreference;
  /** UI language; "system" follows the browser locale. */
  language: LanguagePreference;
}

export interface AppState {
  /**
   * Flow level per logged day, keyed by ISO date — the single source of truth
   * for which days are logged. A key here IS a logged day; a one-tap log stores
   * null (no flow level). Derive the sorted day list with getPeriodDays().
   */
  intensityByDay: Record<IsoDate, LoggedFlow>;
  settings: AppSettings;
}
