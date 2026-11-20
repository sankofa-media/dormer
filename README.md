# Dormer

A bilingual, static multimedia publication. Vite + TypeScript, without a framework.
Requires Node 24+ (the build uses native TypeScript stripping).

```sh
npm ci
npm run dev
```

For the complete site, including Pagefind search:

```sh
npm run build
npm run preview
# http://localhost:4173 and http://localhost:4173/ru/
```

Set the real public origin before publishing: `SITE_URL=https://your-domain.example npm run build`.
The default canonical origin is localhost. No deployment or remote is configured.
Serve `dist/` with directory indexes. Both languages are prerendered and remain
readable without JavaScript. Unknown project routes should return the host's 404.

## Content

`content/projects/index.yaml` is the wall catalogue. Upcoming entries have no
project links or invented descriptions. Tile types: layers, video, image, empty,
and type. Image/video tiles accept a `src`; type tiles may use `quote`.
`content/projects/<id>/project.yaml` contains bilingual scenes, blocks, fact IDs and sources.
`fact-sources.json` snapshots the supplied research sources; the build checks that each
block contains exactly the deduplicated sources for its own fact IDs.
English blocks explicitly carry `draft: true`. The Russian prose is copied from
the storyboard, with the flagged sentences excluded (see `editorial_notes`).

The engine enhances the same article into a horizontal race. Scroll vertically,
swipe horizontally, use left/right arrow keys in the race, or choose a furlong in
the programme. Long panels scroll internally. Calm mode and system reduced motion
show the complete vertical article. Audio starts off. YouTube only loads on click.
A locally saved horse name appears in the last paddock; storage failure is handled.
Name validation is an educational subset, not registry clearance. Category checks
require declarations; protected names are a small, explicitly disclosed IFHA sample.

## Art

The build copies and converts images from `../bull-in-the-heather/art/` and
`content/projects/bull-in-the-heather/art/` (local content overrides sibling files).
No runtime imports or absolute cross-repository code dependencies are used.
Commit final artwork into the content art directory for a standalone checkout.
PNG files become WebP originals plus w480/w960/w1600 versions in `public/media/`.
The generated `media/manifest.json` lists every asset. Existing track-plate.png is
used for the racetrack and tile. Scene files use `<scene>-plate.png` followed by
`<scene>-<layer>.png`; scene IDs are in project.yaml. Whole layers retain margins.
The art manifest validates five horses, each with ten gallop and eight walk frames.
Thirteen runners reuse horses 2–5; horse 1 is the unique grey winner. There are no
CSS horse silhouettes or hue shifts. The pack walks when scrolling stops.
The cover tile uses `cover-plate` and `cover-grey` with pointer depth.
The photo-finish drawings are original illustrations, not video stills. No third-party photographs or newspaper scans are reproduced.

## Verification

```sh
npm run build
npx tsc --noEmit
npm test
npx playwright install chromium
npm run e2e
npm run screenshots
```

Playwright uses the built site, in Chromium at 1440×900 and mobile at 390×844.
Screenshots are saved in `.shots/<desktop|mobile>-<scene>.png`; the screenshot test
also covers the complete home wall, the cover, start, all nine poles, the constructor, five aftermath
screens and the calm article. `.shots/manifest.txt` lists the generated files.
See `VERIFICATION.md` for the recorded run and limitations.

Search indexes prerendered content in one combined language index (`force-language
en`) so both English and Russian queries work on either locale. English stemming
is used; Russian exact/prefix matching works, Russian morphology is not enabled.

## Reuse and licence

Apache-2.0; see LICENSE and NOTICE for Sankofa adaptation details. Original source
links remain with the research text. External media retains its own rights.
