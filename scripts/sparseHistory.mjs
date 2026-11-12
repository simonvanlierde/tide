// Synthetic stress evaluation, not population accuracy or clinical validation.
// Truth is seeded separately from logs. Targets are the first true onset after
// each cutoff; after the current episode, follow-up deliberately has no logs.
// Errors (including returned dates already due) use estimates as denominator;
// declines use all cases; coverage/width use displayed ranges only. Width is
// inclusive. p90 is nearest rank. History means latent prior cycles, not logs.
import check from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { runnerImport } from "vite";

const HISTORIES = [0, 1, 2, 3, 6, 12];
const MASKS = ["clean", "one-missed", "three-missed", "missing-initial-days"];
const CUTOFFS = { early: 4, later: 20, overdue: 60 };
const SCENARIOS = ["stable", "variable", "long", "gradual-shift"];
const DAY = 86_400_000;
const shift = (date, days) => new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10);
const difference = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / DAY);
const hash = (value) => createHash("sha256").update(value).digest("hex");

export function generateCases({ seed = 20261111, count = 5 } = {}) {
  check(Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff, "seed must be a uint32");
  check(Number.isInteger(count) && count > 0 && count <= 1000, "count must be 1–1000 histories per scenario");
  let state = seed;
  const random = (min, max) => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return min + Math.floor((state / 4294967296) * (max - min + 1));
  };
  const rows = [];
  for (const scenario of SCENARIOS) {
    for (let person = 0; person < count; person++) {
      // Arbitrary stress parameters, not disease definitions or prevalence.
      const lengths = Array.from({ length: 17 }, (_, index) => {
        if (scenario === "stable") return random(27, 29);
        if (scenario === "variable") return random(20, 60);
        if (scenario === "long") return random(45, 90);
        return 23 + index + random(-1, 1);
      });
      const onsets = ["2020-01-01"];
      for (const length of lengths) onsets.push(shift(onsets.at(-1), length));
      const current = onsets[12];
      for (const priorCycles of HISTORIES) {
        const visible = onsets.slice(12 - priorCycles, 13);
        for (const mask of MASKS) {
          const removedEpisodes = Math.min(priorCycles, mask === "one-missed" ? 1 : mask === "three-missed" ? 3 : 0);
          // Omit the most recent prior episodes; preserve the current episode.
          const observed = visible.filter((_, index) => index < priorCycles - removedEpisodes || index === priorCycles);
          for (const [cutoff, offset] of Object.entries(CUTOFFS)) {
            const today = shift(current, offset);
            const target = onsets.find((onset) => onset > today);
            check(target && target > today, "truth must extend beyond cutoff");
            const periodDays = observed
              .flatMap((onset) =>
                Array.from({ length: mask === "missing-initial-days" ? 3 : 5 }, (_, day) =>
                  shift(onset, day + (mask === "missing-initial-days" ? 2 : 0)),
                ),
              )
              .filter((day) => day <= today);
            check(
              periodDays.every((day) => day <= today && day < target),
              "future input or target leakage",
            );
            rows.push({
              id: `synthetic-${scenario}-${person}`,
              scenario,
              priorCycles,
              mask,
              cutoff,
              current,
              target,
              today,
              removedEpisodes,
              trueLengths: lengths.slice(12 - priorCycles),
              periodDays,
            });
          }
        }
      }
    }
  }
  return rows;
}

