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

Tide is a still pool of cool water with white surfaces floating on it. The chrome (navigation,
labels, links, controls) is calm teal and sea-grey, the ground is a faint vertical gradient with
a lighter halo at the top as if lit from above, and cards sit on it with soft, wide shadows. Into
that calm, one warm colour is allowed: coral, reserved for the body's own signal. A logged
bleeding day, the log button, the predicted period; nothing else is ever coral. Two warmer
neighbours (sand for the fertile window, amber for ovulation) sit beside it on the dial and the
calendar and nowhere else.

Density is low and the pace is unhurried. Everything rounds generously, nothing snaps, eases are
160 ms. The one expressive element is the cycle dial on Today: a large open gauge with day ticks,
a floating marker, and a numeral the size of a headline. Everything else on every screen recedes
so that glance reads first.

The dark theme is the same pool at night: deep sea-charcoal ground, brighter teal, coral held
steady, warm fills retuned so the near-black number on them still clears AA.

**Key Characteristics:**

- Cool, desaturated chrome; one warm signal colour with strict semantics.
- Soft large radii (16–22 px on blocks, pills on chips) and ambient shadows.
- Tracked uppercase eyebrows for structure; tabular numerals wherever a number can change.
- A single signature component (the dial); all other components are quiet.
- Light and dark are peers, tuned separately, not inverted.

## Colors

A cool teal-and-grey pool with coral as the only warm voice, plus sand and amber as its two
permitted neighbours.

### Primary

- **Tide Teal** (`tide`): navigation, links, focus rings, active tab, hover washes (as the 10 %
  tint). The calm chrome accent.
- **Deep Tide** (`tide-deep`): wordmark, phase line in the dial, link text, selected-chip fill.
  Dark enough for white text at AA in both themes.
- **Tide Soft** / **Tide Tint**: the reminder prompt background and border; hover/active washes on
  tabs and secondary buttons.

### Secondary

- **Coral** (`coral`): the bleeding signal only. Logged days, the primary log button, period arc
  on the dial, dashed "expected" outlines. Hover deepens to **Deep Coral** (`coral-deep`).
- **Coral Ink** (`coral-ink`): coral as *text* on light surfaces (expected-period day numbers);
  deep enough for AA where `coral-deep` (4.1:1) is not.
- **Flow ramp** (`flow-spotting` → `flow-light` → coral → `flow-heavy`): a rising coral tide for
  intensity on calendar days and the dial. Medium is base coral; heavy is its own step, chosen so
  the near-black day number still clears AA on it.

### Tertiary

- **Amber** (`amber`): ovulation day, on the dial and calendar.
- **Sand** (`sand`): the fertile window.
- **Sea Idle** (`sea-idle`): the unremarkable part of the dial ring; translucent sea-grey.

### Neutral

- **Ink** (`ink`): body text and the dial numeral.
- **Soft Ink** (`ink-soft`): supporting prose, legend text, secondary button text.
- **Muted Ink** (`ink-muted`): eyebrows, tab labels, dates; darkened to clear 4.5:1 at small
  sizes.
- **Ink on Fill** (`ink-on-fill`): near-black text on coral/sand/amber fills, identical in both
  themes.
- **Surface** / **Soft Surface** / **Surface Border**: card white, inset panel, hairline.
- **Ground** (`ground-top` → `ground-bottom`): the page gradient under a radial teal halo.

### Named Rules

**The One Warm Voice Rule.** Coral means bleeding and nothing else. No coral on buttons, badges,
or accents that aren't the period. Sand and amber exist only beside it on the dial and calendar.

**The Paired Themes Rule.** Dark is not light inverted. Every warm fill and every ink step is
retuned for the dark ground so `ink-on-fill` still clears AA on it; never derive one theme from
the other with a filter.

## Typography

**Display Font:** system-ui (platform sans)
**Body Font:** system-ui (platform sans)
**Label/Mono Font:** ui-monospace, for the version string only

**Character:** Deliberately platform-native; the app reads as part of the phone. Structure comes
from tracking and case, not from a second family. Numerals are tabular everywhere a value can
change so the dial and calendar never jitter.

### Hierarchy

