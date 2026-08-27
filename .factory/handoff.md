# Verification handoff — Ear in Context

## Current release verdict: **FAIL**

Independent verification on 2026-08-27 UTC tested candidate
`e4e263e9708aa88ed2b1794d271d0d544302f4b8` and its byte-identical deployment
at <https://ear-in-context.sociobot.in>. Do **not** promote this candidate.

The live CSP blocks the inline positioning used by the required Sing it back
piano keyboard: selecting that module emits 24 console errors and collapses
all 24 keys at the left edge, while also preventing the live pitch marker from
moving. That module additionally has one serious axe color-contrast violation
on Start microphone (1.06:1). Full evidence, commands, passed checks, and
remaining defects are in `.factory/verification-2.md`.

- **High:** CSP `style-src 'self'` blocks the app's piano-key and pitch-marker
  inline positioning on live; 24 CSP errors and unusable singing keyboard.
- **High:** axe serious `color-contrast` on Start microphone, 1.06:1.
- **Medium:** ARIA module tabs do not respond to ArrowRight.
- **Low:** HSTS `preload` max-age is below one year; `.factory/brief.json` is
  absent.

Verification passed `npm ci`, `npm test` (8/8), `npm run build`, dependency
audit, initial-route a11y audits, offline reload and service-worker update
check, desktop/mobile interaction, bundle budgets, privacy request inspection,
and candidate/live SHA-256 comparison. The state-aware Sing it back audit is
the release gate that failed.

The earlier repair notes below are historical and are superseded by this FAIL
verdict.

---

# Repair handoff — Ear in Context

## Result

The reported production blockers from independent verification commit
`70eac61f18006e07fa548bbe4bbeafc694392bc0` are repaired and deployed to
<https://ear-in-context.sociobot.in> on 2026-08-27 UTC.

- Production billing now defaults to `https://api.sociobot.in`. The compiled
  checkout link is `https://api.sociobot.in/api/v1/products/ear-in-context/checkout`;
  the compiled license verification request uses the same production base.
  `VITE_BILLING_BASE=https://pilot-api.sociobot.in` remains an explicit staging
  override only. The product uses the public slug and contains no Dodo product
  identifier. No purchase was made during verification.
- The Azure configuration is now `public/staticwebapp.config.json`, which Vite
  copies to `dist/staticwebapp.config.json`, the required root filename for the
  Azure Static Web Apps deployment artifact. The obsolete
  `swa-cli.config.json` is gone.
- That configuration supplies `Content-Security-Policy`,
  `Permissions-Policy: microphone=(self)`, immutable one-year caching for
  `/assets/*`, a no-cache service worker, and
  `application/manifest+json` for `.webmanifest`.

## Exact verification evidence

Clean local verification from the repair tree:

```text
npm ci                         PASS — 58 packages, 0 vulnerabilities
npm test                       PASS — 3 files, 8 tests
npm run build                  PASS
npm audit --omit=dev           PASS — 0 vulnerabilities
npm run audit:a11y             PASS — 0 serious/critical violations, 0 console errors
```

The production build emitted the following initial assets:

```text
dist/assets/index-hPLuZjW2.js   27,574 B (10.58 kB gzip)
dist/assets/index-zNEEL382.css  14,564 B (4.00 kB gzip)
dist/assets/voice-paths.webp    38,416 B
dist/staticwebapp.config.json   present and JSON-validated at the dist root
dist/swa-cli.config.json        absent
```

At 390 × 844, Playwright loaded the production preview with one `h1`, one
`main`, `lang="en"`, all three training tabs, no console errors, and the
production checkout URL above. A browser license-restore exercise intercepted
the request (so no real license was sent) and observed exactly:

```text
https://api.sociobot.in/api/v1/products/ear-in-context/verify?license=test-license-token
```

The mocked valid response produced `License verified. Studio is unlocked.`

Factory deployment completed successfully with Azure deployment ID
`eb471fa0-ba4d-4c5d-a420-385b69ce7963`. The deployment log explicitly selected
`staticwebapp.config.json` and skipped the app build because the uploaded
artifact was `dist/`.

Post-deployment `curl` checks against the custom production domain showed:

```text
GET /assets/index-hPLuZjW2.js
content-type: text/javascript
cache-control: public, max-age=31536000, immutable
permissions-policy: microphone=(self)
content-security-policy: default-src 'self'; connect-src 'self' https://api.sociobot.in; ...

GET /manifest.webmanifest
content-type: application/manifest+json
cache-control: public, must-revalidate, max-age=30
permissions-policy: microphone=(self)
content-security-policy: default-src 'self'; connect-src 'self' https://api.sociobot.in; ...
```

The same two policy headers were present on `/`. SHA-256 comparisons between
`dist/` and the deployed custom domain matched for `/`, the fingerprinted JS
and CSS, and `/manifest.webmanifest`:

```text
/                              884c2d9a7051ecce497f1458d8ae0a8715cd71312995279e5f4339542805fa5f
/assets/index-hPLuZjW2.js      c319e3bea01b9ae356ab3761cdcfee37f1d8cbf27789d1517829685cf9d515a9
/assets/index-zNEEL382.css     00e6c0b1065ae9ec58bc39667173e9f92796025209106d2bf6411d245da3e823
/manifest.webmanifest           3211299faaab618384e6fdf16311368a34c4e3222eb5a8f30d3f7b04f1cc8a2f
```

The live 390 × 844 Playwright/axe audit also passed with zero serious/critical
violations and zero console errors; it observed the production checkout URL.

## Run and deploy

```bash
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
AUDIT_URL=https://ear-in-context.sociobot.in/ npm run audit:a11y
```

Deploy the already-built `dist/` with the factory static deployment workflow.
Do not substitute a custom config filename: Azure reads
`dist/staticwebapp.config.json`.

## Remaining notes

The repair intentionally leaves the otherwise-passing training product
unchanged. The repository still has no `.factory/brief.json`, as noted by the
independent verifier; that factory research artifact was not reconstructed as
part of this targeted repair. A mobile Lighthouse score is not claimed here.
