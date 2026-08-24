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

A still pool of cool water with white surfaces floating on it. Navigation, labels and
controls are calm teal and sea-grey; cards sit on a faint gradient ground under wide, soft
shadows. One warm colour interrupts that calm: coral, for the body's own signal and
nothing else. Sand and amber sit beside it, for the fertile window and ovulation.

Nothing hurries: generous corners, 160 ms transitions, and one expressive element, the
cycle dial on Today. Everything else recedes so the glance lands there first. Dark is the
same pool at night, retuned rather than inverted.

**Key Characteristics:**

- Cool, desaturated chrome; one warm signal colour with strict semantics.
- Generous radii and ambient shadows.
- Tracked uppercase eyebrows for structure; tabular numerals wherever a number can change.
- One signature component, the dial. Every other component is quiet.
- Light and dark are peers, tuned separately.

## Colors

### Primary

- **Tide Teal** (`tide`): navigation, links, focus rings, the active tab, hover washes at
  the 10% tint.
- **Deep Tide** (`tide-deep`): the wordmark, the dial's phase line, link text, selected
  chips. Carries white text at AA in both themes.
- **Tide Soft** / **Tide Tint**: the reminder prompt, and hover and active washes.

### Secondary

- **Coral** (`coral`): the bleeding signal and nothing else. Logged days, the log button,
  the dial's period arc, the dashed expected outline.
- **Coral Ink** (`coral-ink`): coral as text on light surfaces, where `coral-deep` at
  4.1:1 misses AA.
- **Flow ramp** (`flow-spotting` → `flow-light` → coral → `flow-heavy`): rising intensity.
  Heavy is its own step so the near-black number on it still clears AA.

### Tertiary

- **Amber** (`amber`): the ovulation day.
- **Sand** (`sand`): the fertile window.
- **Sea Idle** (`sea-idle`): the unremarkable stretch of the dial ring.

### Neutral

- **Ink**: body text and the dial numeral.
- **Soft Ink**: supporting prose, legends, secondary button text.
- **Muted Ink**: eyebrows, tab labels, dates. Darkened to clear 4.5:1 at small sizes.
- **Ink on Fill**: near-black text on coral, sand and amber. One value for both themes,
  because those fills stay light in both.
- **Surface** / **Soft Surface** / **Surface Border**: card white, inset panel, hairline.
- **Ground**: the page gradient under a radial teal halo.

### Named Rules

**The One Warm Voice Rule.** Coral means bleeding. It never marks a button, badge or accent
that isn't the period.

**The Paired Themes Rule.** Dark is not light inverted. Retune every fill and ink step for
the dark ground so `ink-on-fill` still clears AA on it.

## Typography

system-ui throughout, with ui-monospace for the version string alone. Deliberately
platform-native, so the app reads as part of the phone: structure comes from tracking and
case, not from a second family.

### Hierarchy

Eight tokens and nothing in between: `--text-xs` 0.7rem, `sm` 0.78, `md` 0.9, `base` 1,
`lg` 1.1, `xl` 1.25, `2xl` 2, `display` 3.5. Inside the dial each is `min(token, Ncqw)`, so
the type scales with the disc as the text setting grows.

- **Display**: the cycle-day numeral. One per screen.
- **Headline**: insight stat values.
- **Title**: the dial's phase line and date, fact values, drill-in rows, the reminder
  message. Buttons use `base` at 600.
- **Body**: supporting prose. Notes and legends drop to `md`.
- **Label**: section titles, fact labels, weekday headers. The screen title tracks wider
  at 0.16em; the dial eyebrow and tab labels use `xs`. Nothing visible goes below `xs`.

### Named Rules

**The Tracked Eyebrow Rule.** Structure labels are uppercase, muted ink and tracked
0.1–0.16em, never bold body text. One eyebrow per block.

**The Tabular Rule.** Any numeral that can change sets `tabular-nums`.

## Layout

A single centred column, 460 px at most, with 20 px gutters, over the full dynamic viewport
height. The header baseline-aligns the wordmark against the tracked screen title. Blocks
stack in a 16 px grid, and the main area pads its bottom past the fixed tab bar by 94 px
plus the safe-area inset.

The shell is a size container, so layout switches read the shell, not the viewport. Below
26em the theme control stacks under its label; below 19em its options stack too. The
calendar tightens its gaps below 400 px and trims the card's side padding below 350 px, and
its legend is a centred row that wraps. The dial is `min(17.5rem, 64vw)` and a container in
its own right.

## Elevation & Depth

Floating on water. Cards lift off the ground on wide, low-opacity shadows: the shadow and
the hairline border together are what make a card a card. Inside a card, depth steps down
tonally to `surface-soft` with no second shadow. The tab bar is the exception that proves
the rule: near-opaque with a hairline top edge, no blur, no lift.

### Shadow Vocabulary

Every lift is a token, retuned for dark.

