# M&M Websites design system: "The key board"

Source of truth for values: `assets/css/site.css` (tokens at the top). Hold to these on every new page; reuse the patterns below instead of inventing new ones.

## Direction and feel
- The site is the key board on a service-shop wall: owners hand M&M the keys and every job hangs, numbered, on a hook.
- Feel: practical, shop-floor, confident and plain-spoken. Signage, not editorial. No cream paper, no serif display, no mono labels, no gradients-as-decoration.
- Signature: die-cut key tags hanging from steel hooks on split rings, swinging on hover.

## Palette (tokens)
- Steel (ground) `--steel #d8ded5` · second steel `--steel-2 #cdd5ca` · pegboard `--panel #c6cfc4` · enamel plate `--plate #eef1ec` · dark enamel band `--enamel #1c2925`.
- Ink `--ink #14201b` (12:1 on steel) · `--ink-2 #2f3e38` · `--muted #4a5a53` (5.3:1) · links/focus `--link` cobalt `#2148c9`.
- Tag colours, the only saturated colours on the site, used on tags, the yellow "why" field and primary actions:
  `--yellow #f2c230` (ink text) · `--cobalt #2148c9` (white text) · `--green #17773b` (white) · `--tomato #c63a21` (white; also errors and required marks).
- Metals for hooks, rails, rings: `--metal-1/2/3`.
- Dark theme: same structure after hours. Steel `#141b18`, panel `#1f2a26`, ink `#e7ece5`, link `#8fb0ff`; tags keep their colours.
- Colour strategy: full palette, four named tag roles. Yellow is the primary action colour; one drenched section (Why) per page at most.

## Type
- Display: Big Shoulders (variable, opsz, weights 800–900). Section titles and the hero headline in uppercase; h3 and names in mixed case.
- Text: Overpass (variable). Body 17–19px fluid, line-height 1.6; labels and nav 700–800.
- Hero headline max 6rem, line-height 0.86. Section h2 clamp(2.6rem, 6vw, 4.6rem). Prices: Big Shoulders 900, tabular numbers.

## Depth and space
- Depth: tags and plates lift with `--e-tag` (inset highlight + offset soft shadow); panels with `--e-3`. No hard offset shadows, no glow.
- Spacing base 4px: `--s-1 … --s-9` (4, 8, 12, 16, 24, 32, 48, 64, 96 px). Sections `clamp(4.5rem, 10vw, 8rem)`.
- Radius: `--r-s 6px` (inputs, nav, outline buttons) · `--r-m 10px` (buttons, plates) · `--r-l 16px` (panels, form) · `--r-tag 1.4rem 1.4rem .7rem .7rem` (key tags).
- Controls: 44px min (`--h-s`), 48px primary (`--h-m`).

## Component patterns
- **Key tag** (`.tag`): colour fill, punched hole 0.95rem at top (`::before`, filled with the panel colour), split ring 1.3×2.35rem (`::after`), hangs under a `.hook`; transform-origin at the hook so it swings from there. Number in Big Shoulders 900 2.6rem, name 800 0.98rem, note 600 0.82rem.
- **Hook** (`.hook`): 8×1.6rem metal rod with a screw plate; sits on a metal **rail** (0.55rem bar, `--metal` gradient).
- **Pegboard panel** (`.board__panel`, `.bill`): `--panel` with 24px hole grid and hammertone noise, `--r-l`, `--e-3`.
- **Primary action** (`.btn--key.btn--yellow`): yellow, ink text, punched hole on the left, radius `.6rem 1.6rem 1.6rem .6rem`. Secondary: `.btn--line` 2px ink outline. On enamel: `.btn--paper`.
- **Ledger row** (`.ledger__row`): small colour tag (3.25×4rem) holding the number, title in Big Shoulders, body copy.
- **Price tag** (`.bill__tag`): large key tag with price in Big Shoulders 900 3.4–4.4rem.
- **Enamel plate** (`.formcard`, `.bill__checkout`): `--plate`, rivets at the corners (form), `--r-l`.
- **Chips**: tag-shaped (`.5rem 1.4rem 1.4rem .5rem`) with a small hole; checked = yellow with ink text.

## Motion
- One authored moment: tags drop onto hooks on entrance (staggered 120ms) and swing with a spring settle on hover/focus. Nothing else moves except UI feedback (≤300ms) and the page cross-fade (view transitions).
- `prefers-reduced-motion`: everything still.