Eight tokens (`--text-xs` 0.7rem, `sm` 0.78, `md` 0.9, `base` 1, `lg` 1.1, `xl` 1.25, `2xl` 2,
`display` 3.5) and nothing in between. Inside the dial, sizes are `min(token, Ncqw)` so the type
scales with the disc at large text settings.

- **Display** (600, `display`, 0.86): the cycle-day numeral inside the dial. One per screen.
- **Headline** (600, `2xl`, 1): insight stat values (average cycle, period length, cycles tracked).
- **Title** (500, `lg`, 1.3): the phase line and date in the dial, fact values, card drill-in
  rows, the reminder message. Buttons use `base` at 600.
- **Body** (400, `base`, 1.5): supporting prose in cards; notes and legends use `md`.
- **Label** (600, `sm`, 0.1em tracking, uppercase): section titles, fact labels, weekday headers,
  the flow-gauge legend. The header screen title uses 0.16em; the dial eyebrow and tab labels use
  `xs`. Nothing visible is set below `xs` (11.2px).

### Named Rules

**The Tracked Eyebrow Rule.** Structure labels are uppercase, muted ink, tracked 0.1–0.16em,
never bold body text. One eyebrow per block.

**The Tabular Rule.** Any numeral that can change (day, count, stat) sets `tabular-nums`.

## Layout

A single centred column, max 460 px, with 20 px gutters, running the full dynamic viewport
height. The header is a baseline-aligned row (wordmark left, tracked screen title right). The
main area stacks blocks in a 16 px grid gap and pads the bottom by 94 px plus the safe-area inset
so nothing hides under the fixed tab bar. The tab bar is a three-column grid, fixed to the bottom,
460 px wide, blurred and near-opaque.

The shell is a container (`container-type: inline-size`), and layout switches key off it, not
the viewport: the calendar legend goes from a 2×2 grid to one row at 380 px of shell width. Below
400 px the calendar grid tightens its gap to 6 px; below 360 px chip buttons drop their labels to
icon-only.

The dial is `min(280px, 64vw)` square. Insight stats are a three-column grid with 10 px gaps.

## Elevation & Depth

Floating on water. Surfaces are white cards lifted off a gradient ground by wide, low-opacity
ambient shadows; the shadow is part of what makes a card a card, together with a hairline
border. Inside a card, depth steps down tonally to `surface-soft` (inset panels, segmented
tracks, stat tiles) with no further shadow. The dial ring carries the largest shadow in the
system, and the primary (coral) button carries a coral-tinted one.

### Shadow Vocabulary

All the lifts are tokens, each retuned for dark. The tab bar is a near-opaque surface with a
hairline; no blur.

- **Soft** (`--shadow-soft`): the dial ring only.
- **Card** (`--shadow-card`): every card, the logged-state card, and the active segmented option.
- **Coral glow** (`--shadow-glow`): the primary log button.
- **Knob** (`--shadow-knob`): the switch thumb, the dial marker and ghost dot.
- **Scrim** (`--scrim`): the insights dialog backdrop.

### Named Rules

**The One Lift Rule.** A card lifts once. Nested elements inside it use tonal steps, never a
second shadow; the single exception is the active segmented option. Logged calendar days carry no
shadow.

## Shapes

Everything is rounded; the radius scales with the block, and every radius is a token. Chips,
switches, markers, and bubbles are full pills; controls inside a segmented track and small
swatches use `control` (10 px; legend swatches under 16 px use `swatch`, 5 px); fields 12 px; the
segmented track and tab items 14 px; buttons and inset panels 16 px; the reminder prompt 18 px;
cards 20–22 px. The dial is a circle. Calendar days are rounded squares whose cycle-day bubble
sits in the top-right corner on days that have happened, and "expected" days are drawn as dashed
coral outlines with no fill (the dash fades along the run; the number never does) so a prediction
never looks like a fact. Borders are 1 px hairlines at 9 % ink.

## Components

### Buttons

- **Shape:** generously rounded (16 px), full width, 16 px vertical padding.
- **Primary:** coral fill, near-black text, coral glow shadow; hover deepens to deep coral. Used
  for exactly one thing: logging bleeding when a bleed is plausible.
