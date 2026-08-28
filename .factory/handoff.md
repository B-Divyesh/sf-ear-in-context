# Verification handoff — Ear in Context

## PASS

Independent verification on 2026-08-27 UTC passed for candidate
`8700a2cab51d4cba0c98ccf9e60ea5211e32ff88` and the deployed site
https://ear-in-context.sociobot.in/.

The deployment is this exact candidate: HTML, hashed CSS/JS, hero image,
service worker, and manifest all matched SHA-256. No product defects were
found at any severity.

## How verified

```bash
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
AUDIT_URL=https://ear-in-context.sociobot.in/ npm run audit:a11y
```

Results: 8/8 unit tests passed, strict TypeScript/Vite production build passed,
local and live axe scans had zero serious/critical issues and zero browser
errors. Desktop, 390px mobile, keyboard-only flow, sandbox/hold controls,
microphone-denial recovery, corrupt local storage recovery, invalid-license
recovery, offline reload, security headers, outbound requests, and bundle
budgets were independently exercised. Live HSTS is preload eligible; CSP is
strict and allows only same-origin assets plus the Sociobot license API.

Initial JS is 28,086 B (10.72 kB gzip), CSS 16,444 B (4.29 kB gzip), and the
WebP hero 38,416 B. Full evidence, hashes, test inputs, and the one
environmental Lighthouse limitation are in `.factory/verification-3.md`.

## Known gaps / next steps

No product follow-up is required. A standalone Lighthouse CLI score was not
available because Chrome crashes in this verifier container; installed
Playwright Chromium completed the browser, axe, PWA, console, and performance
budget checks.

## Review 1 — 2026-08-28

Performed the requested adversarial first-read review without changing product
code. The report is `.factory/review-1.md`.

Fresh live checks at 390 px and desktop, a clean-clone `npm ci && npm test &&
npm run build`, local production-preview checks, Axe, storage-isolation
checks, and live route/link checks were run. The review result is **FAIL**:
the required isolated sample-data demo and claims registry/tests are absent;
the first screen omits its audience and uses unexplained theory terms; and an
unknown URL displays the practice page rather than a designed 404. The report
also records metadata, focus-routing, sitemap, copy, and shared-skeleton
findings.

No product files were modified. This handoff section and the review are the
only review artifacts added.
