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

The default SEO origin is `https://dormer.sankofa.workshop.aenix.io`. Override it with
`SITE_URL=https://your-domain.example npm run build`.
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

All 140 artwork sources are committed as WebP in
`content/projects/bull-in-the-heather/art/` (24.04 MB, quality 88, original
sizes and lossless alpha). No sibling checkout is needed to build the site.
The source manifest retains technical checks and geometry; file sizes and SHA-256
refer to the WebP files. Support scripts from the original art workspace are not
part of this snapshot. The build reads only `content/projects/<id>/art/` and writes
WebP originals plus w480/w960/w1600 versions to `public/media/`, without enlargement.
The generated `media/manifest.json` lists every asset. `track-plate.webp` is
used for the racetrack. Scene assets keep their base names and layer margins.
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

## Deployment

`deploy/nginx.conf` serves `dist/` on port 8080, including directory indexes for
`/projects/<id>/` and `/ru/...`, real 404s, UTF-8, gzip, and Pagefind MIME types.
HTML and search bundles revalidate; hashed assets cache for a year and media for
one week. HTML validators are disabled because image layers use fixed timestamps.

On a machine with stand access, run:

```sh
./hack/deploy.sh
# Custom domain (also sets the SEO origin unless SITE_URL is explicitly set):
DORMER_HOST=stories.example.org ./hack/deploy.sh
```

Requires Node 24+, npm, bash, rsync, BSD tar (macOS tar, as used by the museum),
curl, kubectl and crane at `~/go/bin/crane` (override with `CRANE`). No Docker
daemon is needed. The script runs `npm ci` and `npm run build`, makes sorted layers
with fixed UTC timestamps, modes and owners, and uses `crane append` on
`nginxinc/nginx-unprivileged:1.29-alpine`, the museum's base image. Layer bytes are
reproducible for identical build output; the upstream base tag itself can change.

Deployment depends on a checkout of
[sankofa-media/sankofa](https://github.com/sankofa-media/sankofa), by default at
`~/projects/sankofa-int` (override with `SANKOFA_ROOT`): it sources `hack/stand/env.sh` for the **same `km` function** and
calls that checkout's `hack/stand/push.sh` to distribute the image to the stand's
node registries. Its `MUSEUM_KUBECONFIG` and `MUSEUM_CONTEXT` overrides apply.
Serialize deployments with other stand pushes: the shared helper uses port 15001.

The pushed digest supplies `DORMER_IMAGE`; `DORMER_HOST` defaults to
`dormer.sankofa.workshop.aenix.io`. The script renders `dist/dormer.yaml`, applies the
Namespace, Deployment, Service and Ingress, waits for rollout, then checks HTTPS
and compares the served home page with this build. DNS must point to the stand;
its nginx ingress controller and cert-manager ClusterIssuer `letsencrypt` must
exist. TLS uses the `dormer-tls` secret in namespace `dormer`.
