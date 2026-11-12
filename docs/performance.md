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

## 0.5.0 compared with 0.4.0

Both versions ran one after the other on 12 November 2026: the `v0.4.0` tag and the 0.5.0
candidate, on logical CPU 4 of a Ryzen 7 H 255 with Node 26.13.0 and the same Vite loader.
The shared host's load average moved between about 16 and 6, so read the direction, not exact ratios.

| History | Operation | 0.4.0 median / p95 | 0.5.0 median / p95 |
| --- | --- | --- | --- |
| 1 year, 65 logs | Period duration | 0.056 / 0.097 ms | 0.050 / 0.091 ms |
| 1 year, 65 logs | Forecast | 0.147 / 0.204 ms | 0.217 / 0.288 ms |
| 1 year, 65 logs | Add 14 days | 0.021 / 0.026 ms | 0.241 / 0.277 ms |
| 5 years, 325 logs | Period duration | 0.496 / 0.661 ms | 0.296 / 0.314 ms |
| 5 years, 325 logs | Forecast | 1.05 / 1.38 ms | 1.29 / 1.60 ms |
| 5 years, 325 logs | Add 14 days | 0.395 / 0.412 ms | 1.24 / 1.45 ms |
| 20 years, 1,300 logs | Period duration | 4.47 / 5.87 ms | 1.33 / 2.00 ms |
| 20 years, 1,300 logs | Forecast | 6.86 / 7.12 ms | 7.28 / 8.62 ms |
| 20 years, 1,300 logs | Add 14 days | 3.19 / 3.87 ms | 6.75 / 8.53 ms |

0.4.0 has no range logging, so its "Add 14 days" logs the same fourteen dates one at a time.
0.5.0 also reconciles incomplete-cycle markers and calendar ids, which 0.4.0 didn't track, so it
does more work. Assertions checked the period length, next-period date and added dates in both.

A second pass in reverse order repeated the twenty-year results: duration 4.38 to 1.41 ms, and
range 3.13 to 6.13 ms. The small forecast difference flipped direction (6.97 to 6.18 ms), so it
shows neither a speed-up nor a regression. Correctness and the bundle budget are the release
gates; timing isn't.

## Known costs

Range logging reconciles the history once, however many days it adds; a test checks that.
Tests have no timing thresholds, so a busy CI runner can't fail them.

Looking up past fertile windows still scans later windows, so old months cost more. On a
twenty-year history the oldest month took about 7 ms, against 0.064 ms for the current month.
A binary search is the next step if browser profiling shows this matters.

The predictor stays internal. The app, the tests and the backtest already share one
implementation, and no other project needs it as a package.
