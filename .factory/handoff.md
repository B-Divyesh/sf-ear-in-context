# Repair handoff — Ear in Context

## Release repair

Repair commit: `2e744807d2116d79de6a26af46546f1ba0171726` (based on reviewed
commit `415fb3b33f906107c8d0656a37639a83636eeea5`).

The release now has an isolated `/demo` and `?demo=1` sample path. It shows a
persistent **Demo — sample data, nothing is saved** banner, **Reset demo**, and
**Start for real**. Demo progress is seeded and uses only
`demo:ear-in-context:progress:v1`; normal progress remains untouched.

The first screen now names the job and audience, with a visible **Try sample
practice** action and an adjacent explanation. The paper-and-voice-path
identity is retained. The repair also adds route-specific metadata, canonical,
Open Graph/Twitter art, touch icon, sitemap, consistent Demo navigation,
product-styled 404, route title announcements and heading focus, legal links,
mobile navigation/layout changes, and a concise catalog description.

## Claims and demo evidence

`.factory/claims.json` contains executable tests for demo isolation, local
audio traffic, account-free sample entry, CSV export, Studio price/backup, and
offline reload. `scripts/claims.mjs` runs each in fresh Playwright contexts;
`test:browser` additionally checks 404, history focus, mobile overflow, and
console errors. Demo documentation is in `.factory/demo.md`.

## Verified from a clean clone

Clean clone: `/tmp/tmp.r1IstdtWWU` from repair commit above, then `npm ci`.

```text
npm test                         PASS — 3 files, 8 tests
npm run build                    PASS — dist/index.html produced
npm run test:browser             PASS — all six @claim tests, routing/focus/mobile/console
npm run audit:a11y               PASS — 0 serious/critical axe findings, 0 console errors
```

Browser evidence included the demo storage comparison against a seeded real
key, same-origin request interception while playing the sample, CSV header plus
two sample rows, service-worker controlled offline reload, and a 390×844
viewport check. The production build is 32.32 kB JS (11.73 kB gzip), 18.25 kB
CSS (4.70 kB gzip), and the existing 38 kB WebP hero; all are within budget.

## Deploy and known gaps

`dist/` remains the static Azure Static Web Apps artifact and
`public/staticwebapp.config.json` is shipped to its root. No separate deploy
script or infrastructure credential is present in this repository; the repair
is ready for the work-order deployment triggered by the main-branch push.

No known blocking product findings remain. A live-host HTTP status check for
the host's 404 override should follow deployment, because Vite preview only
exercises the client-side designed 404 route.
