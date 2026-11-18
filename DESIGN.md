---
name: M&M Websites
description: The key board. Websites for local service businesses, built, hosted and kept up to date for them.
colors:
  steel: "#d8ded5"
  steel-deep: "#cdd5ca"
  pegboard: "#c6cfc4"
  enamel-plate: "#eef1ec"
  enamel-band: "#1c2925"
  on-enamel: "#e7ece5"
  on-enamel-muted: "#a9b6ae"
  ink: "#14201b"
  ink-soft: "#2f3e38"
  ink-muted: "#4a5a53"
  field: "#ffffff"
  field-border: "#6f7d76"
  metal-light: "#b9c1bc"
  metal-mid: "#8a948f"
  metal-dark: "#5f6964"
  tag-yellow: "#f2c230"
  tag-yellow-press: "#e7b51c"
  tag-cobalt: "#2148c9"
  tag-green: "#17773b"
  tag-tomato: "#c63a21"
  after-hours-steel: "#141b18"
  after-hours-pegboard: "#3a4742"
  after-hours-ink: "#e7ece5"
  after-hours-link: "#8fb0ff"
typography:
  display:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(2.5rem, 7vw + 0.9rem, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "0em"
  section-title:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw + 1.2rem, 4.6rem)"
    fontWeight: 800
    lineHeight: 0.95
  tag-number:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 2vw + 1.4rem, 2.6rem)"
    fontWeight: 900
    lineHeight: 0.9
  heading:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(1.6rem, 1vw + 1.3rem, 1.95rem)"
    fontWeight: 800
    lineHeight: 0.95
  lede:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.6vw + 1.05rem, 1.45rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 0.3vw + 1rem, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  s: "6px"
  m: "10px"
  l: "16px"
  tag: "1.4rem 1.4rem 0.7rem 0.7rem"
  key-button: "0.35rem 1.8rem 1.8rem 0.35rem"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
  s-9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.tag-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key-button}"
    padding: "12px 18px 12px 42px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.tag-yellow-press}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "12px 22px"
    height: "48px"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.steel}"
  key-tag:
    backgroundColor: "{colors.tag-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "37px 10px 16px"
  enamel-plate:
    backgroundColor: "{colors.enamel-plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.l}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.s}"
    height: "48px"
  chip:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "0.5rem 1.4rem 1.4rem 0.5rem"
    height: "44px"
  chip-checked:
    backgroundColor: "{colors.tag-yellow}"
    textColor: "{colors.ink}"
---

# Design System: M&M Websites

## Overview

**Creative North Star: "The key board"**

The site is the key board on a service shop's wall. Owners hand M&M the keys to their website, domain, hosting and updates, and every job hangs numbered on a hook. That one picture carries the business model: M&M holds and runs everything, and the client never has to touch it. The look is practical, shop-floor and plain-spoken: signage rather than editorial, steel and enamel rather than paper.

The ground is pale hammertone steel. Pegboard panels carry the four key tags (yellow, cobalt, green, tomato), which are the only saturated colours on the site. Dark enamel bands hold the work and the footer. Big Shoulders, a condensed signage face, sets the headline and the numbers; Overpass, a highway-sign sans, sets everything else.

The dark theme is the same board after hours: painted steel goes deep grey-green, the pegboard stays a visible mid steel, and the tags keep their colours.

**Key Characteristics:**
- Die-cut key tags with a punched hole and a split ring, hanging from steel hooks on a rail.
- Stencil-cut numbers on job and tag numbers.
- Hammertone noise on steel and pegboard surfaces; enamel plates for forms and checkout.
- One drenched field per page (the yellow Why band).
- One authored motion: tags drop onto their hooks and swing when touched.

## Colors

Four tag colours on cool grey-green steel, with dark enamel for weight.

### Primary
- **Tag Yellow** (`#f2c230`): primary actions, the first tag, the Why band, job numbers on enamel. Ink text only (10:1).

### Secondary
- **Tag Cobalt** (`#2148c9`): the second tag and, as text, every link and focus ring on light surfaces (5.4:1 on steel).

### Tertiary
- **Tag Green** (`#17773b`) and **Tag Tomato** (`#c63a21`): the third and fourth tags. Tomato also marks errors and required fields; green confirms (the "Copied" state).

### Neutral
- **Steel** (`#d8ded5`) is the page; **Deep Steel** (`#cdd5ca`) alternates sections; **Pegboard** (`#c6cfc4`) fills the boards; **Enamel Plate** (`#eef1ec`) carries forms and checkout; **Enamel Band** (`#1c2925`) holds Work and the footer.
- **Ink** (`#14201b`, 12:1 on steel), **Ink Soft** (`#2f3e38`) and **Ink Muted** (`#4a5a53`, 5.3:1) are the three text levels.
- **Metals** (`#b9c1bc`, `#8a948f`, `#5f6964`) draw hooks, rails and rings.

### Named Rules
**The Four Tags Rule.** Saturated colour appears only as a key tag, a primary action or the one drenched band. Everything else is steel, enamel or ink.

**The Ink On Yellow Rule.** Yellow always carries ink text, never white.

## Typography

**Display Font:** Big Shoulders (variable, 800–900), with Arial Narrow and Roboto Condensed as fallbacks.
**Body Font:** Overpass (variable), with the system sans as fallback.

