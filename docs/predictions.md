# How predictions work

Tide works out every estimate on your device, from the bleeding days you log. Nothing leaves your
device. The code is in `src/domain/cycle.ts`.

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

On Today, **How was this worked out?** shows these steps with your own numbers. **Cycle insights**
shows the latest 12 completed intervals in a chart and table, oldest first. Tick **Incomplete**
when a cycle is missing logs. Its days stay in the calendar, but its length does not count toward
the next-period estimate, regularity or the date range. Its past fertility estimates are hidden.
The average period length still uses recorded bleeding days. Untick it to include the cycle again.
Changing an interval's start or end clears its marker, so an old choice cannot attach to a different
cycle. Tide backups keep these markers.

Settings → Data →
**Add to calendar** saves the next 3 expected period starts as all-day events in an `.ics` file,
made on your device. The events are marked private, so most shared calendars hide their details, and
they never mark you as busy. Each event is identified by its cycle number and a random id this
device makes on the first export, with no date in it, so importing a newer file moves the event
instead of adding a copy, and two people's events in one calendar stay apart. The id travels with a
backup, so a new device restored from one keeps updating the same events. Importing older history
renumbers the cycles, and deleting all data makes a new id: either way the next file adds new
events, and the old ones need deleting by hand.
Marking a cycle incomplete does not renumber calendar events.

To see how close the next-period estimate lands on real cycle data, read
[backtest.md](backtest.md).

The estimates are for information only. They are not a form of birth control.
