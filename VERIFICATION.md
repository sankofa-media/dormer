# Longread v2 — 2026-11-26

Runtime: Node 24.22.3. Branch: `feat/longread-v2`. No push or deployment.

## Supplied content

Only `bull-in-the-heather` is published in the supplied index. Its existing prose
has been migrated to 15 vertical chapters, keeping the bilingual paragraphs and
source titles/URLs. Cover text is rendered from title/dek. Existing illustration
files are referenced explicitly; no new prose, photos or project were invented.
The yé-yé project and new cover/paper artwork have not been supplied. Both themes
and every block type are exercised with fixtures confined to tests. Adding a real
published index entry and valid project/assets will include its page and cover tile.

## Checks

- `npm run build`: TypeScript, Vite, prerender and Pagefind pass. Four prerendered
  pages, two searchable articles, five referenced assets. Unreferenced horse frames
  remain in source control but are absent from generated media and `dist/`.
- `npm test`: 10 tests cover real content, bilingual validation, unknown types,
  photo credits/URLs (including nested galleries), sources, traversal, section
  timing/gaps, duplicate chapter IDs, referenced-only media, all block renderers
  in both languages/themes, HTML escaping and unsafe Markdown URLs.
- `npm run e2e`: 16 Chromium checks at 375×812 and 1440×900 cover all supplied
  chapters in RU/EN, no-JS reading, no YouTube requests before clicking, nocookie
  iframe creation, IFrame API seek calls on initial and subsequent section clicks,
  reduced motion, horizontal overflow, Pagefind, language switching and screenshots.
- Screenshots: `test-results/shots/`, both languages of Bull, both theme fixtures,
  and the RU home wall at both widths. Mobile and desktop covers visually reviewed.
- `git diff --check`: clean.

The first screenshot run timed out waiting on offscreen lazy images. Screenshot
preparation now requests eager loading before decoding; production images remain lazy.

## Limits

YouTube requests/API are intercepted in tests; this verifies integration and
consent, not live third-party playback availability. System reduced motion is
emulated in Chromium. Firefox, WebKit and physical devices were not tested.
Google Fonts require network access; serif/sans-serif fallbacks remain available.
English content retains its draft flags. Pagefind uses a combined English index:
Russian exact/prefix matching works, but Russian stemming is not enabled.
The existing full-bleed Bull artwork predates the requested new watercolor assets.
