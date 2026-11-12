# Predictor backtest

How close does Tide's next-period date land on real cycles? This page answers that on one
public dataset. Run it yourself with `pnpm backtest`.

Last run: 2026-11-11. The production predictor still uses the six-cycle median described below.

## Dataset

[Menstrual Cycles Length of Women in the USA and Canada, 1990-2013](https://doi.org/10.7278/S50d-4gxs-s4hj),
The Hive: University of Utah Research Data Repository (Najmabadi, Stanford et al.).

- 581 women, 3,324 cycles, each with its start date and length. Women aged 18 to 40, followed
  for up to a year in three Creighton Model FertilityCare cohorts (CMFS 1990-1996, TTP
  2003-2006, CEIBA 2009-2013).
- Licence: **Creative Commons Attribution Non Commercial 3.0 Unported** (CC BY-NC 3.0). The
  dataset README says: "CC BY NC - Allows others to use and share your data non-commercially
  and with attribution."
- The data is not committed here: Tide is MIT-licensed, and the non-commercial term would not
  carry over. `scripts/backtestPredictor.mjs` downloads the CSV into `.cache/backtest/` (no
  account needed) and stops if its SHA-256 differs from the one it expects.

Other datasets considered:

| Dataset | Size | Licence | Why not |
|---|---|---|---|
| [Marquette NFP "Menstrual Cycle Data"](https://epublications.marquette.edu/data_nfp/7/) (Fehring, 2012) | 159 women, 1,665 cycle rows, with an estimated ovulation day. The file download returned HTTP 403 to a script | None stated. Only: "Data reuse agreed to by subjects in consent form." A [Kaggle copy](https://www.kaggle.com/datasets/nikitabisht/menstrual-cycle-data) lists its licence as "Unknown"; a re-upload cannot add one | No licence, so publishing results on it is unclear |
| [mcPHASES](https://www.physionet.org/content/mcphases/) (PhysioNet) | 42 people, two 3-month stretches | PhysioNet Restricted Health Data License 1.5.0 | Needs an account and a signed data use agreement |
| Clue app study ([Li et al.](https://arxiv.org/abs/1909.11211)) | 378,000 users | Raw data not released | Not available |

## Method

For each woman, the script walks her cycles in order. At the start of each cycle it gives
`forecast` every earlier cycle start, asks for the next period date, and compares it
with the real next start. It calls the app's own code; nothing is reimplemented.

- The file only has start dates, so each period is logged as a single day. That does not
  change the next-period date, which depends on cycle starts only.
- The file skips cycle numbers in 186 places. A gap would look like one very long cycle, so
  each unbroken stretch counts as its own history (767 stretches).
- Cycles that ended in a pregnancy have no next start and are not predicted.

Two baselines, given the same history:

- **Fixed 28:** the last start plus 28 days.
- **Last cycle:** the last start plus the length of the previous cycle (28 when there is none).

## Results

Mean absolute error (MAE) in days, and the share of predictions within ±2 days of the real
start. "Prior cycles" is how many completed cycles the app had learned from.

| Predictions | n | Tide | Fixed 28 | Last cycle |
|---|---|---|---|---|
| All | 3,144 | 3.37 d, 60.2% | 3.84 d, 54.3% | 3.69 d, 55.2% |
| 1+ prior cycle | 2,412 | 3.09 d, 62.9% | 3.70 d, 55.3% | 3.51 d, 56.4% |
| 6+ prior cycles (full window) | 580 | 2.00 d, 71.9% | 2.61 d, 61.4% | 2.58 d, 62.4% |

The median of recent cycles beats both baselines at every history length, and the gap widens
as the six-cycle window fills.

**Fertile window:** not tested. The shared file has no ovulation marker (the study's
cervical-mucus peak day is not included), so there is nothing to check the window against.

## Predictor comparison

The script also compares six simple alternatives with a frozen copy of the current rule.
It checks that the app and the frozen rule agree on every prediction.
All alternatives receive the same earlier completed cycles; none sees the cycle being predicted.

Participants are split by the first byte of SHA-256 of their dataset identifier.
A value below 51 assigns all of that participant's stretches to the holdout group.
The remaining participants form the development group: 2,450 predictions, compared with 694 held out.
The lowest development MAE selects one candidate before its holdout results are inspected.

| Rule | Development MAE | Within ±2 days |
|---|---|---|
| Current: median of last 6 | 3.33 d | 60.7% |
| Median of last 3 | 3.37 d | 60.3% |
| Median of last 12 | 3.32 d | 60.7% |
| Median of all history | 3.32 d | 60.7% |
| Mean of last 6 | 3.39 d | 60.1% |
| Mean of last 6, dropping min and max with 4+ cycles | 3.35 d | 60.4% |
| Median of last 6 plus one 28-day reference | 3.17 d | 62.3% |

The 28-day reference candidate wins on development data. Its reference is an extra value in the
median, not a logged cycle. With no history, it still returns 28 days.

| Holdout predictions | n | Current | 28-day reference candidate |
|---|---|---|---|
| All | 694 | 3.53 d, 58.5% | 3.40 d, 60.4% |
| Exactly 1 prior cycle | 109 | 3.91 d, 54.1% | 3.34 d, 58.7% |
| 6+ prior cycles | 138 | 2.17 d, 69.6% | 2.10 d, 70.3% |
| Recent cycle standard deviation ≥5 days | 42 | 7.69 d, 28.6% | 7.24 d, 40.5% |
| Previous cycle <25 days | 24 | 4.50 d, 45.8% | 4.17 d, 54.2% |
| Previous cycle >35 days | 56 | 8.61 d, 28.6% | 7.80 d, 35.7% |

On the same full cohort, the candidate scores 3.22 days MAE and 61.9% within ±2 days,
against the current 3.37 days and 60.2%. This includes the development data, so it is not independent validation.

**Decision: keep the production predictor.** The holdout improvement is 0.13 day, and the
candidate can pull a user's estimate away from their own history. After one 40-day cycle,
it predicts 34 days; after two 40-day cycles, it predicts 40 days.
The analogous one-cycle estimate for a 20-day cycle becomes 24 days.
Those are material changes for someone with consistently long or short cycles.
The small subgroups above describe previous cycles, not people known to have consistently long or short cycles.

The holdout separates people, but still comes from the same selected population.
It does not establish performance for the populations missing from this dataset.
Predictions from one participant are correlated; the table gives point estimates, not confidence intervals.
No candidate was retuned after reading the holdout results.
A further attempt to tune against this dataset would be exploratory and would need new validation data before promotion.

## Large errors and displayed ranges

These diagnostics use the same cohort and production predictor. They do not select another model.
The 90th percentile uses the nearest rank of absolute errors. A large error here means more than
seven days; that is an evaluation threshold, not a clinical definition.

| Earlier completed cycles | Predictions | 90th-percentile error | Error >7 days | Displayed ranges | Target inside range | Mean range width |
|---|---|---|---|---|---|---|
| All | 3,144 | 7 d | 9.4% | 1,780 | 69.0% | 6.9 d |
| None | 732 | 9 d | 14.6% | None | — | — |
| 1+ | 2,412 | 6 d | 7.8% | 1,780 | 69.0% | 6.9 d |
| 6+ | 580 | 4 d | 3.3% | 579 | 78.4% | 6.8 d |
| Recent standard deviation ≥5 days | 173 | 17 d | 30.6% | 173 | 76.3% | 21.3 d |

The last row describes earlier recorded variation, not a diagnosed condition or a distinct population.
Range coverage uses only predictions for which the app displays a range. No range is displayed with
fewer than two completed cycles or with zero recent variation. Width counts both end dates.

**These are not calibrated confidence intervals.** The app's range uses recent standard deviation;
it does not promise an 80%, 90% or 95% chance of containing the next start. Even in this selected
cohort, a wider band can remain wrong and become too broad to help with planning. Do not use this
coverage figure as a guarantee for an individual or another population.

## Missing-log stress test

For the 1,858 predictions with at least two earlier completed intervals, the script removes the
immediately preceding period start from the input. It keeps the current start and the target unchanged.
The missing record joins two earlier intervals. A third run marks that joined interval incomplete,
using Tide's existing exclusion rule. This is a controlled synthetic omission, not observed app usage
or independent validation of a missed-log detector.

| Input | MAE | Within ±2 days | 90th-percentile error | Error >7 days |
|---|---|---|---|---|
| Original history | 2.88 d | 64.9% | 6 d | 6.7% |
| Previous start removed | 11.93 d | 35.3% | 30 d | 46.5% |
| Joined interval marked incomplete | 3.31 d | 62.1% | 7 d | 8.9% |

Excluding the interval reduces the effect of a known missing log but cannot restore the lost history.
A genuinely long cycle must not be silently classified as a forgotten record. This experiment supplies
no evidence for doing that automatically.

The next model comparison needs independent data covering sparse logging and consistently short,
long and variable cycles. It must compare large errors and range coverage/width alongside MAE,
with cold-start results reported separately. The production estimator remains unchanged.

## Limits

- **Population.** Women who chose to learn a fertility-awareness method, screened for regular
  bleeding and normal fertility, many of them trying to conceive. Irregular cycles, PCOS,
  perimenopause, recent hormonal contraception and teenagers are under-represented or absent.
  Expect larger errors for those users.
- **Self-selection and recording.** Charts were kept daily under instruction, which is more
  careful than casual app logging. Missed logs in real use add error this test does not see.
- **Short histories.** Most women have under a year of data, so the 6+ row is a small, more
  committed subset (580 predictions).
- **Old data.** Cycles from 1990 to 2013, all in the USA and Canada.
