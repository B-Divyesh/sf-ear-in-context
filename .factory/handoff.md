# Ear in Context — adversarial review round 4 handoff

## Outcome

Release candidate `c2dfe354f904f57d2e14860c9a7df53353b2a7de` was repaired and
deployed as `6e1310074f5b53ea5803097058287997e525e343`.

Round-four's five findings are closed. The app now has fully registered
billing/privacy/license/runtime claims, an explicit locally stored-license
removal action, a recorded Sociobot checkout contract fixture, bounded
present-tense free-core language, plain progress-backup language, a responsive
result-naming theme control, and consistent **practice** spelling. The isolated
sample, routing, 404, metadata, accessibility, and product-specific warm-paper
voice-path visual system remain intact.

Deployment used the work-order Azure Static Web Apps configuration:

- Static app: `sf-ear-in-context`
- Deployment ID: `0c238fea-9ccb-482f-9d65-59832e0eea4d`
- Live URL: <https://ear-in-context.sociobot.in>

## How to run and verify

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run preview -- --host 127.0.0.1
# In another terminal:
npm run audit:a11y
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y
```

Run each exact command in `.factory/claims.json` independently to verify an
individual claim. The demo entry point is `/demo` or `/?demo=1`; its storage
namespace, seed, reset, and exit behavior are documented in `.factory/demo.md`.

## Exact evidence

- Clean clone: `/tmp/ear-in-context-polish-4.EzbNX1` at repair commit
  `6e1310074f5b53ea5803097058287997e525e343`.
- `npm ci` passed: 58 packages, 0 vulnerabilities.
- `npm test` passed: 3 files, 8 tests.
- `npm run build` passed and emitted `dist/index.html`; production output is
  34.43 kB JS (12.07 kB gzip) and 21.61 kB CSS (5.24 kB gzip).
- All 21 `.factory/claims.json` commands passed separately from that clean
  clone. The aggregate browser suite also passed all 21 claims plus HTTP 404,
  route metadata, focus/Back behavior, mobile overflow/touch targets, crawl,
  and console checks.
- Local and live `npm run audit:a11y` passed: zero serious/critical Axe
  violations and zero console errors across light/dark, home, demo, legal,
  singing, and not-found states.
- Live URL verifier passed: title, `lang`, one h1, main landmark, image alt,
  labelled buttons, and no console errors. Evidence:
  `.factory/evidence/polish-4-live/verify.json`.
- Live claim/routing checks passed 21/21. Screenshots and browser evidence are
  in `.factory/evidence/polish-4-live/`.
- Live Lighthouse mobile passed: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.0 s, TBT 10 ms, CLS 0. Report:
  `.factory/evidence/polish-4-live/lighthouse-live-mobile.json`.
- `npm audit --omit=dev` passed with 0 vulnerabilities.

## Known gaps and next steps

None. All reported findings, including prior rounds' reopened checks, are
closed and rechecked against the deployed production URL.
