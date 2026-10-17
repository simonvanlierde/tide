# Predictor backtest

How close does Tide's next-period date land on real cycles? This page answers that on one
public dataset. Run it yourself with `pnpm backtest`.

Last run: 2026-10-12, against `src/domain/cycle.ts` at the commit that added this page.

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
| [Marquette NFP "Menstrual Cycle Data"](https://epublications.marquette.edu/data_nfp/7/) (Fehring, 2012) | Not stated on the page; the file download returned HTTP 403 to a script | None stated. Only: "Data reuse agreed to by subjects in consent form." | No licence, so publishing results on it is unclear |
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
