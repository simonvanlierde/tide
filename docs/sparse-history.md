# Sparse-history stress evaluation

Run `pnpm validate:sparse` to exercise the production predictor with synthetic histories.
It makes no network requests. The JSON includes all 288 strata, source hashes, and sample
and metrics hashes. To keep an output locally:

```sh
mkdir -p .cache/validation
pnpm validate:sparse > .cache/validation/sparse-history.json
```

This is a stress test of the current rule. It does not estimate population accuracy,
validate fertility estimates, or support a clinical claim. The parameters are arbitrary;
the scenarios are not diagnoses or prevalence estimates. The [real-data backtest](backtest.md)
answers a different question on a selected cohort.

## Method

The default seed is `20261111`. Five seeded histories in each of four scenarios give
20 distinct synthetic histories. Each history has 17 latent cycle lengths and five-day
bleeding episodes. The scenarios use stable lengths (27–29 days), variable lengths
(20–60 days), genuine long lengths (45–90 days), and gradually increasing lengths
(23 plus the cycle index, with one day of jitter).

For the same current episode, the evaluator exposes 0, 1, 2, 3, 6 or 12 prior cycles.
Each window has four observation variants: all available episodes, one missed prior
episode, three missed prior episodes, and the first two bleeding days missing from
each episode. Missing episodes are the most recent prior episodes; their number is
capped by the available history. The current episode remains logged. True long intervals
are retained without filtering, splitting or invented periods.

Cutoffs advance to 4, 20 and 60 days after the current true onset. No further episodes
are logged during this follow-up, even when a latent period has occurred. The target is
always the first true onset strictly after the cutoff. Thus the later cutoffs also test
cessation of tracking, rather than merely observing a complete cycle later.

Every mask and history window shares its history's truth, cutoff and target. Only observed
bleeding days at or before the cutoff reach `forecast`; future truth is used only for
scoring. `explainForecast` supplies the displayed range. No estimator is tuned or selected.

There are 1,440 paired cases, with five histories per full scenario/history/mask/cutoff
stratum. These cases are correlated; they are not 1,440 independent people. The earlier
one-off sample is not reproduced here: its generator was unavailable for review. This
maintained generator has its own explicit parameters and regression checks.

## Metrics

- MAE, nearest-rank p90 of absolute error, and errors over seven days use returned
  estimates as their denominator. Seven days is an evaluation threshold.
- A decline is a null next-period date; its rate uses all cases. Returned dates at or
  before the cutoff are counted separately as already due and remain in error metrics.
- Coverage and mean inclusive width use only ranges actually supplied by the explainer.
  Their count is reported alongside coverage. These ranges are not calibrated confidence
  intervals; a wide range can cover a target while saying little that helps planning.

## Results

Run on 2026-11-12 against main at `f8483df`. Two complete JSON outputs were byte-identical.
The command took about 0.32 seconds on the development machine, including module loading;
this is not a phone-runtime benchmark. Evaluation code is outside the app bundle, and
no production source or dependency changed.

| Cutoff after current onset | Cases | Declines | Returned dates already due |
| --- | ---: | ---: | ---: |
| 4 days | 480 | 0 | 0 |
| 20 days | 480 | 0 | 0 |
| 60 days | 480 | 344 | 59 |

Across this deliberately mixed stress sample, 1,096 estimates had 14.2-day MAE and
39-day p90 error; 520/1,096 (47.4%) missed by more than seven days. There were
344/1,440 declines (23.9%). Of 609 displayed ranges, 407 covered the target (66.8%),
with a mean inclusive width of 38.1 days. These aggregates depend on the arbitrary mix;
use the strata in the JSON to see which failure mode contributed.

For clean observations at the early cutoff, each cell below is MAE / p90 in days,
from five histories. With zero prior cycles, one current bleeding episode is still logged.

| Prior latent cycles | Stable | Variable | Genuine long | Gradual shift |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0.6 / 1 | 14.2 / 29 | 37.8 / 53 | 7.0 / 8 |
| 1 | 1.2 / 2 | 9.4 / 40 | 16.8 / 33 | 0.8 / 1 |
| 2 | 1.0 / 2 | 13.0 / 39 | 15.6 / 24 | 1.0 / 1 |
| 3 | 1.2 / 2 | 11.2 / 37 | 14.2 / 27 | 1.8 / 2 |
| 6 | 0.8 / 2 | 12.2 / 36 | 12.6 / 27 | 3.2 / 5 |
| 12 | 0.8 / 2 | 12.2 / 36 | 12.6 / 27 | 3.2 / 5 |

The full JSON reports errors, declines, range coverage and width for every mask and
cutoff as well. Sparse long histories expose the default's limits; variable histories
remain hard even with more observations. This is evidence to retain honest uncertainty,
not evidence to promote an alternative estimator.

Reproduction hashes:

```text
sample:  d00c2ceb5f284236b613bf7780d037e90734006e94d72815220433335deda00e
metrics: d319f9dd007e9a81edd4e35a3d2d6bc4ad079b1398e071840c31b9bc3cd7073b
```

The output also hashes the predictor, date helpers and evaluator. Tests check pairing,
prospective targets, applied masks, genuine long intervals, metric denominators,
reproducibility and production wiring. A denominator mutation fails the metrics test.

## External-data gate

A bounded recheck on 2026-11-12 found only the original CSV listed on
[Zenodo 15598359](https://zenodo.org/records/15598359), with no listed codebook or correction.
The associated [paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC13141897/) was behind a browser
challenge, and the publisher's supplement returned 403; the supplement was not reviewed.
This does not establish that no clarification exists.

The existing audit leaves event meanings, participant boundaries, birth flags, observation
gaps and date anomalies unresolved. No participant records were downloaded for this run.
The dataset remains excluded from backtests until a usable codebook or author clarification
resolves those questions. No authors were contacted. Any proposed estimator still needs
independent usable evidence, with people separated across tuning and evaluation.
