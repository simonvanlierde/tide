import { FLOW_INTENSITIES } from "../domain/flow";
import type { IsoDate, LoggedFlow } from "../domain/types";
import { addDays } from "../utils/date";
import { isIsoDate, normalizeIntensityByDay } from "./schema";

// History exported by another tracker. Loaded on demand from the import path,
// so the main bundle never carries it.
//
// Most shapes below come from published format notes and other converters;
// Clue's measurements.json has been checked against a few real exports, which
// held only bare dates and {option} period values. So every reader is lenient:
// unknown fields and types are skipped, invalid dates are dropped, and odd
// input yields nothing rather than throwing.

export type OtherAppSource = "Clue" | "Flo";

export interface OtherAppImport {
  source: OtherAppSource;
  days: Record<IsoDate, LoggedFlow>;
}

// The longest Flo period read. Without a cap, a runaway end date (a typo, a
// missing log) would paint weeks of bleeding.
const MAX_FLO_PERIOD_DAYS = 15;

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  !!value && typeof value === "object" && !Array.isArray(value);

// Clue's flow words onto Tide's levels. "very_heavy" has no Tide level above
// heavy. An unknown word still marks a bleeding day, with no level claimed,
// but "none" (said by other converters to mean "not bleeding") marks nothing.
function clueFlow(option: unknown): LoggedFlow | undefined {
  if (option === "none") {
    return undefined;
  }
  if (option === "very_heavy") {
    return "heavy";
  }
  return FLOW_INTENSITIES.includes(option as never)
    ? (option as LoggedFlow)
    : null;
}

// Several entries can name one day (a period and a spotting record, or a
// duplicate): keep the heaviest, with spotting below a plain log.
const rank = (flow: LoggedFlow) =>
  flow === null ? 0.5 : FLOW_INTENSITIES.indexOf(flow);

function addDay(
  days: Record<string, LoggedFlow>,
  day: unknown,
  flow: LoggedFlow | undefined,
) {
  if (typeof day !== "string" || flow === undefined) {
    return;
  }
  const key = day.slice(0, 10);
  if (!(key in days) || rank(flow) > rank(days[key] ?? null)) {
    days[key] = flow;
  }
}

// Current Clue export: measurements.json, a flat array of dated measurements.
function readClueMeasurements(entries: unknown[]) {
  const days: Record<string, LoggedFlow> = {};
  for (const entry of entries) {
    if (!isObject(entry)) {
      continue;
    }
    if (entry.type === "period") {
      const value = entry.value;
      addDay(
        days,
        entry.date,
        clueFlow(isObject(value) ? value.option : value),
      );
    } else if (entry.type === "spotting") {
      addDay(days, entry.date, "spotting");
    }
  }
  return days;
}

// Legacy Clue backup (.cluedata): { data: [{ day, period, ... }] }.
function readClueLegacy(entries: unknown[]) {
  const days: Record<string, LoggedFlow> = {};
  for (const entry of entries) {
    if (isObject(entry) && typeof entry.period === "string") {
      addDay(days, entry.day, clueFlow(entry.period));
    }
  }
  return days;
}

// Flo's flow scale in period_intensity: 1 light, 2 medium, 3 heavy.
const FLO_FLOW: Record<string, LoggedFlow> = {
  1: "light",
  2: "medium",
  3: "heavy",
};

// period_intensity is a JSON object stored as a string, mapping a day's
// zero-based position in the period to its flow. Unreadable gives no levels.
function floIntensity(value: unknown): Record<string, unknown> {
  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : {};
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// Flo: operationalData.cycles[] with a start and end date per period. The
// date part of Flo's timestamps is the user's own calendar day. A day with no
// flow in period_intensity is a plain log.
function readFloCycles(cycles: unknown[]) {
  const days: Record<string, LoggedFlow> = {};
  const date = (value: unknown) => {
    const day = typeof value === "string" ? value.slice(0, 10) : null;
    return isIsoDate(day) ? day : null;
  };
  for (const cycle of cycles) {
    if (!isObject(cycle)) {
      continue;
    }
    const start = date(cycle.period_start_date);
    if (!start) {
      continue;
    }
    const cap = addDays(start, MAX_FLO_PERIOD_DAYS - 1);
    let end = date(cycle.period_end_date) ?? start;
    end = end < start ? start : end > cap ? cap : end;
    const intensity = floIntensity(cycle.period_intensity);
    for (let day = start, i = 0; day <= end; day = addDays(day, 1), i++) {
      days[day] = FLO_FLOW[String(intensity[i])] ?? null;
    }
  }
  return days;
}

// Recognise the file by its shape and read its bleeding days. Returns null for
// anything that is not a Clue or Flo export, or one with no days in it.
export function parseOtherAppExport(
  text: string,
  today: IsoDate,
): OtherAppImport | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  let source: OtherAppSource;
  let raw: Record<string, LoggedFlow>;
  if (Array.isArray(parsed)) {
    source = "Clue";
    raw = readClueMeasurements(parsed);
  } else if (isObject(parsed) && Array.isArray(parsed.data)) {
    source = "Clue";
    raw = readClueLegacy(parsed.data);
  } else if (
    isObject(parsed) &&
    isObject(parsed.operationalData) &&
    Array.isArray(parsed.operationalData.cycles)
  ) {
    source = "Flo";
    raw = readFloCycles(parsed.operationalData.cycles);
  } else {
    return null;
  }

  // The schema drops impossible dates ("2023-02-30") and any stray key. A
  // future day is dropped too: Tide never logs one.
  const days = Object.fromEntries(
    Object.entries(normalizeIntensityByDay(raw)).filter(
      ([day]) => day <= today,
    ),
  );
  return Object.keys(days).length > 0 ? { source, days } : null;
}
