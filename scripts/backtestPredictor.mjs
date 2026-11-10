// Backtest the next-period prediction against real cycle histories.
// Downloads the Utah Creighton Model dataset (CC BY-NC 3.0, not committed),
// checks its hash, then walks each woman's cycles forward through the app's own
// forecast. Results and limits: docs/backtest.md.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { runnerImport } from "vite";

const DATA_URL = "https://hive.utah.edu/records/3zhb1-48n69/files/CrMcyclelength_share.csv?download=1";
const DATA_SHA256 =
  // biome-ignore lint/security/noSecrets: a file checksum, not a secret
  "ad67a3eed731a038d6502a1eb42a9dcddf8f6c69a607a61b85f3798198043dac";
const BOM = /^\uFEFF/;
const LINE_BREAK = /\r?\n/;
const CACHE = new URL("../.cache/backtest/CrMcyclelength_share.csv", import.meta.url);

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadCsv() {
  let bytes;
  try {
    bytes = await readFile(CACHE);
  } catch {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`download failed: HTTP ${response.status}`);
    }
    bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(new URL(".", CACHE), { recursive: true });
    await writeFile(CACHE, bytes);
  }
  const hash = createHash("sha256").update(bytes).digest("hex");
  check(hash === DATA_SHA256, `dataset hash mismatch, delete ${CACHE.pathname}`);
  return bytes.toString("utf8").replace(BOM, "");
}

