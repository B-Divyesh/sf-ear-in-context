# Independent verification — FAIL

- Work order: `ear-in-context-verify-1` (verifier)
- Candidate commit: `a536ec88186f4f29f331d0b6700beb0653c3d90a`
- Candidate built locally: 2026-08-27 UTC
- Live URL: <https://ear-in-context.sociobot.in>
- Verdict: **FAIL — do not release the paid production site until the two High defects below are fixed and re-verified.**

This is an independent audit. The previous handoff was not used as evidence. There is no `.factory/brief.json` in this checkout, so the injected work order, `AGENTS.md`, source, and live application were the available scope; that missing researched brief is recorded as a process gap.

## Exact build and candidate/live match

From a clean checkout at the candidate SHA:

```text
npm ci                         PASS (58 packages installed)
npm test                       PASS (3 files, 8 tests)
npm run build                  PASS
npm audit --omit=dev           PASS (0 vulnerabilities)
npm run audit:a11y             PASS (0 serious/critical, 0 console errors)
```

The production build emitted 27,580 B JavaScript (10,580 B gzip), 14,564 B CSS (4,000 B gzip), 38,416 B WebP hero, and no font files. Those are within the static-product budgets of 200 KB JS, 50 KB CSS, 120 KB fonts, and 300 KB hero. The source map is 67,442 B and is emitted in `dist/`; it was not requested by the page.

The live deployment is exactly this candidate, not merely visually similar. SHA-256 comparisons matched for `index.html`, `sw.js`, `swa-cli.config.json`, JS, CSS, WebP/JPEG hero, manifest, favicon, and robots file. For example, both local and live `index.html` hash to `9742362e29919ee7e3a2492facf9c4a18df2c0162d2951f03aec7378a9ede218`; both JS bundles hash to `5e8e1e9649afe6db577e3b31fec2efc47e8b67b728cad2ec96b177e19b31dc59`.

## Browser exercise evidence

Chromium/Playwright ran independently at 390 × 844 against both `http://127.0.0.1:4173` (the production build preview) and the live URL.

- Document basics: title, `lang="en"`, one `h1`, one `main`, meaningful hero alt text, no 390 px horizontal overflow, and the three tabs `Scale degrees`, `Progressions`, and `Sing it back` all passed.
- Each training module was selected and its active tab state changed. Space activated context playback; `1` selected a choice; `S`, `H`, and `N` toggled Sandbox/Hold and advanced as documented. The audible engine is functional Web Audio synthesis: exercise data provides IV–V–I/context sequences and compact voice-leading paths; the implementation uses local oscillators. Headless automation cannot judge subjective audio realism or a physical speaker path.
- Sandbox was checked before choosing an answer: the progress key remained unchanged and the live message was `Previewing 1 · tonic. Sandbox does not score answers.` Test mode then produced one stored review and incremented session score. A correct local answer scheduled `degree-1` for one day; a wrong live answer scheduled `degree-2` for ten minutes. The scheduler unit suite also covers expanding correct intervals, missed-item timing, level eligibility, and a strong-accuracy Hold-level case.
- Hold state, Sandbox state, score, per-module levels, and review data persisted through reload in the single local key `ear-in-context:progress:v1`; the Hold control also worked via `H`. This confirms shared state across the three module views.
- The Sing module rendered a labelled 24-key C3–B4 keyboard. With a fake 261.6256 Hz microphone stream, the marker became visible and read `C4 · 0 cents flat`; captured traffic contained only the document, local JS/CSS, and hero asset—no voice/audio upload.
- Permission-denied text was `Microphone access was blocked. Allow it in your browser settings, then try again.` Unsupported input text was `Microphone input is not supported in this browser.`
- After service-worker control was established and the page was reloaded, an offline reload rendered the app (`h1` count 1), the offline banner, and an active service-worker controller. Reduced-motion emulation matched and reduced the voice-column transition to `0.01ms` (`getComputedStyle` serialised it as `1e-05s`).
- Playwright axe scans of Practice, Privacy, and Terms at 390 px found zero total violations, hence zero serious/critical violations, on both candidate and live. The focused checks also recorded zero console errors, page errors, failed requests, or third-party requests during free practice.
- No payment was initiated. The checkout link was inspected only. A local intercepted-license test proved that `?license=mock-license` is stripped from the URL, stored under `sb_license:ear-in-context`, verified with a GET, and invalid verdicts relock Studio with `Your Studio license is no longer active.` The restore field, free CSV export, $24 one-time copy, and Privacy/Terms pages are present. Core free practice does not make billing requests.
- Privacy and legal copy accurately describes local progress and in-memory microphone analysis; free-practice traffic corroborated no analytics, ads, remote fonts, or third-party runtime scripts. Billing verification is the stated, conditional exception.

`npm run audit:a11y` uses Playwright/axe and additionally passed locally. A Lighthouse JSON result was not recorded: the supplied Playwright Chromium did not complete a Lighthouse run in this container within the 25-second command limit. This is a verification gap, not a claimed score; the bundle-budget measurements above are exact.

## Defects

### High — live checkout is pointed at the Pilot API, not production billing

Evidence: the live, byte-identical JS renders the only checkout link as:

```text
https://pilot-api.sociobot.in/api/v1/products/ear-in-context/checkout
```

The paid-unlock contract requires `https://api.sociobot.in/api/v1/products/ear-in-context/checkout` for release. The source defaults to Pilot unless `VITE_BILLING_BASE` is set at build time, and the deployed artifact retains that default. Do not send customers to a test billing environment. Rebuild/redeploy with the production base after product registration, then re-check checkout and verification URLs without completing a purchase.

### High — required live security policy headers are absent

The live `200` response for `/`, the JS bundle, and the manifest includes HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, obsolete `X-XSS-Protection`, and DNS-prefetch control. It does **not** include either `Content-Security-Policy` or `Permissions-Policy`.

The candidate does contain desired CSP and `Permissions-Policy: microphone=(self)` in `dist/swa-cli.config.json`, so the deployed host is not applying that configuration. This breaks the security-header and microphone-policy release requirement. Configure the actual hosting platform to emit those headers, then verify the HTTP response—not only the repository file.

### Medium — live caching and manifest MIME do not match the deployment policy

Live HTML, JS, manifest, and service worker all return `Cache-Control: public, must-revalidate, max-age=30`; the hashed JS is not immutable/long lived. The live manifest is `application/octet-stream`, while the packaged policy calls for `application/manifest+json`. This does not break the exercised offline shell, but it misses the static-PWA cache/mime deployment requirement and wastes cache efficiency. Apply the real static-host configuration and re-test headers.

### Low — researched brief is unavailable in the candidate

`.factory/brief.json` is absent, preventing comparison to the factory's researched opportunity beyond the injected work order and product contract. Restore/retain it for a release audit.

## Release gate

**FAIL.** Functional training, local privacy, PWA offline use after control, mobile layout, keyboard controls, accessibility scan, bundle budgets, and candidate/live identity passed. The live paid-flow environment and security headers do not. Fix the High defects, re-run the header/billing checks and a mobile Lighthouse run, then issue a new verification verdict.
