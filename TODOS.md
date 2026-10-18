# TODOs

- Calendar weekday headers split mid-word on narrow shells ("MO / N" at 320 px with a
  wide system font, every locale at 280 px). Columns are 26 to 34 px, too narrow for three
  letters, so CSS alone can't fix it: switch the headers to the narrow `Intl` weekday
  format ("M", "T") below the 400 px container step, in `calendar.ts` / `CalendarGrid.tsx`.
  The overflow e2e test fails if the headers are made `nowrap` instead.