// Dates are m/d/yy; the cohorts span 1990-2013, so yy < 50 is 20yy.
function toIso(value) {
  const [month, day, year] = value.split("/").map(Number);
  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  return `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// One array of cycles per unbroken stretch of a woman's record. The file skips
// cycle numbers in places (186 gaps); a gap would read as one very long cycle,
// so each stretch is backtested as its own history.
function parseStretches(csv) {
  const stretches = [];
  let previous;
  for (const line of csv.trim().split(LINE_BREAK).slice(1)) {
    const [id, , number, start, , length] = line.split(",");
    const cycle = {
      id,
      number: Number(number),
      start: toIso(start),
      length: length ? Number(length) : null,
    };
    if (previous?.id !== id || cycle.number !== previous.number + 1) {
      stretches.push([]);
    }
    stretches.at(-1).push(cycle);
    previous = cycle;
  }
  return stretches;
}

const { module: cycle } = await runnerImport("/src/domain/cycle.ts", {
  configFile: false,
});
const { module: date } = await runnerImport("/src/utils/date.ts", {
  configFile: false,
});
const { forecast, getCompletedCycleLengths, DEFAULT_CYCLE_LENGTH } = cycle;
const { addDays, differenceInDays } = date;

const stretches = parseStretches(await loadCsv());
const women = new Set(stretches.map((s) => s[0].id)).size;
check(women === 581 && stretches.flat().length === 3324, "unexpected row count");

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return DEFAULT_CYCLE_LENGTH;
  return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2;
}

function mean(values) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : DEFAULT_CYCLE_LENGTH;
}

// median6 is the app's current rule. The tide === median6 check below pins the
// docs/backtest.md result to it: the script stops once the predictor changes.
// Every estimator receives only earlier completed cycles.
const estimators = {
  median6: (history) => median(history.slice(-6)),
  median3: (history) => median(history.slice(-3)),
  median12: (history) => median(history.slice(-12)),
  medianAll: (history) => median(history),
  mean6: (history) => mean(history.slice(-6)),
  trimmed6: (history) => {
    const recent = history.slice(-6).sort((a, b) => a - b);
    return mean(recent.length >= 4 ? recent.slice(1, -1) : recent);
  },
  prior28: (history) => median([...history.slice(-6), DEFAULT_CYCLE_LENGTH]),
};

check(
  Object.values(estimators).every((estimate) => estimate([]) === 28),
  "empty-history estimate changed",
);
check(estimators.median6([27, 28, 45, 28, 29]) === 28, "frozen median lost outlier resistance");
check(estimators.median6([40, 27, 30, 28, 29, 31, 26]) === 28.5, "frozen window changed");
check(estimators.prior28([40]) === 34 && estimators.prior28([40, 40]) === 40, "prior weighting changed");

// A participant's separate stretches must never straddle the two groups.
const isHoldout = (id) => createHash("sha256").update(id).digest()[0] < 51;

// Each record: errors in days (predicted minus actual start) and how many
// completed cycles the app had learned from when it predicted.
const records = [];
for (const stretch of stretches) {
  for (let k = 0; k < stretch.length; k++) {
    const current = stretch[k];
    if (current.length === null) {
      continue; // conception cycle: no next period to predict
    }
    // The data has start dates only, so each period is logged as its first day.
    const periodDays = stretch.slice(0, k + 1).map((c) => c.start);
    const summary = forecast({
      today: current.start,
      periodDays,
      fertility: false,
    });
    const actual = addDays(current.start, current.length);
    const lastLength = stretch[k - 1]?.length ?? DEFAULT_CYCLE_LENGTH;
    const history = getCompletedCycleLengths(periodDays);
    records.push({
      holdout: isHoldout(current.id),
      irregular: (summary.stats.variabilityDays ?? 0) >= 5,
      previousLength: history.at(-1) ?? null,
      history: k,
      ...Object.fromEntries(
        Object.entries(estimators).map(([name, estimate]) => [name, Math.round(estimate(history)) - current.length]),
      ),
      tide: differenceInDays(summary.nextPeriod.date, actual),
      fixed28: differenceInDays(addDays(current.start, 28), actual),
      lastCycle: differenceInDays(addDays(current.start, lastLength), actual),
    });
  }
}

// Wiring check: with no completed cycle the app must fall back to 28 days.
check(
  records.every((r) => r.history > 0 || r.tide === r.fixed28),
  "app did not fall back to 28 days without history",
);
check(
  records.every((r) => r.tide === r.median6),
  "app differs from the frozen six-cycle median",
);

function score(errors) {
  const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / errors.length;
  const within2 = errors.filter((e) => Math.abs(e) <= 2).length / errors.length;
  return `${mae.toFixed(2)} d MAE, ${(within2 * 100).toFixed(1)}% within ±2 d`;
}

console.log(`${stretches.length} stretches, ${women} women`);
for (const [label, minHistory] of [
  ["all predictions", 0],
  ["1+ prior cycle", 1],
  ["6+ prior cycles", 6],
]) {
  const subset = records.filter((r) => r.history >= minHistory);
  console.log(`\n${label} (n=${subset.length})`);
  for (const method of ["tide", "fixed28", "lastCycle"]) {
    console.log(`  ${method.padEnd(10)} ${score(subset.map((r) => r[method]))}`);
  }
}

function meanAbsoluteError(rows, method) {
  return rows.reduce((sum, row) => sum + Math.abs(row[method]), 0) / rows.length;
}

const development = records.filter((r) => !r.holdout);
const candidates = Object.keys(estimators).filter((name) => name !== "median6");
// Holdout outcomes never choose the estimator. Do not retune after reading them.
const selected = candidates.reduce((best, name) =>
  meanAbsoluteError(development, name) < meanAbsoluteError(development, best) ? name : best,
);
check(development.length === 2450 && records.length - development.length === 694, "participant split changed");
console.log("\nDevelopment comparison (participant SHA-256 first byte >= 51)");
for (const method of ["median6", ...candidates]) {
  console.log(`  ${method.padEnd(10)} ${score(development.map((r) => r[method]))}`);
}
console.log(`\nSelected on development: ${selected}`);
for (const [label, include] of [
  ["holdout", (r) => r.holdout],
  ["holdout, 1 prior cycle", (r) => r.holdout && r.history === 1],
  ["holdout, 6+ prior cycles", (r) => r.holdout && r.history >= 6],
  ["holdout, recent SD >= 5 days", (r) => r.holdout && r.irregular],
  ["holdout, previous cycle < 25 days", (r) => r.holdout && r.previousLength !== null && r.previousLength < 25],
  ["holdout, previous cycle > 35 days", (r) => r.holdout && r.previousLength !== null && r.previousLength > 35],
  ["same full cohort", () => true],
]) {
  const subset = records.filter(include);
  console.log(`\n${label} (n=${subset.length})`);
  for (const method of ["median6", selected]) {
    console.log(`  ${method.padEnd(10)} ${score(subset.map((r) => r[method]))}`);
  }
}
