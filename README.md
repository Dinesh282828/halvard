# Halvard

A motion-led site for a fictional architecture and spatial research practice.
Frontend only — no backend, no CMS, no database. It builds to static files and
deploys to Vercel's free tier.

Built as a portfolio piece: the kind of thing you send cold.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then `npm run build` to produce `dist/`, and `npm run preview` to serve that
build locally.

Append `?nopreload` to any URL to skip the opening curtain — useful when
working on sections further down the page.

## Deploying

Push the repo and import it at [vercel.com/new](https://vercel.com/new). Vercel
detects Vite and needs no configuration; `vercel.json` is already here for the
SPA rewrite (without it, refreshing `/work/nave` would 404) and for immutable
caching on hashed assets and images.

---

## What's in it

| Section | What it does |
| --- | --- |
| Curtain | Counter driven by real image loading, floored by a minimum duration so it never flashes. Lifts as five columns. |
| Hero | Full-bleed plate with a WebGL shear fed by scroll velocity; title lines rise out of clipped boxes. |
| Manifesto | Word-by-word opacity tied to scroll position, with a gauge tracking read progress. |
| Selected works | GSAP-pinned horizontal run. Cards carry a WebGL displacement on hover, drift against the track, and can be dragged. |
| Method | A hand-drawn floor plan draws itself with scroll, then its central spine opens into the photograph of the built space. |
| Disciplines | Row hover brings up a photograph on a spring-lagged follower tilted by pointer velocity. |
| Recognition | Two marquees running opposite ways; scroll velocity leans on them and they settle back. |
| Contact | Per-character roll on links, live Copenhagen time. |

Plus a two-part cursor that inverts against whatever is under it, a fixed film
grain plate, and route changes covered by a column wipe.

## How it's put together

- **Vite + React + TypeScript**, React Router for the two routes.
- **GSAP + ScrollTrigger** for scroll-driven work. **Lenis** for smooth
  scrolling, driven from GSAP's ticker so the scroller, the triggers and every
  WebGL instance share one rAF loop.
- **WebGL written directly** (`src/lib/webgl/DistortImage.ts`) rather than via a
  scene graph. The whole effect is one textured quad; this keeps it around a
  few hundred bytes instead of the few hundred kilobytes three.js would cost.
  Instances are created on first hover, park themselves when scrolled out of
  view, and stop drawing once the effect comes to rest.
- **Self-hosted fonts** (Instrument Serif / Instrument Sans / IBM Plex Mono) —
  no third-party requests anywhere on the page.

### Two things worth knowing if you edit this

**Pinned sections pin an inner wrapper, never the `<section>` itself.**
ScrollTrigger wraps whatever it pins in a `.pin-spacer`. If that were the
section, React would later try to remove the section from `<main>` — no longer
its parent — and take the app down on the next route change. See the comment in
`WorkGallery.tsx`.

**StrictMode is off**, deliberately. Its double-invoked effects re-run the
imperative GSAP timelines and produce artefacts that only exist in development.
Every effect still cleans up after itself.

## Performance

Roughly 139 kB of gzipped JavaScript and 6 kB of CSS. Photographs are graded to
a common look, served as WebP at two widths, and every one of them has a 20px
preview inlined into the bundle so nothing ever flashes white. Only the images
above the fold are fetched eagerly.

## Accessibility

`prefers-reduced-motion` is honoured throughout — smooth scrolling, the cursor,
WebGL, pinning and every scrubbed timeline are skipped, and the sections that
depend on a pin fall back to a stacked layout that reads as a normal page.
Project cards are real anchors, so they are keyboard reachable and open in a new
tab the way a link should.

## Content

Halvard is invented. The projects, awards, addresses and company number are
written to be plausible, not real. Photographs are from
[Unsplash](https://unsplash.com) under their licence and have been graded;
swap them for the client's own work in `public/img` and update
`src/data/projects.ts`.
