---
name: Tide
description: A privacy-first period tracker; calm teal chrome, one warm coral signal.
colors:
  tide: "#2f8f8a"
  tide-deep: "#1f6a65"
  tide-soft: "#d9ecea"
  tide-tint: "rgba(47, 143, 138, 0.1)"
  coral: "#e26d5a"
  coral-deep: "#cf5741"
  flow-heavy: "#d45d47"
  flow-spotting: "#f0c1b6"
  flow-light: "#e89a88"
  amber: "#e8a24b"
  periwinkle: "#e0e3f7"
  amber-line: "#b07d00"
  periwinkle-line: "#5d68c4"
  sea-idle: "rgba(84, 123, 121, 0.4)"
  danger: "#a32347"
  ink: "#14303a"
  ink-soft: "#486069"
  ink-muted: "#566d72"
  ink-on-fill: "#0c191e"
  ink-on-solid: "#ffffff"
  surface: "#ffffff"
  surface-soft: "#f1f7f7"
  surface-border: "rgba(20, 48, 58, 0.09)"
  ground-top: "#f5f9f9"
  ground-bottom: "#e4eef0"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 0.86
    fontVariation: "tabular-nums"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1
    fontVariation: "tabular-nums"
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.9rem"
    letterSpacing: "0.02em"
rounded:
  swatch: "5px"
  control: "10px"
  field: "12px"
  segment: "14px"
  button: "16px"
  prompt: "18px"
  card: "20px"
  card-lg: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "16px"
  xl: "20px"
  gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink-on-fill}"
    rounded: "{rounded.button}"
    padding: "16px 18px"
  button-primary-hover:
    backgroundColor: "{colors.coral-deep}"
  button-commit:
    backgroundColor: "{colors.tide-deep}"
    textColor: "{colors.ink-on-solid}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-commit-hover:
    backgroundColor: "{colors.tide}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.button}"
    padding: "16px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.tide-tint}"
    textColor: "{colors.tide-deep}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
  chip-selected:
    backgroundColor: "{colors.tide-deep}"
    textColor: "{colors.surface}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card-lg}"
    padding: "20px"
  segmented-option-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tide-deep}"
    rounded: "{rounded.control}"
    height: "38px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "46px"
  tab-active:
    backgroundColor: "{colors.tide-tint}"
    textColor: "{colors.tide-deep}"
    rounded: "{rounded.segment}"
    padding: "8px 0 6px"
---

# Design System: Tide

## Overview

**Creative North Star: "The Tide Pool"**

Picture a still pool of cool water with white surfaces floating on it. Navigation, labels
and controls are calm teal and sea-grey, and cards sit on a faint gradient ground under
wide, soft shadows. Only one warm colour breaks the calm: coral, for the body's own signal
and nothing else. Periwinkle and amber sit next to it, for the fertile window and ovulation.

Nothing is in a hurry: big rounded corners, 160 ms transitions, and one expressive element,
the cycle dial on Today. The dial leads and carries the next-period estimate in its
centre; the log block sits under it, in thumb reach. Dark mode is the same pool at night, tuned again rather than inverted.

**Key Characteristics:**

- Cool, muted chrome, and one warm signal colour with a strict meaning.
- Large corner radii and soft, spread-out shadows.
- Small uppercase labels with wide letter spacing (eyebrows) give the structure. Numbers
  that can change use tabular numerals.
- One signature component, the dial. Every other component stays quiet.
- Light and dark are equals, each tuned on its own.

## Colors

### Primary

- **Tide Teal** (`tide`): navigation, links, focus rings, the active tab, and hover washes
  at the 10% tint.
- **Deep Tide** (`tide-deep`): the wordmark, the dial's phase line, link text, selected
  chips. White text on it passes AA in both themes.
- **Tide Soft** / **Tide Tint**: the backup reminder, and hover and active washes.

### Secondary

- **Coral** (`coral`): bleeding, and nothing else. Logged days, the log button, the dial's
  period arc. The expected-period outline uses `coral-deep` in light and `coral` in dark.
- **Flow ramp** (`flow-spotting` → `flow-light` → coral → `flow-heavy`): rising intensity.
  Heavy gets its own step so the near-black number on it still passes AA.

### Tertiary

