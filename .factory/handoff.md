# Ear in Context — polish round 2 handoff

## Outcome

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed.
No earlier `.factory/polish-*.md` file existed in the reviewed base. The exact
finding map is in `.factory/polish-2.md`.

Runtime repair commit: `d0575aeca16396498673463e1bd5071577d6d9ad`.

The live product now describes the real job: hearing harmony in generated chord
patterns. It keeps the warm-paper, coral pitch-token, and teal voice-path visual
system. The artifact remains a Vite/TypeScript static web app with `dist/` as
its deployment root.

## What changed

- Added a complete, executable 16-claim registry. Tests cover generated audio,
  all practice modes, score and preview behavior, sung microphone allow/deny,
  privacy traffic, keyboard use, held difficulty, CSV, local persistence and
  erase, Studio restore/features, demo isolation, and offline reload.
- Strengthened `/demo` and `/?demo=1`: realistic seeded progress, persistent
  banner, Reset demo, separate `demo:` storage, and true sample deletion on
  exit without reading or changing normal progress.
- Rewrote first-screen and practice copy: chord patterns instead of songs,
  audience named, action/result named, “Note roles (scale degrees)” defined,
  “Explore mode” explained, and subjective/jargon-heavy copy removed.
- Added the standard how-it-works and product-boundaries sections without
  replacing the product-specific voice-path geometry.
- Replaced the catch-all 200 navigation fallback with explicit known-route
  rewrites and a real 404 response that retains the designed not-found view.
- Completed per-route titles, descriptions, canonical/OG metadata, focus and
  live announcements, crawl files, legal/footer links, touch targets, dark-mode
  contrast, reduced motion, service-worker cache versioning, and mobile layout.
- Updated README, demo docs, visual tokens, copy audit, catalog description,
  version 1.2.0, and the finding-by-finding polish record.

## Verification evidence

Clean clone: `/tmp/eic-polish-2-clean.yUSCOF` at
`d0575aeca16396498673463e1bd5071577d6d9ad`.

```text
npm ci                    PASS — 58 packages, 0 vulnerabilities
npm test                  PASS — 3 files, 8 tests
npm run build             PASS — dist/index.html at artifact root
every claims.json command PASS — 16/16, each run separately
npm run test:browser      PASS — claims + HTTP 404 + crawl + focus + mobile
npm run audit:a11y        PASS — 0 serious/critical, light/dark, 5 routes
```

Clean-clone command output is at
`/tmp/eic-polish-2-clean.yUSCOF/clean-claims.log`; per-claim screenshots are in
`/tmp/eic-polish-2-clean.yUSCOF/test-results/claims/`.

Production bundle:

```text
JS    33.55 kB / 12.02 kB gzip
CSS   20.63 kB / 5.12 kB gzip
Hero  38.42 kB WebP
```

Local Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best
Practices, 100 SEO; LCP 1.4 s, CLS 0, TBT 10 ms.

## Deployment and live cold check

Deployed with the work-order static command:

```bash
/opt/fleet/lib/deploy-static.sh ear-in-context dist
```

- Azure deployment ID: `8ec24ead-6244-4116-b4ee-256ecbbd560f`
- Default host: `https://happy-plant-0c340e00f.7.azurestaticapps.net`
- Public URL: `https://ear-in-context.sociobot.in`

Cold production verification:

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200.
- `/404` and `/not-a-real-page`: HTTP 404 with the designed page.
- `/sitemap.xml`: HTTP 200 and `text/xml`; `/robots.txt`: HTTP 200.
- `LIVE_URL=https://ear-in-context.sociobot.in npm run test:live`: all 16
  claims and browser checks passed in fresh contexts.
- `AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y`: zero
  serious/critical findings and zero console errors.
- Live Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 0.9 s, CLS 0, TBT 0 ms.
- Factory URL verifier: title, `lang`, one h1, main landmark, image alt,
  labelled buttons, and console checks passed at home and `/demo`.
- Live response headers include CSP, HSTS, Referrer-Policy,
  X-Content-Type-Options, and `Permissions-Policy: microphone=(self)`.
- Sociobot checkout returned HTTP 303 to its hosted checkout.

Screenshots and verifier JSON are under `.factory/evidence/polish-2-live/` and
`.factory/evidence/polish-2-live-demo/`.

## Run it

```bash
npm ci
npm run dev
```

For the complete local gate:

```bash
npm test
npm run build
npm run test:browser
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

For production replay:

```bash
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y
```

## Known gaps and next steps

No known product, review, accessibility, privacy, offline, routing, or claim
gap remains. No follow-up is required for this work order.
