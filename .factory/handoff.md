# Ear in Context — polish round 3 handoff

## Outcome

Round 3 closes every finding in `.factory/review-1.md`,
`.factory/review-2.md`, and `.factory/review-3.md`. The deployed product
commit is `626453776a6432c70635b62ccaae5f5403352882` (`fix: close round three
review findings`), deployed to <https://ear-in-context.sociobot.in> on
2026-08-28 UTC through `/opt/fleet/lib/deploy-static.sh ear-in-context dist`.

The repaired demo opens directly on a real 390 × 844 exercise. Its persistent
banner remains isolated under the `demo:` namespace. The claims registry now
has 19 observable tests, including synthetic C4 sung-pitch feedback and the
microphone non-retention boundary. The remaining product controls use concrete
result wording and named difficulty sets.

## What changed

- Removed the redundant demo hero and put the sample chord map, **Play chord
  pattern**, question, and first answer in the first phone viewport.
- Kept **Demo — sample data, nothing is saved**, **Reset demo**, and a compact
  **Open your practice** exit action; the screen-reader description explains
  that sample data is discarded.
- Added `demo-first-screen`, `sung-pitch-feedback`, and `level-sets` claims.
  The C4 test sends a 261.625565 Hz stream through the real `getUserMedia`
  path, then checks the C4 text, marker visibility, marker position 12, and
  stopped track.
- Extended the privacy claim to intercept all requests, snapshot localStorage,
  IndexedDB, and Cache Storage, reject `MediaRecorder`/`Blob` use, detect
  object-URL creation, and prove microphone tracks stop.
- Renamed Play/Replay context, Next sound, Backup JSON, the level names, and
  the diagram’s accessible name. Bumped the service-worker cache to v4.

## Exact verification evidence

Fresh clone: `/tmp/eic-polish-3-clean.l9KKxe`, cloned after the repair commit.

```text
npm ci                                      PASS — 58 packages; 0 vulnerabilities
npm test                                    PASS — 3 files, 8 tests
npm run build                               PASS — dist/index.html present
19 claims.json commands, individually       PASS — 19/19
npm run test:browser                         PASS — 19 claims plus routing/crawl/focus/mobile
npm audit --omit=dev                         PASS — 0 vulnerabilities
npm run audit:a11y                           PASS — 0 serious/critical; 0 console errors
```

The clean-clone command log has 38 `PASS @claim:` lines: the 19 individually
run claims plus the same 19 in the aggregate browser suite. The full log is
`/tmp/eic-polish-3-clean.l9KKxe/clean-claim-run.log`.

Live checks after deployment:

```text
/opt/fleet/lib/verify-url.sh https://ear-in-context.sociobot.in ...  PASS
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live        PASS — 19/19 + browser checks
AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y      PASS — 0 serious/critical
```

Live evidence is committed under `.factory/evidence/polish-3-live/`:
`verify.json`, desktop/mobile cold-load screenshots, a mobile browser suite
capture, and one screenshot for every claim. The live JavaScript SHA-256 is
`a3400d29648ab963c9f0b40f11eca498afaf81a5d1fea8542e24c77f79b53188`, identical
to `dist/assets/index-HFUoO4kB.js`.

The live route/status and policy check passed:

```text
/ 200, /demo 200, /privacy 200, /terms 200
/not-a-real-page 404, /404 404
/sitemap.xml 200 text/xml, /manifest.webmanifest 200 application/manifest+json
CSP, Permissions-Policy, preload-eligible HSTS, Referrer-Policy, and nosniff present
Hashed CSS cache policy: public, max-age=31536000, immutable
```

Mobile Lighthouse used Playwright Chromium with `--disable-dev-shm-usage` and
`--disable-gpu`: Performance 100, Accessibility 100, Best Practices 100, SEO
100; LCP 1179.6 ms, CLS 0, TBT 10.5 ms. Raw report:
`.factory/evidence/polish-3-live/lighthouse-local-mobile.json`.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

Run each exact claim command listed in `.factory/claims.json` separately for
the clean-state proof. Use `LIVE_URL=https://ear-in-context.sociobot.in npm run
test:live` for the deployed check.

## Known gaps

None. No review finding remains open. The product remains a Vite + vanilla
TypeScript static web app, and its warm-paper voice-path identity is preserved.
