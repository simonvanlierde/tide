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
  coral-ink: "#b8452f"
  flow-heavy: "#d45d47"
  flow-spotting: "#f0c1b6"
  flow-light: "#e89a88"
  amber: "#e8a24b"
  sand: "#f4d6a8"
  amber-line: "#c2610f"
  sand-line: "#8a7a20"
  sea-idle: "rgba(84, 123, 121, 0.4)"
  ink: "#14303a"
  ink-soft: "#486069"
  ink-muted: "#566d72"
  ink-on-fill: "#0c191e"
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
and nothing else. Sand and amber sit next to it, for the fertile window and ovulation.

Nothing is in a hurry: big rounded corners, 160 ms transitions, and one expressive element,
the cycle dial on Today. Everything else stays in the background so the eye lands there
first. Dark mode is the same pool at night, tuned again rather than inverted.

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
- **Tide Soft** / **Tide Tint**: the reminder prompt, and hover and active washes.

### Secondary

- **Coral** (`coral`): bleeding, and nothing else. Logged days, the log button, the dial's
  period arc. The dashed expected outline uses `coral-deep` in light and `coral` in dark.
- **Coral Ink** (`coral-ink`): coral for text on light surfaces, where `coral-deep` at
  4.1:1 fails AA.
- **Flow ramp** (`flow-spotting` → `flow-light` → coral → `flow-heavy`): rising intensity.
  Heavy gets its own step so the near-black number on it still passes AA.

### Tertiary

- **Amber** (`amber`): the ovulation estimate.
- **Sand** (`sand`): the fertile window.
- **Amber Line** / **Sand Line** (`amber-line`, `sand-line`): the same two estimates as
  outlines in the light theme, where amber and sand are too pale for a line. Dark uses
  amber and sand themselves.
- **Sea Idle** (`sea-idle`): the ordinary days on the dial ring.

### Neutral

- **Ink**: body text and the dial numeral.
- **Soft Ink**: supporting text, legends, secondary button text.
- **Muted Ink**: eyebrows, tab labels, dates. Made darker so it passes 4.5:1 at small
  sizes.
- **Ink on Fill**: near-black text on coral, sand and amber. One value for both themes,
  because those fills stay light in both.
- **Surface** / **Soft Surface** / **Surface Border**: card white, inset panel, hairline.
- **Ground**: the page gradient under a radial teal halo.

### Named Rules

**The One Warm Voice Rule.** Coral means bleeding. Never use it for a button, badge or
accent that isn't about the period.

**The Outline Rule.** Every estimate is a dashed outline in its colour, with no fill: the
expected period, the fertile window and ovulation, on the dial, the calendar and both
legends, in both themes. Only logged days get a fill. Each outline passes 3:1 against the
card and the page ground.

**The Paired Themes Rule.** Dark is not light inverted. Tune every fill and ink step again
for the dark ground, so `ink-on-fill` still passes AA on it.

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
0.16em letter spacing. Never bold body text. One eyebrow per block.

**The Tabular Rule.** Any numeral that can change uses `tabular-nums`.

## Layout

One centred column, 460 px at most, with 20 px gutters, over the full dynamic viewport
height. The header lines up the wordmark's baseline with the screen title. Blocks stack on
a 16 px grid, and the main area adds bottom padding of 94 px plus the safe-area inset, so
nothing hides behind the fixed tab bar.

The shell is a size container, so layout changes follow the shell, not the viewport. Below
26em the theme control moves under its label, and below 24em its options stack too. The
calendar tightens its gaps below 400 px and trims the card's side padding below 350 px.
Its legend is a centred row that wraps. The dial is `min(17.5rem, 64vw)` and is a
container itself.

## Elevation & Depth

Floating on water. Cards lift off the ground on wide, faint shadows: the shadow and the
hairline border together are what make a card. Inside a card, depth steps down by colour to
`surface-soft`, with no second shadow. The tab bar is the one exception: nearly opaque, with
a hairline top edge, no blur and no lift.

### Shadow Vocabulary

Every shadow is a token, tuned again for dark.

- **Soft** (`--shadow-soft`): the dial ring, and only the dial ring.
- **Card** (`--shadow-card`): every card, and the active segmented option.
- **Coral glow** (`--shadow-glow`): the primary log button.
- **Knob** (`--shadow-knob`): the switch thumb, the dial marker, the ghost dot.
- **Scrim** (`--scrim`): the backdrop behind a dialog.

