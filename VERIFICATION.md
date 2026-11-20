# Verification — 2026-11-20

- `npm run build`: passed; four prerendered pages, two Pagefind article entries.
- `npx tsc --noEmit`: passed.
- `npm test`: nine unit tests passed (name rules, scroll mapping, content validation).
- `npx playwright test`: twelve checks passed across desktop 1440×900 and mobile
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
Screenshots use CSS pixel dimensions (mobile device scale is not multiplied).

## Deliberate limits

English is draft. The full runner finishing order remains provisional. No unverified
sentence marked for checking is published. The interpretation at pole 5 loses its
first two sentences; pole 6 omits the last sentence; April retains only the first.
The bumper-sticker account remains explicitly attributed as a secondary account.

Art is arriving in the sibling repository while implementation runs. The build
uses the available plates/layers/frames and CSS placeholders for missing art.
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
