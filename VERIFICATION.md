# Verification — fix round 2, 2026-11-20

Chapter reading now consumes document scroll while the horizontal track stays at
its pole. Each pole receives its measured overflow distance plus a reading pause;
only then does travel resume. ResizeObserver recalculates this for fonts, viewport
changes, source expansion, form feedback and video content. Reverse scrolling
retraces the same text. Calm and no-JavaScript versions retain the full article.

Russian tile tags use localized names; the Bull subtitle has an opaque paper
strip on desktop and phones. Thirteen runners have unequal track positions and
individual gait rates. Bull stays around eighth until the late advance, then
passes through the pack and finishes first; Great Navigator fades. This follows
`research3-11` in the supplied sibling `facts.yaml`. Other runner trajectories,
spacing and gait remain illustrative, not a reconstruction of the race chart.

Validation covers all nine poles in Russian and English at 1440×900, 390×844 and
360×740: every 100px of reading, stationary track, and arrival at the exact bottom
before leaving the pole. Screenshots include overlapping 250px reading steps for
long Russian chapters, alongside all existing scene captures. Files remain in
`.shots/`, with per-viewport manifests and a combined `manifest.txt`.

The initial browser pass exposed a one-pixel toolbar-border discrepancy and a
race between the delayed Start action and programme navigation. Both were fixed.

Final checks: production build passed; 12 unit tests and 30 Chromium browser
checks passed; git diff --check passed. 127 screenshots were refreshed and
viewport image dimensions verified. All nine pole starts were visually reviewed
at both phone sizes, plus the mobile subtitle, reading continuation and finish.
Screenshots remain local ignored artifacts. No push or deployment.

Previous-round evidence and general limitations follow below.

---

# Verification — fix round 1, 2026-11-20

- `npm run build`: passed; four prerendered pages, two Pagefind article entries.
- `npx tsc --noEmit`: passed.
- `npm test`: ten unit tests passed (name rules, scroll mapping, content validation).
- `npm run e2e`: sixteen checks verified across desktop 1440×900 and mobile
  390×844, Chromium. Includes screenshots, bilingual search on either locale,
  filtering and URL/history, all nine poles, start, name length/protection/storage,
  paddock, wheel scroll, keyboard, horizontal touch events, reduced motion,
  JavaScript-disabled article and SEO, and click-to-load YouTube.
- Russian copy audit: all 23 retained blocks are exact substrings of the supplied
  storyboard. Excluded sentences are documented in project.yaml editorial_notes.
- All four prerendered pages have unique HTML IDs and valid JSON-LD.
- IFHA protected-name sample checked against the downloaded primary PDF:
  Ferdinand, Secretariat, Frankel, Seabiscuit, Northern Dancer.
- `npm audit`: zero vulnerabilities after updating Vitest and Sharp.
- More than 12 GB remained free. The content build stops below 3 GiB.

## Screenshots

See `.shots/manifest.txt` for the complete file list. Each viewport has:
`home`, `home-wall` (full page), `cover`, `start`, `pole-1` through `pole-9`,
`constructor`, `kentucky`, `father`, `old-friends`, `april`, `paddock`, `calm`.
52 fresh screenshots: 40 viewport captures with verified pixel dimensions and 12 full-page/section captures.
Includes a separate `finish` capture and full captures of all five aftermath sections.
Screenshots use CSS pixel dimensions (mobile device scale is not multiplied).
All scenes were visually reviewed at both viewport sizes.

## Deliberate limits

English is draft. The full runner finishing order remains provisional. No unverified
sentence marked for checking is published. The interpretation at pole 5 loses its
first two sentences; pole 6 omits the last sentence; April retains only the first.
The bumper-sticker account remains explicitly attributed as a secondary account.

The build validates the supplied art manifest and converts 140 assets, including
90 horse frames (five horses × ten gallop/eight walk frames). Thirteen runners use
one grey winner and repeated horses 2–5, with scale, lane and phase differences.
No CSS horse silhouettes or hue-shifted silks remain. The home tile uses the real
cover plate and grey layer with pointer separation.
The clip illustrations are original sketches, not video stills or a verified
frame-by-frame reconstruction. Racing colours and gait are illustrative. The
external official YouTube playback itself is not tested against a live service;
the browser test verifies consent and the correct nocookie embed URL with a fixture.
Audio ambience is synthesized, not a field recording. Audio fidelity and physical
mobile-device gestures were not manually evaluated; mobile testing uses Chromium
emulation and dispatched touch events. WebKit and Firefox were not tested.

Name checking is a disclosed educational subset, with a short IFHA seed and reader
declarations for prohibited categories; it cannot grant real registration approval.
Search combines both languages in one Pagefind index with English stemming, so
Russian matching is by exact term/prefix rather than full Russian morphology.
Search is available in the production preview, not the bare Vite development server.
The production domain is unset; supply SITE_URL before publication.

## Review-specific checks

- Exact supplied Russian/English home copy, no logo tagline or side-note prose.
- No missing Russian strings were introduced; `TODO-RU` list: empty. Existing
  storyboard prose is unchanged. The herd accessible name uses the runner names.
- A single active chapter paper, at most 520px wide on desktop, 16px phone gutters,
  in the upper half. Checks cover direct hash links and between-pole scrolling.
- Real gallop/walk frames for every runner; grey horse 1 appears exactly once.
- Sources are deduplicated from each block's `fact_ids`, checked at build time
  against `fact-sources.json`, a snapshot of the supplied sibling `facts.yaml`.
- The first browser run exposed native horizontal scrolling on hash navigation;
  `overflow: clip` fixed it. The final run passed 15/16 checks; the sole remaining
  failure was a 0.00006px rounding discrepancy in a test boundary. With a 0.5px
  tolerance, the affected test then passed on both desktop and mobile (2/2).
- Screenshot tests passed for both sizes. `git diff --check` passed.
- Screenshots and generated media remain local ignored build artifacts, as before.
  No push or deployment was performed.
