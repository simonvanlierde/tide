# Predictor performance

The cycle model should stay cheap as a history grows. The benchmarks here use synthetic
28-day cycles with five bleeding days each. They measure model work, not browser input
latency, rendering, local storage or performance on a phone.

## Run the benchmark

```sh
pnpm benchmark
```

It reports the median and 95th percentile of 21 warmed batches for one, five and twenty
years of history. The output includes Node and CPU information. Run with little competing
work; repeat a comparison before relying on a small timing difference.

To compare another source tree using the same harness and installed Vite version:

```sh
pnpm benchmark path/to/other/tide
```

Use the same machine, CPU affinity and fixture for both trees. The benchmark checks that
its regular synthetic history still predicts a 28-day cycle.

## Costs removed

Period duration groups the sorted logs in one traversal. It retains elapsed run length,
the ten-day split, the five-day completion rule and the existing clamps. It no longer
filters the whole history separately for every period.

Logging a date range builds one final flow map and reconciles interval markers once.
Existing flow levels and future-date protection stay in place. Generated tests compare
the result with individually logging the same days, including incomplete-cycle markers.

On a shared Ryzen 7 H 255 with Node 26.13.0, pinned to one logical CPU, a twenty-year history
contained 1,300 logs across 260 cycles. The two trees ran back to back on a busy host
(load average about 7), so read the direction, not exact ratios:

| Model operation | Earlier median / p95 | Current median / p95 |
|---|---|---|
| Period duration | 3.62 / 4.77 ms | 1.44 / 1.94 ms |
| Forecast with fertility enabled | 11.7 / 19.2 ms | 6.21 / 6.26 ms |
| Add a fourteen-day range | 91.0 / 108 ms | 6.49 / 9.22 ms |

With one year of history, the duration median went from 0.080 to 0.053 ms. Small histories were already cheap; these results do not establish a visible
speed-up on a user's device. Process memory includes benchmark tooling and is not an
estimate of the app's memory use.

## Regression checks and remaining trade-offs

A range test checks that history reconciliation happens once,
regardless of how many new days are added. Timing thresholds are deliberately absent
from tests, so shared CI load does not decide correctness.

Historical fertility-window lookup still scans later windows when viewing old months.
A twenty-year oldest-month model sample took about 7 ms, versus 0.064 ms for the current
month. Fertility is optional. Keep the ordered scan until browser profiling identifies
it as a meaningful interaction cost; a binary search would be the next bounded change.

The pure predictor remains internal. It already serves the app, tests and backtest through
the same implementation. Publishing it would add versioning and compatibility obligations;
there is no second independently maintained consumer that requires them today.
