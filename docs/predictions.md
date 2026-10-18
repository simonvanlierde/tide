# How predictions work

Tide works out every estimate on your device, from the bleeding days you log. Nothing leaves your
device. The code is in `src/domain/cycle.ts`.

- **Cycles.** A gap of **10+ days** between logged bleeding days starts a new cycle. A shorter gap
  counts as missed logs within the same period.
- **Cycle length.** The **median of your last 6 completed cycles**, counted in days between
  starts. I use the median so one odd cycle doesn't skew it, and only recent cycles because cycle
  length drifts. Until you've logged two period starts (one full cycle), Tide uses **28 days**.
- **Period length.** The average of your past periods, kept within the **2–7 day** range that ACOG
  (the American College of Obstetricians and Gynecologists) gives as normal. It leaves out the
  current, unfinished period, and uses **4 days** when there's no history.
- **Next period.** The most recent cycle start plus the estimated cycle length.
- **Range.** The next period date, give or take the standard deviation of your recent cycles,
  rounded up to whole days. With fewer than two cycles, or cycles of all the same length, there is
  no range.
- **Ovulation.** **14 days before** the next predicted period, because the luteal phase (the part
  after ovulation) varies least from cycle to cycle. Calendar math can't do better without
  temperature or LH-test input, and Tide doesn't collect those.
- **Fertile window.** From 5 days before ovulation to 1 day after, because sperm survive about
  5 days and the egg about 1. It **widens with the standard deviation of your recent cycles**
  (capped at ±5 days), so it stays tight for regular cycles and gets wider for irregular ones.
- **Phase.** Menstrual on a logged bleeding day. Otherwise follicular, ovulation (the estimate
  ±1 day) or luteal, read from the ovulation estimate. With fertility estimates off, Tide makes no
  ovulation estimate, so every other day is simply "between periods".

On Today, **How was this worked out?** shows these steps with your own numbers. Settings → Data
→ **Add to calendar** saves the next 3 expected period starts as all-day events in an `.ics` file,
made on your device. Each event is named by its cycle number, so importing a newer file moves it
instead of adding a copy.

To see how close the next-period estimate lands on real cycle data, read
[backtest.md](backtest.md).

The estimates are for information only. They are not a form of birth control.