- **Soft** (`--shadow-soft`): the dial ring, and only the dial ring.
- **Card** (`--shadow-card`): every card, and the active segmented option.
- **Coral glow** (`--shadow-glow`): the primary log button.
- **Knob** (`--shadow-knob`): the switch thumb, the dial marker, the ghost dot.
- **Scrim** (`--scrim`): the backdrop behind a dialog.

### Named Rules

**The One Lift Rule.** A card lifts once. Nested elements step down tonally instead of
casting a second shadow; the active segmented option is the only exception.

## Shapes

Everything is rounded, every radius is a token, and the corner grows with the block:

- **Pill**: chips, switches, markers, corner bubbles, the skip link.
- **Swatch** (5 px), **control** (10 px): legend swatches, and options inside a segmented
  track.
- **Field** (12 px): selects and inputs.
- **Segment** (14 px): the segmented track, tab items.
- **Button** (16 px): buttons and inset panels.
- **Prompt** (18 px): the reminder prompt.
- **Card** (20–22 px): the fact list, utility cards.

The dial is a circle. Calendar days are rounded squares; a day that has happened carries
its cycle-day number in a corner bubble, and an expected day gets a dashed coral outline
with no fill. The dash fades along the run; the number never does. Borders are 1 px
hairlines at 9% ink.

## Components

Values live in the front matter. What follows is what each component is *for*.

### Buttons

- **Primary**: coral, with the coral glow. One job only: logging bleeding when a bleed is
  plausible.
- **Quiet / Secondary**: surface and hairline, washing tide-tint on hover. The log button
  drops to this once the day is logged, and a pair of equal card actions (Export, Import)
  uses it in two columns that stack when the words stop fitting.
- **Commit**: solid deep tide, for the affirmative action in a confirm dialog. Never
  coral: coral means bleeding, not "this button matters".
- **Text action**: the quietest weight, used for Remove, Undo and Delete all data alike.
- Every interactive element takes a `2px solid tide` focus ring at 2 px offset and a 160 ms
  ease.

### Chips

A pill with an optional leading icon, filling deep tide when selected. **Status chips** are
the read-only members of the family: tide-tint for active, soft-surface for muted.

### Cards / Containers

Surface, hairline, one shadow; the slim variant trims the vertical rhythm. A card opens
with an eyebrow heading, optionally paired with an info affordance and a supporting line
grouped tightly beneath it. The **fact list** is a variant: tracked label left, value right
over a muted meta line, hairline-divided rows, chevron drill-in last.

### Inputs / Fields

- **Select and text input**: hairline on surface, teal focus outline, no border shift.
- **Segmented control**: a soft-surface track with the active option raised out of it as a
  white card. It stacks under its label, then stacks its own options, rather than dropping
  its words to icons.
- **Switch**: fills deep tide when on.
- **Flow gauge**: four radio steps, spotting to heavy, swatched from the flow ramp.

### Navigation

Three equal tabs, icon over label: muted ink inactive, deep tide on tide-tint active. The
header carries the wordmark left and the screen name right as a tracked eyebrow. A teal
skip link pins top-left on keyboard focus.

### Cycle Dial (signature)

An open circular gauge. A conic ring carries the phase colours (coral period arc at its
logged intensity, sand fertile window, amber ovulation, sea-idle for the rest), masked so
per-day ticks sit in a thin band at the rim. A white inner disc holds the eyebrow, numeral,
phase and date. An ink marker rings today; a teal ghost dot follows the finger while
scrubbing. Scrubbing previews any day and changes nothing. The legend names only the
colours the ring is actually showing.

### Calendar grid

Seven columns of rounded-square day buttons. Logged days fill with their flow-ramp colour,
expected days are dashed outlines, fertile and ovulation days fill sand and amber, and
neighbouring-month days keep their marker at a lighter fill. Today takes a short underscore
in `currentColor`, selection a teal ring. A newly logged day pulses once unless the user
asked for reduced motion. The grid is one tab stop, walked with arrow keys.

## Do's and Don'ts

### Do

- **Do** keep coral exclusive to bleeding.
- **Do** draw predictions as outlines and facts as fills. A user must never mistake one for
  the other.
- **Do** give every interactive element the `2px solid tide` focus ring and a 160 ms
  ease.
- **Do** key responsive switches to the shell container, not the viewport.
- **Do** set tabular numerals on anything that counts.
- **Do** size type and radii from the tokens. A new value means a new token.
- **Do** honour `prefers-reduced-motion` through the `a11y` layer.

### Don't

- **Don't** add a second accent, or use teal for alerts.
- **Don't** stack shadows inside a card; nested depth is tonal.
- **Don't** invert the light theme to make the dark one.
- **Don't** use a pill for anything but a small control. A sentence shaped like a control
  reads as a button that never answers.
- **Don't** introduce sharp corners, or radii under 10 px on anything larger than a 16 px
  swatch.
- **Don't** decorate around the dial. It is the only expressive element on Today.
