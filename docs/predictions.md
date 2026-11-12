# How predictions work

Tide works out every estimate on your device, from the bleeding days you log. Tide does not upload
what you log. The code is in `src/domain/cycle.ts`.

- **Cycles.** A gap of **10+ days** between logged bleeding days starts a new cycle. Bleeding days separated by a shorter gap
  belong to the same period in the model. Spotting does not count toward these estimates.
- **Cycle length.** The **median of your last 6 completed cycles**, counted in days between
  starts. I use the median so one odd cycle doesn't skew it, and only recent cycles because cycle
  length drifts. Cycles marked incomplete are left out. When no complete cycles are available,
  Tide uses **28 days**.
- **Period length.** The average length of your past periods, measured from the first to the last
  logged bleeding day in each period. Tide keeps the estimate within **2–7 days**. This is a limit
  on the estimate, not an assessment of your health. It leaves out the latest period until at least
  **5 days** have passed since its last logged bleeding day. It uses **4 days** when there's no history.
- **Next period.** The most recent cycle start plus the estimated cycle length.
- **Range.** The next period date, give or take the standard deviation of your recent cycles,
  rounded up to whole days. With fewer than two cycles, or cycles of all the same length, there is
  no range. This describes past variation; it is not a guarantee or a validated probability range
  for your next period.
- **Ovulation.** **14 days before** the next predicted period, because the luteal phase (the part
  after ovulation) varies less than the part before it. Tide uses calendar dates only and does not
  confirm ovulation with temperature or hormone tests.
- **Fertile window.** From 5 days before ovulation to 1 day after, because sperm survive about
  5 days and the egg about 1. It **widens with the standard deviation of your recent cycles**
  (capped at ±5 days), so it stays tight for regular cycles and gets wider for irregular ones.
- **Phase.** Menstrual on a logged bleeding day. Otherwise follicular, ovulation (the estimate
  ±1 day) or luteal, read from the ovulation estimate. With fertility estimates off, Tide makes no
  ovulation estimate, so every other day is simply "between periods".

If the expected start is more than **10 days** overdue with no new period logged, Tide stops showing
the current forecast. Your history stays saved. Log a period when it starts to get a new estimate.

## Cycle insights

On Today, **Cycle insights** has **How was this worked out?**, which shows these steps with your
own numbers. It also lists your latest 12 completed cycles as a chart and a table, oldest first.

Tick **Incomplete** when a cycle is missing logs. Its days stay in the calendar, but its length
no longer counts toward the next-period estimate, regularity or the range, and its past fertility
estimates are hidden. Period length still uses its bleeding days. Changing the cycle's start or
end clears the mark, so it can't move to a different cycle. Backups keep the marks.

## Calendar file

**Settings → Data → Add to calendar** saves your next 3 expected period starts as all-day
events in an `.ics` file, made on your device. The events are marked private and don't show you
as busy. The private flag doesn't encrypt them: who sees them depends on your calendar's sharing
settings.

Each event has an id built from its cycle number and a random value made on the first export.
Import a newer file and the events move rather than duplicate. Marking a cycle incomplete doesn't renumber them. The random value travels in a
backup, so a restored device keeps updating the same events. Changing existing cycle starts,
importing older history or deleting all data makes a new value. The next file then adds new
events, and you delete the old ones by hand.

## How well it works

- The [backtest](backtest.md) scores the next-period date on 3,144 real cycles and compares it with simple baselines.
- The [sparse-history stress test](sparse-history.md) checks missed logs, short histories and long or shifting cycles on synthetic data.

The estimates are for information only. They are not a form of birth control.
