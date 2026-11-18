# Vendored libraries

Third-party files the site loads from its own origin (no CDN). Each one is the
unmodified minified build from the npm package at the pinned version below; the
folder name carries the version, so a file at a given path never changes (that is
why `_headers` can cache `/assets/vendor/*` as immutable). To upgrade, add a new
version folder, point the `<script>` tags (or `motion.js` for the lazy files) at
it, and delete the old folder.

This README is not published (`.assetsignore` skips `*.md`); the `LICENSE.txt`
files are.

| Library | Version | Files | License | Used on | Loaded |
|---|---|---|---|---|---|
| [Lenis](https://github.com/darkroomengineering/lenis) | 1.3.27 | `lenis/1.3.27/lenis.min.js` (+ `.map`) | MIT, `lenis/1.3.27/LICENSE.txt` | every page except 404 | `defer` |
| [GSAP](https://github.com/greensock/GSAP) | 3.15.1 | `gsap/3.15.1/gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` | Standard "no charge" GSAP license, `gsap/3.15.1/LICENSE.txt` (copy of https://gsap.com/standard-license) | home | `defer` |
| [three.js](https://github.com/mrdoob/three.js) | r134 (npm 0.134.0) | `three/0.134.0/three.min.js` | MIT, `three/0.134.0/LICENSE.txt` | home hero, 760px+ only | by `motion.js` after load, when idle |
| [Vanta](https://github.com/tengbao/vanta) | 0.5.24 | `vanta/0.5.24/vanta.dots.min.js` | MIT, `vanta/0.5.24/LICENSE.txt` | home hero, 760px+ only | by `motion.js`, after three.js |
| [React Bits](https://github.com/DavidHDev/react-bits) ShinyText | commit d01aa91 | ported to `assets/js/shiny-text.js` (no React) | MIT + Commons Clause, `react-bits/LICENSE.txt` | home headline | `defer` |

Vanta 0.5.24 is built against three.js r134 (its README and demo pin r134); newer
three.js releases break some Vanta effects, so keep the two together.

React Bits' license allows using its components inside a website or product,
including commercial ones, but not selling or redistributing the components
themselves (alone, in a bundle or "as a ported version"). Using the Shiny Text
port on this site, or on a client site we build, is fine; publishing it as a
snippet pack or a template for sale is not.

## Checksums (SHA-256, first 16 hex digits, matching the npm tarballs)

| File | Bytes | Gzip -9 | SHA-256 |
|---|---|---|---|
| lenis.min.js | 18,815 | 5,425 | 80f53e77f1c13e37 |
| gsap.min.js | 73,357 | 28,415 | 3d1bea374ab1b703 |
| ScrollTrigger.min.js | 44,683 | 18,034 | b5bb360661f478f0 |
| SplitText.min.js | 7,955 | 3,657 | 7b299a6b26b36fd5 |
| three.min.js | 615,601 | 151,448 | 74782bdbcf6518f7 |
| vanta.dots.min.js | 10,654 | 3,685 | 7cdbbfb0906de48c |
