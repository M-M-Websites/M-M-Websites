# Action Roofing: asset provenance (internal)

**Every photo and the hero video on this preview are AI-generated illustrations** made with Higgsfield on 2026-11-21 for M&M Websites. None shows Action Roofing's crew, trucks, customers or projects, and none may be labelled as their work. The footer says so on every page. Replace them with the owner's photos as soon as they arrive.

| File (in `assets/img/`) | Model | Prompt summary | Used on |
|---|---|---|---|
| `hero-*.webp` | Higgsfield `gpt_image_2_6` | Two roofers in harnesses laying charcoal shingles on a brick ranch house, golden hour, no logos | Home hero, OG image |
| `repair-*.webp` | `gpt_image_2_6` | Gloved hands replacing a damaged shingle with a pry bar | Roof repair hero, service cards |
| `replace-*.webp` | `gpt_image_2_6` | Roof half stripped to underlayment, half new shingles | Roof replacement hero, cards |
| `storm-*.webp` | `gpt_image_2_6` | House with storm-torn shingles and a fallen limb | Storm page hero, cards |
| `siding-*.webp` | `gpt_image_2_6` | Two-story house with slate-blue lap siding and white gutters | Siding & gutters, cards |
| `gutter-*.webp` | `gpt_image_2_6` | Rain running into a white gutter and downspout | Siding & gutters |
| `sunset-*.webp` | `gpt_image_2_6` | Roofer kneeling on a roof at sunset, hills behind | About hero |
| `aerial-*.webp` | `gpt_image_2_6` | Aerial of a Middle Tennessee neighbourhood at golden hour (not a real place) | Service area |
| `ridge-*.webp` | `gpt_image_2_6` | Macro of charcoal shingles and ridge caps | Storm page "signs" |
| `bundles-*.webp` | `gpt_image_2_6` | Shingle bundles and a nail gun on a roof deck | Roof replacement "signs" |
| `consult-*.webp` | `gpt_image_2_6` | Homeowner and contractor looking up at a roofline (faces not visible) | Home "why" section |
| `ladder-*.webp` | `gpt_image_2_6` | Roofer on a ladder checking the eave and gutter | Home picker, roof repair "signs" |
| `assets/video/hero.mp4`, `hero.webm` | Higgsfield `seedance_2_5`, image-to-video from the hero still, start and end frame matched for a loop, no audio | Home hero (tablet and desktop only) |
| `og-image.jpg` | Hero still + text set with DejaVu Sans Bold | Social share card |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Plain "A" letter tile, a placeholder, not a logo | Browser tab, home screen |

Font: Schibsted Grotesk (variable, latin subset) from Fontsource, SIL Open Font License (`assets/fonts/OFL.txt`).

The roof-layers diagram is an inline SVG drawn in `scripts/build.py` (`roof_svg()`).

Nothing from the Clarksville Now article (text or photos) or from the Lovable site is used.
