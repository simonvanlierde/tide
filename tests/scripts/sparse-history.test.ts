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
