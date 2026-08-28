# Ear in Context — polish round 5 handoff

## Outcome

Released `616d186b0401b612f05ee18afce38bb21c239fd3` to
<https://ear-in-context.sociobot.in> through Azure Static Web Apps deployment
`50fa8055-2d36-40af-864a-0ca76f7c9849`.

The major backup gap is closed: Studio now downloads a versioned progress
backup and restores it through validated file selection, a settings preview,
explicit replacement confirmation, and a safe malformed-file path. The phone
header keeps Privacy visible, and every off-origin link says **(external)**.
The existing warm-paper, coral, and teal voice-path identity remains intact.

`/demo` and `?demo=1` remain one-click isolated sample paths. They keep normal
progress untouched, show the persistent demo banner, reset sample state, and
discard it on exit.

## Run and verify

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run preview -- --host 127.0.0.1
AUDIT_URL=http://127.0.0.1:4173 npm run audit:a11y
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
```

Run every exact `test` value in `.factory/claims.json` separately for the
claim-level suite. The production artifact is `dist/`, with `index.html` at
its root; deploy it using the checked-in `staticwebapp.config.json`.

## Exact evidence

- Fresh clone `/tmp/ear-in-context-polish-5.RVk5mH` at `616d186`: `npm ci`,
  `npm test` (4 files, 10 tests), `npm run build`, all 22 registry commands
  separately, aggregate browser tests, Axe audit, URL verifier, and production
  dependency audit passed.
- Live aggregate: 22/22 claims passed, including the new
  `@claim:progress-backup-restore`; routing, 404 status, metadata, focus,
  390 px Privacy target, external-link labels, offline reload, and console
  checks also passed.
- Live Axe: zero serious/critical violations and zero console errors across
  light/dark, home, demo, legal, singing, and not-found routes.
- Live URL verifier: HTTP 200, title, `lang`, one h1, main landmark, alt text,
  labelled controls, and zero console errors. `GET /not-a-real-page` returned
  404; `/sitemap.xml` returned `text/xml`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 965 ms, LCP 1018 ms, TBT 0 ms, CLS 0.
- Live screenshots and claim screenshots are under
  `evidence/polish-5-live/` in this work-order environment. The full
  finding-to-evidence mapping is `.factory/polish-5.md`.

## Known gaps

None.