**Character:** Condensed signage over a highway-sign sans. The display face does the shouting in uppercase; the text face stays calm and readable.

### Hierarchy
Eight steps, ratio about 1.25, all in `--fs-1 … --fs-8`:
- **Hero** (900, `--fs-8`, 40–96px, line-height 0.86, uppercase).
- **Section title** (800, `--fs-7`, 40–74px, uppercase).
- **Project name, big prices** (900, `--fs-6`, 40–70px).
- **Tag numbers, ledger titles** (900, `--fs-5`, 32–42px, tabular).
- **Headings and names** (800, `--fs-4`, 26–31px, mixed case).
- **Lede** (Overpass 700, `--fs-3`, 20–23px).
- **Body** (Overpass 400, `--fs-2`, 17–19px, line-height 1.6, measure under 75 characters).
- **Small** (Overpass 600, `--fs-1`, 15px): notes, captions, tag notes, labels.

### Named Rules
**The Shout Once Rule.** Uppercase belongs to the hero and section titles only. Headings, names and labels stay in mixed case.

**The Stencil Rule.** Job, tag and price numbers carry a thin stencil bridge across the middle (a mask cut), so they read as stamped onto the tag.

## Layout

One 1200px container with fluid gutters (`clamp(1rem, 4vw, 2.5rem)`, plus safe-area insets). Sections use `--section` padding throughout. The hero is a two-column split at 980px and up (copy | key board); the key board drops below the copy on phones. Spacing comes from a 4px scale (`--s-1 … --s-9`). Grids use `minmax(0, 1fr)` tracks so long content wraps instead of overflowing.

## Elevation & Depth

Objects hang in front of steel; nothing floats. Depth comes from a top light: tags and buttons carry an inset highlight on top, an inset shade at the bottom, and a soft drop shadow beneath. Panels lift with a long, soft shadow.

### Shadow Vocabulary
- **e-1** (`0 1px 2px …/.1, 0 3px 8px -4px …/.18`): small raised controls.
- **e-tag** (inset top highlight, inset bottom shade, `0 16px 20px -14px …/.55`): key tags, primary buttons, ledger tags.
- **e-3** (`0 2px 4px …/.1, 0 32px 60px -34px …/.55`): pegboard panels and the job tag.

### Named Rules
**The Top Light Rule.** Every shadow uses the ink hue (`--shadow-rgb`) and falls straight down. No hard offset shadows, no glows.

## Shapes

Three container radii (`6px` inputs and outline buttons, `10px` buttons and plates, `16px` panels and the form). Tags are a drawn object, so they have their own shape: rounded top, tighter bottom (`--r-tag`). The primary button is a tag lying on its side: a squared hanging end with a punched hole, a rounded far end.

## Components

### Buttons
- **Primary (key button):** Tag Yellow, ink text, Overpass 800, 48px tall, punched hole pinned to the left end, radius `0.35rem 1.8rem 1.8rem 0.35rem`. Hover darkens to `#e7b51c` and lifts 1px; press scales to 0.97 in 60ms.
- **Line:** 2px ink outline, inverts to ink on hover. On enamel: `.btn--paper` (light fill) and `.btn--line-dark`.
- **Ink:** solid ink, used for the form submit only.

### Chips
Tag-shaped (`0.5rem 1.4rem 1.4rem 0.5rem`) with a small punched hole, 44px tall, the native checkbox stretched over the whole chip. Checked turns yellow with ink text.

### Cards / Containers
- **Pegboard panel:** Pegboard fill, a 24px grid of punched holes with a light lower lip, hammertone noise, `16px` radius, `e-3`.
- **Enamel plate:** Plate fill, `16px` radius; the form plate has rivets in its corners.

### Inputs / Fields
White fields with a 2px `#6f7d76` border (4.3:1), `6px` radius, 48px tall, 17px+ text. Focus swaps the border to cobalt with a 4px cobalt ring. Errors: tomato border, an icon and a message under the field.

### Navigation
Sticky masthead on translucent steel, 61px on phones and 69px on desktop. Nav links are 44px rows; the current section gets a yellow bar. On phones a Menu button opens a dropdown; the page behind goes inert and stops scrolling.

### Key Tag (signature)
A colour tag with a 0.95rem punched hole (filled with the panel colour), a metal split ring through it and a hook above, on a metal rail. Big stencil number, name, one-line note. Tags rest a degree or two off level. `transform-origin` sits at the hook, so the tag swings from there. The job tag is the large yellow version holding a phone screenshot of the client's site and its job number.

## Do's and Don'ts

### Do:
- **Do** hang every numbered thing (services, jobs, prices, steps) as a tag or on a rail.
- **Do** keep yellow for the primary action and the one drenched band per page.
- **Do** put job numbers in the tag or on the same line as the name.
- **Do** keep the motion to the hang and the swing, and keep everything still under reduced motion.
- **Do** describe only real work and real facts: one job on the board today, Legendary Detailing.

### Don't:
- **Don't** use cream or beige paper, serif display faces, italic emphasis words or monospace labels.
- **Don't** stack a small label above a heading (no kickers or eyebrows).
- **Don't** use gradients as decoration; the only gradients are metal and the pegboard.
- **Don't** put white text on yellow, or use colour on its own to mark state.
- **Don't** add hard offset shadows, glows or glassmorphism.
- **Don't** write copy that says clients own the site, code or domain.
