// Backtest the next-period prediction against real cycle histories.
// Downloads the Utah Creighton Model dataset (CC BY-NC 3.0, not committed),
// checks its hash, then walks each woman's cycles forward through the app's own
// buildCycleSummary. Results and limits: docs/backtest.md.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { runnerImport } from "vite";

const DATA_URL =
  "https://hive.utah.edu/records/3zhb1-48n69/files/CrMcyclelength_share.csv?download=1";
const DATA_SHA256 =
  // biome-ignore lint/security/noSecrets: a file checksum, not a secret
  "ad67a3eed731a038d6502a1eb42a9dcddf8f6c69a607a61b85f3798198043dac";
const BOM = /^\uFEFF/;
const LINE_BREAK = /\r?\n/;
const CACHE = new URL(
  "../.cache/backtest/CrMcyclelength_share.csv",
  import.meta.url,
);

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
  check(
    hash === DATA_SHA256,
    `dataset hash mismatch, delete ${CACHE.pathname}`,
  );
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
const { buildCycleSummary, getCompletedCycleLengths, DEFAULT_CYCLE_LENGTH } =
  cycle;
const { addDays, differenceInDays } = date;

const stretches = parseStretches(await loadCsv());
const women = new Set(stretches.map((s) => s[0].id)).size;
check(
  women === 581 && stretches.flat().length === 3324,
  "unexpected row count",
);

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
    const summary = buildCycleSummary({
      today: current.start,
      periodDays,
      completedCycleLengths: getCompletedCycleLengths(periodDays),
    });
    const actual = addDays(current.start, current.length);
    const lastLength = stretch[k - 1]?.length ?? DEFAULT_CYCLE_LENGTH;
    records.push({
      history: k,
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
    console.log(
      `  ${method.padEnd(10)} ${score(subset.map((r) => r[method]))}`,
    );
  }
}
