// Synthetic model costs, excluding browser rendering and storage. Optional first
// argument: another Tide source tree, for a matched before/after comparison.
import { cpus } from "node:os";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";

const root = process.argv[2] ?? fileURLToPath(new URL("..", import.meta.url));
const load = async (path) => (await runnerImport(resolve(root, path), { configFile: false })).module;
const { forecast, getAveragePeriodLength } = await load("src/domain/cycle.ts");
const { appStateReducer } = await load("src/state/core.ts");
const { defaultAppState } = await load("src/data/schema.ts");
const { addDays } = await load("src/utils/date.ts");

function measure(operation) {
  for (let index = 0; index < 10; index++) operation();
  const probe = performance.now();
  for (let index = 0; index < 5; index++) operation();
  const estimate = (performance.now() - probe) / 5;
  const repeats = Math.max(1, Math.min(200, Math.ceil(15 / Math.max(estimate, 0.001))));
  const samples = [];
  for (let batch = 0; batch < 21; batch++) {
    const start = performance.now();
    for (let index = 0; index < repeats; index++) operation();
    samples.push((performance.now() - start) / repeats);
  }
  samples.sort((a, b) => a - b);
  return { medianMs: Number(samples[10].toFixed(3)), p95Ms: Number(samples[19].toFixed(3)) };
}

console.log(JSON.stringify({ node: process.version, cpu: cpus()[0]?.model, batches: 21 }));
const today = "2026-11-11";
for (const years of [1, 5, 20]) {
  const cycles = Math.floor((years * 365.25) / 28);
  const periodDays = Array.from({ length: cycles }, (_cycle, cycle) =>
    Array.from({ length: 5 }, (_day, day) => addDays(today, -(cycles - cycle) * 28 + day)),
  ).flat();
  const state = { ...defaultAppState, intensityByDay: Object.fromEntries(periodDays.map((day) => [day, null])) };
  const input = { today, periodDays, fertility: true };
  if (forecast(input).cycleLength !== 28) throw new Error("Synthetic fixture changed");
  console.log(
    JSON.stringify({
      years,
      logs: periodDays.length,
      duration: measure(() => getAveragePeriodLength(periodDays, today)),
      forecast: measure(() => forecast(input)),
      range14: measure(() =>
        appStateReducer(state, {
          type: "logPeriodRange",
          from: addDays(today, -13),
          to: today,
          today,
        }),
      ),
    }),
  );
}