export function summarize(rows) {
  const estimates = rows.filter((row) => row.error !== null);
  const errors = estimates.map((row) => Math.abs(row.error)).sort((a, b) => a - b);
  const ranges = rows.flatMap((row) => (row.range ? [row.range] : []));
  const errorsOver7Days = errors.filter((error) => error > 7).length;
  const coveredTargets = ranges.filter((range) => range.contains).length;
  return {
    n: rows.length,
    estimates: errors.length,
    declines: rows.length - errors.length,
    declineRate: rows.length ? (rows.length - errors.length) / rows.length : null,
    overdueEstimates: estimates.filter((row) => row.overdue).length,
    maeDays: errors.length ? errors.reduce((sum, error) => sum + error, 0) / errors.length : null,
    p90AbsoluteErrorDays: errors.length ? errors[Math.ceil(errors.length * 0.9) - 1] : null,
    errorsOver7Days,
    errorsOver7Rate: errors.length ? errorsOver7Days / errors.length : null,
    ranges: ranges.length,
    coveredTargets,
    coverage: ranges.length ? coveredTargets / ranges.length : null,
    meanInclusiveWidthDays: ranges.length ? ranges.reduce((sum, range) => sum + range.width, 0) / ranges.length : null,
  };
}

export async function evaluate(cases) {
  const { module: cycle } = await runnerImport("/src/domain/cycle.ts", { configFile: false });
  const records = cases.map((row) => {
    check(row.target > row.today && row.periodDays.every((day) => day <= row.today), "invalid cutoff");
    const result = cycle.forecast({ today: row.today, periodDays: row.periodDays, fertility: false });
    const range = cycle.explainForecast(result)?.range;
    return {
      ...row,
      observedCompletedCycles: cycle.getCompletedCycleLengths(row.periodDays).length,
      error: result.nextPeriod.date === null ? null : difference(result.nextPeriod.date, row.target),
      overdue: result.nextPeriod.date !== null && result.nextPeriod.date <= row.today,
      range: range
        ? { contains: range.from <= row.target && row.target <= range.to, width: difference(range.to, range.from) + 1 }
        : null,
    };
  });
  const strata = [];
  for (const scenario of SCENARIOS) {
    for (const priorCycles of HISTORIES) {
      for (const mask of MASKS) {
        for (const cutoff of Object.keys(CUTOFFS)) {
          const rows = records.filter(
            (row) =>
              row.scenario === scenario &&
              row.priorCycles === priorCycles &&
              row.mask === mask &&
              row.cutoff === cutoff,
          );
          strata.push({
            scenario,
            priorCycles,
            mask,
            cutoff,
            observedCompletedCycles: [...new Set(rows.map((row) => row.observedCompletedCycles))],
            removedEpisodes: [...new Set(rows.map((row) => row.removedEpisodes))],
            ...summarize(rows),
          });
        }
      }
    }
  }
  return { overall: summarize(records), strata };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  check(process.argv.length <= 4, "usage: node scripts/sparseHistory.mjs [seed] [histories-per-scenario]");
  const seed = process.argv[2] === undefined ? 20261111 : Number(process.argv[2]);
  const count = process.argv[3] === undefined ? 5 : Number(process.argv[3]);
  const cases = generateCases({ seed, count });
  check.deepEqual(cases, generateCases({ seed, count }), "generation is not deterministic");
  const predictorSha256 = hash(await readFile(new URL("../src/domain/cycle.ts", import.meta.url)));
  const datesSha256 = hash(await readFile(new URL("../src/utils/date.ts", import.meta.url)));
  const evaluationSha256 = hash(await readFile(new URL("./sparseHistory.mjs", import.meta.url)));
  const metrics = await evaluate(cases);
  console.log(
    JSON.stringify(
      {
        version: 1,
        seed,
        historiesPerScenario: count,
        distinctSyntheticHistories: SCENARIOS.length * count,
        metricsSha256: hash(JSON.stringify(metrics)),
        predictorSha256,
        datesSha256,
        evaluationSha256,
        sampleSha256: hash(JSON.stringify(cases)),
        limitations:
          "Synthetic stress cases, not population accuracy or clinical validation. Follow-up has no new logs. Ranges describe variation, not calibrated probability. No estimator tuning. Paired cases are correlated, not independent participants.",
        cutoffDays: CUTOFFS,
        ...metrics,
      },
      null,
      2,
    ),
  );
}
