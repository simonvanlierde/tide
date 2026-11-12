// biome-ignore lint/correctness/noNodejsModules: exercise the evaluation in its real Node runtime.
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

function check(source: string) {
  return execFileSync(
    "node",
    [
      "--input-type=module",
      "-e",
      `import assert from 'node:assert/strict';
         import { generateCases, summarize, evaluate } from './scripts/sparseHistory.mjs';
         ${source}`,
    ],
    { encoding: "utf8" },
  );
}

it("keeps seeded truth paired across masks and cutoffs without leaking target days", () => {
  expect(
    check(`
    const rows = generateCases({ count: 1 });
    assert.deepEqual(rows, generateCases({ count: 1 }));
    assert.notDeepEqual(rows, generateCases({ count: 1, seed: 2 }));
    assert.equal(rows.length, 4 * 6 * 4 * 3);
    for (const row of rows) {
      const day = (date, offset) => new Date(Date.parse(date) + offset * 86400000).toISOString().slice(0, 10);
      const onsets = [row.current];
      for (let i = row.priorCycles - 1; i >= 0; i--) onsets.unshift(day(onsets[0], -row.trueLengths[i]));
      for (const length of row.trueLengths.slice(row.priorCycles)) onsets.push(day(onsets.at(-1), length));
      assert.equal(row.target, onsets.filter(onset => onset > row.today)[0]);
      const prior = onsets.slice(0, row.priorCycles);
      const retained = row.mask === 'one-missed' ? prior.slice(0, -1) : row.mask === 'three-missed' ? prior.slice(0, -3) : prior;
      const offsets = row.mask === 'missing-initial-days' ? [2, 3, 4] : [0, 1, 2, 3, 4];
      assert.deepEqual(row.periodDays, [...retained, row.current].flatMap(onset => offsets.map(offset => day(onset, offset))).filter(date => date <= row.today));
      assert(row.target > row.today);
      assert(row.periodDays.every(day => day <= row.today && day < row.target));
      assert.equal(row.periodDays.length, (row.priorCycles + 1 - row.removedEpisodes) * (row.mask === 'missing-initial-days' ? 3 : 5));
      const paired = rows.filter(other => other.id === row.id && other.cutoff === row.cutoff);
      assert(paired.every(other => other.target === row.target && other.current === row.current));
      if (row.scenario === 'long') assert(row.trueLengths.every(length => length >= 45));
    }
  `),
  ).toBe("");
});

it("scores a known forecast error and its inclusive displayed range", () => {
  expect(
    check(`
    const starts = ['2020-01-01', '2020-01-29', '2020-02-28', '2020-03-31'];
    const periodDays = starts.flatMap(start => Array.from({ length: 5 }, (_, day) => new Date(Date.parse(start) + day * 86400000).toISOString().slice(0, 10)));
    // Completed lengths 28, 30, 32 predict April 30, with an April 28–May 2 range.
    const result = await evaluate([{ today: '2020-04-04', target: '2020-05-01', periodDays }]);
    assert.deepEqual(result.overall, {
      n: 1, estimates: 1, declines: 0, declineRate: 0, overdueEstimates: 0,
      maeDays: 1, p90AbsoluteErrorDays: 1, errorsOver7Days: 0, errorsOver7Rate: 0,
      ranges: 1, coveredTargets: 1, coverage: 1, meanInclusiveWidthDays: 5,
    });
  `),
  ).toBe("");
});

it("uses estimate and displayed-range denominators and nearest-rank p90", () => {
  expect(
    check(`
    const result = summarize([
      { error: 0, range: { contains: true, width: 5 } },
      { error: -10, overdue: true, range: { contains: false, width: 3 } },
      { error: 2, range: null },
      { error: null, range: null },
    ]);
    assert.deepEqual(result, {
      n: 4, estimates: 3, declines: 1, declineRate: 0.25, overdueEstimates: 1,
      maeDays: 4, p90AbsoluteErrorDays: 10, errorsOver7Days: 1, errorsOver7Rate: 1 / 3,
      ranges: 2, coveredTargets: 1, coverage: 0.5, meanInclusiveWidthDays: 4,
    });
    const empty = summarize([{ error: null, range: null }]);
    assert.equal(empty.maeDays, null);
    assert.equal(empty.coverage, null);
  `),
  ).toBe("");
});

it("calls the production forecast and captures sparse declines at rolling cutoffs", () => {
  expect(
    check(`
    const result = await evaluate(generateCases({ count: 1 }));
    assert.equal(result.overall.n, 288);
    assert(result.overall.declines > 0);
    assert(result.overall.estimates > 0);
    assert(result.overall.overdueEstimates > 0);
    assert.equal(result.strata.length, 288);
    const cold = result.strata.find(row => row.scenario === 'stable' && row.priorCycles === 0 && row.mask === 'clean' && row.cutoff === 'early');
    assert.equal(cold.estimates, 1);
    assert.equal(cold.ranges, 0);
    assert(result.strata.some(row => row.cutoff === 'overdue' && row.declines === 1));
    await assert.rejects(evaluate([{ ...generateCases({ count: 1 })[0], target: '1900-01-01' }]), /invalid cutoff/);
  `),
  ).toBe("");
});