### Named Rules

**The One Lift Rule.** A card lifts once. Elements inside it step down by colour instead of
casting a second shadow. The active segmented option is the only exception.

## Shapes

Everything is rounded, every radius is a token, and bigger blocks get bigger corners:

- **Pill**: chips, switches, markers, corner bubbles, the skip link.
- **Swatch** (5 px), **control** (10 px): legend swatches, and options inside a segmented
  track.
- **Field** (12 px): selects and inputs.
- **Segment** (14 px): the segmented track, tab items.
- **Button** (16 px): buttons and inset panels.
- **Prompt** (18 px): the reminder prompt.
- **Card** (20–22 px): the fact list, utility cards.

The dial is a circle. Calendar days are rounded squares. A day that has happened shows its
cycle-day number in a corner bubble, and an estimated day gets a 2 px dashed outline with
no fill. Borders are 1 px hairlines at 9% ink.

## Components

The values are in the front matter. This section says what each component is *for*.

### Buttons

- **Primary**: coral, with the coral glow. It has one job: logging bleeding when a bleed is
  plausible.
- **Quiet / Secondary**: surface and hairline, with a tide-tint wash on hover. The log
  button switches to this once the day is logged. A pair of equal card actions (Export,
  Import) uses it in two columns, which stack when the words stop fitting.
- **Commit**: solid deep tide, for the confirming action in a dialog. Never coral: coral
  means bleeding, not "this button matters".
- **Text action**: the quietest style, used for Remove, Undo, Delete all data and "Log a
  past period" alike. When it stands alone under the calendar it keeps a 44 px touch
  target.
- Every interactive element gets a `2px solid tide` focus ring at 2 px offset and a 160 ms
  ease.

### Chips

A pill with an optional icon in front, filled with deep tide when selected. **Status
chips** are the read-only kind: tide-tint for active, soft-surface for muted.

### Cards / Containers

Surface, hairline, one shadow. The slim variant uses tighter vertical spacing. A card opens
with an eyebrow heading, optionally with an info button and a supporting line close
beneath it. The **fact list** is a variant: tracked label on the left, value on the right
over a muted meta line, rows split by hairlines, and a chevron for drilling in at the end.

### Inputs / Fields

- **Select and text input**: hairline on surface, teal focus outline, and the border
  doesn't move.
- **Segmented control**: a soft-surface track, with the active option raised out of it as a
  white card. When space runs out it moves under its label and then stacks its own options,
  rather than swapping its words for icons.
- **Switch**: fills with deep tide when on.
- **Flow gauge**: four radio steps, spotting to heavy, coloured from the flow ramp.

### Navigation

Three equal tabs, icon over label: muted ink when inactive, deep tide on tide-tint when
active. The header has the wordmark on the left and the screen name on the right as a
tracked eyebrow. A teal skip link appears top-left on keyboard focus.

### Cycle Dial (signature)

An open circular gauge. A conic ring fills logged days in coral at their logged intensity,
and the ordinary days in sea-idle. Estimated days (fertile window, ovulation, the expected
next period) stay hollow: a second layer draws them as dashed rails along the inner and
outer edge of the band. That is the dial's version of the calendar's dashed outline.
Small per-day ticks sit in a thin band at the rim. A white inner disc holds the eyebrow,
numeral, phase and date. An ink marker circles today, and a teal ghost dot follows your
finger while you scrub. Scrubbing previews any day and changes nothing. The legend only
names the colours the ring is actually showing.

### Calendar grid

Seven columns of rounded-square day buttons. Logged days fill with their flow-ramp colour.
Expected, fertile and ovulation days are dashed outlines in coral, sand and amber, with no
fill. Logged days from the next or previous month keep a lighter fill. Their estimates keep
the full outline, because a lighter one would drop below 3:1. Today gets a short underscore
in `currentColor`, and the selected day a teal ring. A newly logged day pulses once, unless
the user asked for reduced motion. The grid is one tab stop, and you move through it with
the arrow keys. Logging a past period uses the same grid: the first day you pick keeps the
selection ring until you pick the last day, and a status line under the grid says what
comes next.

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