- **Amber** (`amber`): the ovulation estimate.
- **Periwinkle** (`periwinkle`): the fertile window.
- **Amber Line** / **Periwinkle Line** (`amber-line`, `periwinkle-line`): the same two estimates as
  outlines in the light theme, where amber and periwinkle are too pale for a line. A yellow dark
  enough for a 3:1 line turns brown, which is why the fertile window is a cool periwinkle, well apart from coral and the teal ring. Amber Line
  is a gold rather than an orange, so ovulation stays apart from the coral period. Dark uses
  amber and a brighter periwinkle themselves.
- **Sea Idle** (`sea-idle`): the ordinary days on the dial ring.

### Neutral

- **Ink**: body text and the dial numeral.
- **Soft Ink**: supporting text, legends, secondary button text.
- **Muted Ink**: eyebrows, tab labels, dates. Made darker so it passes 4.5:1 at small
  sizes.
- **Ink on Solid**: white, on the solid deep-tide fills (the commit button, a switch that
  is on). Deep tide stays deep in dark mode, so this stays white too.
- **Ink on Fill**: near-black text on coral, periwinkle and amber. One value for both themes,
  because those fills stay light in both.
- **Surface** / **Soft Surface** / **Surface Border**: card white, inset panel, hairline.
- **Ground**: the page gradient under a radial teal halo.

### Danger

- **Raspberry** (`danger`, `danger-ink`): erasing data, and nothing else. The Delete all
  data link and the confirm button of a dialog that erases (Delete, a replacing import).
  It is cooler than coral, so it never reads as bleeding. White text on the fill and the
  ink on the card pass AA in both themes; dark uses a lighter ink.

### Named Rules

**The One Warm Voice Rule.** Coral means bleeding. Never use it for a button, badge or
accent that isn't about the period.

**The Outline Rule.** Every estimate is a thin solid outline in its colour, never a full
fill: the expected period, the fertile window and ovulation, on the dial, the calendar and
both legends, in both themes. Only logged days get a full fill. No line is dashed: dashes in
several colours read as noise, and an outline against a full fill already tells an estimate
from a logged day. On the light calendar an estimated
day also takes a 10% wash of its colour (`--estimate-tint`), so a window reads as one band;
dark mode has none, because amber over the dark ground turns brown. The outline is the whole encoding:
an estimated day's number keeps its ordinary colour, so the expected period looks no more
certain than the fertile window. Each outline passes 3:1 against the card and the page
ground. Ovulation, the one peak day, takes a heavier line on the calendar (2.5 px; legend
swatches keep 1.5 px) and a wash of amber, so it differs from the period estimate by weight as
well as hue.

**The Paired Themes Rule.** Dark is not light inverted. Tune every fill and ink step again
for the dark ground, so `ink-on-fill` still passes AA on it. The values above are the
light theme; `src/styles/tokens.css` holds the dark set under `[data-theme="dark"]`.

## Typography

system-ui everywhere, with ui-monospace only for the version string. I chose the
platform's own font on purpose, so the app feels like part of the phone. Structure comes
from letter spacing and case, not from a second font.

### Hierarchy

Eight tokens and nothing in between: `--text-xs` 0.7rem, `sm` 0.78, `md` 0.9, `base` 1,
`lg` 1.1, `xl` 1.25, `2xl` 2, `display` 3.5. Inside the dial each is `min(token, Ncqw)`, so
the text scales with the disc when the text size setting goes up.

- **Display**: the cycle-day numeral. One per screen.
- **Headline**: insight stat values.
- **Title**: the dial's phase line and date, fact values, drill-in rows, the reminder
  message. Buttons use `base` at 600.
- **Body**: supporting text. Notes and legends drop to `md`.
- **Label**: section titles, fact labels, weekday headers. The screen title spaces wider,
  at 0.16em. The dial eyebrow and tab labels use `xs`. Nothing visible goes below `xs`.

### Named Rules

**The Tracked Eyebrow Rule.** Structure labels are uppercase, in muted ink, with 0.1 to
0.16em letter spacing. Never bold body text. One eyebrow per block. The one exception is
a label in a tight tile or column (the insights stat labels, the calendar weekdays): it
keeps 0.06em.

**The Tabular Rule.** Any numeral that can change uses `tabular-nums`.

