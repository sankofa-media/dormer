# Dormer

A bilingual, static multimedia publication. Vite + TypeScript, without a framework.
Requires Node 24 (the build uses native TypeScript stripping).

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

The default SEO origin is `https://dormer.workshop.aenix.io`. Override it with
`SITE_URL=https://your-domain.example npm run build`.
Serve `dist/` with directory indexes. Both languages are prerendered and remain
readable without JavaScript. Unknown project routes should return the host's 404.

## Longread content

`content/projects/index.yaml` is the wall catalogue. Published entries load their
cover from `project.yaml`; upcoming entries remain unlinked. The compiler supports
any number of published projects. The checkout currently supplies only Bull.

Projects use `layout: longread`, `theme: watercolor | yeye`, bilingual `title` and
`dek`, ISO `date`, a `cover` with `kind: art | collage`, and `chapters` with unique
IDs, bilingual names, optional kickers and ordered blocks. Optional project `paper`
references a texture. Bilingual values are `{ru: string, en: string}`; English may
also be `{text: string, draft: true}`. Plain bibliographic credits may be strings.

Blocks: `text`, `art`, `photo`, `gallery`, `clipping`, `video`, `structure`, `quote`,
`timeline`, `poster`, `collage`, `aside`. Text/aside/quote use `text: {ru, en}`.
Text supports paragraphs, bold, italic and HTTP(S) links. Text and aside `sources`
are numbered at chapter end. Every source requires a title and HTTP(S) URL.
Photos require bilingual alt/caption, credit and source_url, including when nested
inside galleries, posters or collage backgrounds. Poster `photo` is a photo block;
collage `background` is a file reference or an art/photo block.
See `src/model.ts` for types and `tests/fixtures.ts` for all-block examples.

Media paths are relative to the project. Bare filenames in photo blocks resolve
under `photos/`; other bare filenames resolve under `art/`. Use explicit
`photos/name.jpg` for photo posters or collage pieces. Only referenced files are
bundled. Existing unused art stays on disk. The compiler replaces generated media
on success, emitting WebP plus responsive 480/960/1600 variants without enlargement,
with actual intrinsic dimensions. Missing referenced files fail the build.

Both languages are prerendered. No JS is needed to read chapters or follow video
links. YouTube's privacy-enhanced iframe and IFrame API load only on interaction.
Structure links seek through the API and remain a readable list without JS.
Calm mode and system reduced motion disable bloom and parallax; displacement is
clamped to ±24px. The home collage is static. Mobile balloons flow below the
composition to preserve readable text. There is no audio or race interface.

## Verification

```sh
npm run build
npm test
npx playwright install chromium
npm run e2e
npm run screenshots
```

Use Node 24 (`.node-version`). Playwright checks Chromium at 375×812 and 1440×900.
Screenshots go to `test-results/shots/`; `npm run screenshots` also writes its
manifest. Tests cover all supplied projects in both languages, no-JS reading,
click-only video, mocked YouTube IFrame API seeking, reduced motion, overflow,
search, and both themes using test-only fixtures. No synthetic project is published.

Search uses one combined Pagefind index (`force-language en`) for both languages.
Russian exact/prefix matching works; Russian morphology is not enabled. Search
requires the production build. See `VERIFICATION.md` for run evidence and limits.

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

Requires Node 24, npm, bash, rsync, BSD tar (macOS tar, as used by the museum),
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