- **Quiet / Secondary:** white surface, hairline border, soft-ink text at 500; hover washes
  tide-tint with deep-tide text and a teal border. The same log button drops to this variant once
  today is logged.
- **Text action:** no background, deep-tide text; hover lightens to tide.
- **Focus:** `2px solid tide` outline, 2 px offset, on every interactive element.
- **Motion:** 160 ms ease on background, border, colour, transform.

### Chips

- **Style:** pill, 9 × 15 px padding, 0.94rem, optional 16 px leading icon.
- **State:** unselected is surface with hairline; selected is deep-tide fill with white text;
  hover is the teal wash. Below 360 px shell width, labels hide and the chip becomes a round
  icon button.

### Status chips

Small pill badges: tide-tint with deep-tide text for active, soft-surface with soft ink for muted.

### Cards / Containers

- **Corner Style:** 22 px (utility cards) or 20 px (fact list).
- **Background:** surface; inset panels use surface-soft.
- **Shadow Strategy:** Card shadow plus hairline border (see Elevation).
- **Internal Padding:** 20 px, 14 px row gap; slim variant 15 px vertical, 11 px gap.
- **Fact list:** rows of tracked label left, title-weight value right with a muted meta line
  under it, separated by hairlines; last row is a drill-in with a chevron.

### Inputs / Fields

- **Style:** 46 px tall, 12 px radius, hairline border on surface.
- **Focus:** teal outline, no border-colour change.
- **Segmented control:** soft-surface track, 4 px inset, 1fr options at 38 px min height; the
  active option is a white card with a card shadow and deep-tide text.
- **Switch:** 46 × 28 pill; off is soft-surface with hairline, on is deep-tide (`accent-solid`)
  with a white thumb that travels 18 px.
- **Flow gauge:** a four-step radio group (spotting → heavy) whose swatches use the flow ramp.

### Navigation

- **Tab bar:** fixed bottom, blurred near-opaque bar with hairline top, three equal tabs: 23 px
  icon over a 0.7rem label. Inactive muted ink; active deep-tide on tide-tint in a 14 px rounded
  block; hover soft ink on tide-tint.
- **Header:** `tide` wordmark (1.2rem, 600, deep tide) left; screen name right as a tracked
  0.76rem uppercase eyebrow.
- **Skip link:** teal pill pinned top-left on keyboard focus.

### Cycle Dial (signature)

An open circular gauge: a conic ring of phase colours (coral period arc with flow intensity,
sand fertile window, amber ovulation, sea-idle rest) masked so per-day ticks sit in a thin band
on the outer rim, a white inner disc with eyebrow / display numeral / phase / date, a 20 px ink
marker with a white ring for today, and a teal-ringed ghost dot that follows the finger while
scrubbing. Scrubbing previews any day; the centre text updates live. Focus ring sits 6 px off the
circle. Legend below: 9 px dots with soft-ink labels.

### Calendar grid

Seven columns of rounded-square day buttons with tabular numerals. Logged days fill with the flow
ramp colour and a small white period-day bubble; predicted days are dashed coral outlines; fertile
and ovulation days fill sand and amber; outside-month days go muted; today is a 12 × 2 px
underscore in `currentColor`; selected is a teal ring. A newly logged day pulses once (450 ms,
suppressed under reduced motion).

## Do's and Don'ts

### Do

- **Do** keep coral exclusive to bleeding (logged, expected, the log button).
- **Do** draw predictions as outlines and facts as fills; a user must never mistake one for the
  other.
- **Do** give every interactive element the `2px solid tide` focus ring and a 160 ms ease.
- **Do** key responsive switches to the shell container, not the viewport.
- **Do** set tabular numerals on anything that counts.
- **Do** size type and radii from the tokens; a new value means a new token, not a new number.
- **Do** honour `prefers-reduced-motion` through the `a11y` layer; never opt a component out.

### Don't

- **Don't** add a second accent or use teal for alerts; the palette has one warm voice.
- **Don't** stack shadows inside a card; nested depth is tonal.
- **Don't** invert the light theme to make dark; retune each fill for the dark ground.
- **Don't** introduce sharp corners, or radii under 10 px on anything larger than a 16 px swatch.
- **Don't** add decoration around the dial; it is the only expressive element on Today.