**The Whole Word Rule.** Headings, labels and buttons never hyphenate. A long compound
carries soft hyphens between its parts in the dictionary, and breaks only there. Running
text (paragraphs, list items, fact values) hyphenates as usual.
Bottom navigation permits emergency wrapping when enlarged text cannot fit a whole label,
so every destination remains visible and usable on a narrow screen.

## Layout

One centred column, 460 px at most, with 20 px gutters, over the full dynamic viewport
height. The header lines up the wordmark's baseline with the screen title. Blocks stack on
a 16 px grid, and the main area adds bottom padding of 94 px plus the safe-area inset, so
nothing hides behind the fixed tab bar.
Scroll padding also leaves room above the tab bar when a control receives keyboard focus.

The shell is a size container, so layout changes follow the shell, not the viewport. Below
28em the theme control moves under its label, and below 24em its options stack too. The
calendar tightens its gaps below 400 px, where the weekday headers also drop to one
letter (screen readers get the full name), and trims the card's side padding below 350 px.
Its legend is a caption under the grid: a left-aligned row that wraps, so the wrap at 320 px
reads as the list going on. Legend labels are the short names ("Fertile", not "Fertile
window"), so the row fits one line at 390 px in every language. The dial's larger legend
never fits one row on a phone, so it is two even rows of two. The dial is
`min(17rem, 70vw, 34dvh, 100%)`, capped by height so the log block stays above the tab bar on
a short phone, and is a container itself. So are the fact rows: below 22em each label sits above its value. A
switch row keeps its switch beside the label's first line and lets the label wrap.

## Elevation & Depth

Floating on water. Cards lift off the ground on wide, faint shadows: the shadow and the
hairline border together are what make a card. Inside a card, depth steps down by colour to
`surface-soft`, with no second shadow. The tab bar is the one exception: nearly opaque, with
a hairline top edge, no blur and no lift.

### Shadow Vocabulary

Every shadow is a token, tuned again for dark.

- **Soft** (`--shadow-soft`): the dial ring, and the layers that float over a screen:
  dialogs and the info popover.
- **Card** (`--shadow-card`): every card, and the active segmented option.
- **Coral glow** (`--shadow-glow`): the primary log button.
- **Knob** (`--shadow-knob`): the switch thumb, the dial marker, the ghost dot.
- **Scrim** (`--scrim`): the backdrop behind a dialog. A flat tint, never a blur.

### Named Rules

**The One Lift Rule.** A card lifts once. Elements inside it step down by colour instead of
casting a second shadow. The active segmented option is the only exception.

## Shapes

Everything is rounded, every radius is a token, and bigger blocks get bigger corners:

- **Pill**: chips, switches, markers, the skip link.
- **Swatch** (5 px), **control** (10 px): legend swatches, and options inside a segmented
  track.
- **Field** (12 px): selects and inputs.
- **Segment** (14 px): the segmented track, tab items.
- **Button** (16 px): buttons and inset panels.
- **Prompt** (18 px): the backup reminder.
- **Card** (20–22 px): the fact list, utility cards.

The dial is a circle. A calendar day with nothing on it is a bare number; only logged,
estimated and selected days get a rounded square. A day that has happened shows its
cycle-day number small and muted inside the top corner, with no bubble, so it never reads as
an unread count. An estimated day gets a 1.5 px outline and, in light mode, a faint wash. Borders are 1 px hairlines at 9% ink.

## Components

The values are in the front matter. This section says what each component is *for*.

### Buttons

- **Primary**: coral, with the coral glow. It has one job: logging bleeding when a bleed is
  plausible.
- **Quiet / Secondary**: surface and hairline, with a tide-tint wash on hover. The log
  button uses it when no bleed is expected. A pair of equal card actions (Export,
  Import) uses it in two columns, which stack when the words stop fitting.
- **Commit**: solid deep tide, for the confirming action in a dialog. Never coral: coral
  means bleeding, not "this button matters". A confirm that erases data is raspberry, and
  its dialog offers "Download a backup first" above the buttons.
- **Text action**: the quietest style, used for Remove, Undo and "Log a past period"
  alike. When it stands alone under the calendar it keeps a 44 px touch target. Delete all
  data is the one text action in raspberry, alone under the Data card's last hairline,
  at 44 px.
- Every interactive element gets a `2px solid tide` focus ring at 2 px offset and a 160 ms
  ease.

### Log block

After the dial or first-use card comes one log block, in the same slot in every state, with no card. When a
period is expected or late, the question "Has your period started?" sits above the log
button and "Not yet" below it. The dial already names the date, so the question doesn't
repeat it. One tap logs bleeding and opens the shared dated editor. On a later visit,
the compact logged line ends in "Add flow" or "Change" and opens that editor again.
When no bleeding history exists, "Log a past period" below the log line opens Calendar.
Both actions remain above the tabs on a short phone during first use.

**Details** shares the compact log line: a quiet button of the same height. On a line
narrower than 23em it keeps only its icon. A tide dot marks a day that has details.
It opens the same editor with **More details** expanded, without logging bleeding.

On larger screens the editor replaces Today's log line and opens below Calendar's legend. One heading
names the date; flow comes first, with "Not bleeding that day" to remove a log.
Symptoms, mood and notes sit under a native **More details** disclosure. Chips save on
tap and notes save as you type. Clearing details offers Undo. The top-right × and Escape
close the panel; it stays open while editing or removing bleeding. Calendar's grid owns
the date, with no competing date field. While the editor is open, a grid tap changes its
date and preserves the disclosure without logging bleeding. Selecting a diary-only date
opens its saved details; tapping the selected day keeps the panel open. With the editor
closed, any available day opens it without recording bleeding.
Logging is explicit inside the panel. A notebook icon marks a day with saved details;
diary-only days open with their details expanded. The note counter and save status share
one compact footer row; no empty action rows reserve space.
Both screens use the same controls. On phone viewports up to 600 px wide and at least 480 px
high, the editor floats above the tab bar as a nonmodal sheet. Its dated header and × stay
visible while expanded details scroll inside the body. Calendar days remain tappable, with
the selected week revealed above the sheet. The sheet accounts for the tab bar's actual
height, safe areas and the visual viewport when the keyboard opens. Larger screens and very
short landscape windows retain the inset panel. Enlarged text may require inner scrolling;
controls stay reachable rather than being compressed to fit.

### Chips

A pill with an optional icon in front, filled with deep tide when selected. **Status
chips** are the read-only kind: tide-tint for active, soft-surface for muted.

### Cards / Containers

Surface, hairline, one shadow. The slim variant uses tighter vertical spacing. A card opens
with an eyebrow heading, optionally with an info button and a supporting line close
beneath it. The **fact list** is a variant: tracked label on the left (above, on phones),
value on the right over a muted meta line, rows split by hairlines, and a chevron for
drilling in at the end.

The Settings **Data card** splits its jobs with hairlines, not extra cards: backup and
import, then calendar export, then Delete all data. Each message appears under the action
that caused it. Once days are logged, the privacy sentence becomes one shield line: how
many days there are, that they are not uploaded, and when the last backup was. Export and
Import carry a muted second line naming what they take. The calendar group opens with a
plain "Calendar file" title and its note, and its options sit in one soft-surface inset
above the Add to calendar button. Each option leads with the calendar legend's own swatch,
so it shows what it adds; the 3 / 6 / 12 count is a small segmented control beside its
label, under it only on the narrowest screens.

### Inputs / Fields

- **Select and text input**: hairline on surface, teal focus outline, and the border
  doesn't move.
- **Segmented control**: a soft-surface track, with the active option raised out of it as a
  white card. When space runs out it moves under its label and then stacks its own options,
  rather than swapping its words for icons.
- **Switch**: muted-ink border and thumb on soft surface when off; deep-tide fill and
  white thumb when on.
- **Flow gauge**: four radio steps, spotting to heavy, coloured from the flow ramp.
  Two equal columns keep long labels and enlarged text readable in the shared editor.

### Navigation

Three equal tabs, icon over label: muted ink when inactive, deep tide on tide-tint when
active. The header has the wordmark on the left and the screen name on the right as a
tracked eyebrow. A teal skip link appears top-left on keyboard focus.

### Cycle Dial (signature)

An open circular gauge. A conic ring fills logged days in coral at their logged intensity,
and the ordinary days in sea-idle. Estimated days (fertile window, ovulation, the expected
next period) fill the same band with a pale wash of their colour, mixed with the card
colour so it stays a clean pastel, and a second layer draws thin rails along the band's
inner and outer edge. That is the dial's version of the calendar's outline. The band
stays one continuous ring; small ticks at the rim count the days. In dark mode ovulation
keeps the fertile wash under its amber rails, because amber over the dark ground turns brown.
Small per-day ticks sit in a thin band at the rim. A white inner disc holds, at rest, the
estimate: an eyebrow ("Next period", or "Period" when late), "In 19 days" as the screen's
headline, the date, and a small "Day 10 · Between periods" line (only the day when late).
After the introduction is dismissed, a dial without history holds its logging hint instead. While you scrub it shows the
previewed day: eyebrow, numeral, phase and date. Text inside the slider is not read out, so
the same estimate sits in a visually hidden line before it. An ink marker circles today, and a teal ghost dot follows your
finger while you scrub. Scrubbing previews any day and changes nothing. The legend only
names the colours the ring is actually showing.

Three motions, each tied to something you do, and none under reduced motion: on the first
view of the day the band fills clockwise from the top (600 ms), then its ticks, rails and
marker fade in; after a scrub the ghost dot glides back to today (300 ms); logging today
sends one thin ring out from the marker (450 ms). The sweep is remembered in memory only,
so it adds nothing to what Tide stores.

### First-use introduction

A compact utility card sits above the log block until skipped or the first log/import.
While it is visible without a forecast, it replaces the empty dial so logging stays above
the tabs at 320 × 568. Its heading and close control share a row. Privacy, import and the
backup/install habit are visible; a native disclosure holds the optional fertility choice.
The card keeps the existing surface and teal controls. Skip restores focus to logging
without choosing fertility estimates. Returning installations do not see the introduction.

### Calendar grid

Seven columns of rounded-square day buttons. Logged days fill with their flow-ramp colour.
Expected, fertile and ovulation days are fine outlines in coral, periwinkle and amber,
washed at 10% in light mode. Logged days from the next or previous month keep a lighter fill. Their estimates keep
the full outline, because a lighter one would drop below 3:1. Today gets a short underscore
in `currentColor`, and the selected day a teal ring. The grid is one tab stop, and you move through it with
the arrow keys. Logging a past period uses the same grid: the first day you pick keeps the
selection ring until you pick the last day, and a status line under the grid says what
comes next. Under the legend, "Log a past period" starts range logging. Every day opens
the dated editor, so no separate Details button or date-history list is needed.
The first-use hint lasts until a bleeding day or range is logged on Calendar. Future
months keep their separate hint. A completed range shows one confirmation with Undo,
including any forecast update in its first render. It clears after ten seconds, pausing
while hovered or while Undo has focus; the saved log remains.

### Backup reminder

A teal-tinted prompt card on Today, with a plain heading and supporting text.
The download action uses the secondary button; snooze uses the quiet dismiss action.
Keep backup actions free of coral. A failed download shows an alert below the actions.

### Cycle history

Inside Cycle insights, separate history with a hairline rather than another card: up to
twelve completed cycles as a quiet chart above a two-column table. The maths comes last,
under its own hairline, as one closed disclosure. "How was this worked out?" holds the
personal sums behind the next-period date, then only the rules those sums don't show with
real numbers (what starts a cycle, the period-length limits). Without a forecast it is
"How predictions work" with the general rules.
Use teal dots for ordinary cycles and ink crosses for cycles marked incomplete, with a
matching legend. The chart gives the overview; the table supplies every date and length
and remains available to screen readers. Put the incomplete checkbox below each start
date, with a 44 px label target. Labels and dates wrap inside the table's fixed columns.

### Documents

The privacy and accessibility statements open from Settings > About, as drill-in rows that
say "In English" in the other languages. They render inside the shell: the header names the
page, Settings stays the active tab, and a "‹ Settings" link at the top goes back without a
reload. The Markdown sits on one card, in the type scale: `xl` and `lg` headings at 600,
body at 1.5 line height. There is no footer on any screen.

## Do's and Don'ts

### Do

- **Do** base responsive changes on the shell container, not the viewport.
- **Do** take type sizes and radii from the tokens. A new value needs a new token.
- **Do** respect `prefers-reduced-motion` through the `a11y` layer.

### Don't

- **Don't** add a second accent colour, or use teal for alerts.
- **Don't** use a pill for anything but a small control. A sentence shaped like a control
  looks like a button that never responds.
- **Don't** add sharp corners, or radii under 10 px on anything larger than a 16 px
  swatch.
- **Don't** decorate around the dial. It is the only expressive element on Today.
