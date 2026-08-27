# Independent verification 2 — FAIL

- Work order: `ear-in-context-verify-2` (verifier)
- Candidate commit tested: `e4e263e9708aa88ed2b1794d271d0d544302f4b8`
- Live URL tested: <https://ear-in-context.sociobot.in>
- Date: 2026-08-27 UTC
- Verdict: **FAIL — do not release or promote this candidate.**

This verification did not rely on the earlier verifier report or the builder handoff as evidence. The checkout was clean at the specified candidate before `npm ci`; only this report and the handoff were subsequently changed. `.factory/brief.json` is absent, so the work-order's supplied researched brief was used as the scope baseline.

## Release-blocking defects

### High — live CSP breaks the required live singing keyboard and produces console errors

The candidate deliberately ships this live header:

```text
Content-Security-Policy: ... style-src 'self'; ...
```

That policy forbids `style` attributes and JavaScript `element.style` writes. The product requires both in `src/main.ts`: each white and black piano key is generated with a `style` attribute for its horizontal position, and the live pitch marker is positioned through `marker.style.left`.

At 390 x 844 on the deployed URL, opening **Sing it back** emitted **24 CSP console errors**. All fourteen white keys and all ten black keys computed to `left: 0px`; in the candidate production preview their computed positions range across the expected 616 px keyboard. The CSP also blocks the pitch marker's runtime `left` assignment. This makes the brief's central keyboard-rendered singing feedback unusable on production. The production assets are byte-identical to the candidate, so this is a candidate defect, not deployment drift.

Reproduce:

1. Open the live URL in Chromium, mobile viewport 390 x 844.
2. Select **03 Sing it back**.
3. Observe the collapsed piano at its left edge and CSP errors such as `Applying inline style violates ... style-src 'self'`.

### High — Sing it back has a serious WCAG 2 AA contrast failure

An axe scan after selecting **Sing it back** reports one serious `color-contrast` violation on the **Start microphone** button, on both the candidate preview and live deployment. Computed foreground/background are `#f4f0e7` / `#faf7f0`, a **1.06:1** ratio where 4.5:1 is required. The later `.button-row button` background rule overrides `.mic-button`'s intended dark background while its pale text remains.

This violates the explicit release requirement for no serious/critical axe findings and makes the primary sing-back action illegible.

### Medium — ARIA tabs do not support arrow-key navigation

The module controls use `role="tablist"` / `role="tab"`, but focus and selection do not move when ArrowRight is pressed. In a live keyboard-only exercise, focused `01 Scale degrees` remained focused and the selected state stayed `[true, false, false]` after ArrowRight. Tabs remain reachable with Tab and activatable with Enter/Space, but the published tab semantics and the required keyboard arrow support are incomplete.

### Low — the advertised HSTS preload policy cannot qualify for preload

Live responses set `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`. The 126-day `max-age` is below the one-year minimum required for HSTS preload submission, so `preload` is misleading. HSTS itself is present and functioning; this is security-policy hardening, not the release blocker.

### Low — researched brief is not retained in the checkout

`.factory/brief.json` is absent. The supplied brief enabled this audit, but the missing repository artifact prevents an audit that is self-contained for future workers.

## What passed

### Clean install, tests, build, and budget

```text
Node                              v22.23.2
npm ci                            PASS — 58 packages installed
npm test                          PASS — 3 files, 8 tests
npm run build                     PASS — TypeScript check plus Vite production build
npm audit --omit=dev              PASS — 0 vulnerabilities
npm run audit:a11y                PASS on its initial-screen scope
AUDIT_URL=live npm run audit:a11y PASS on its initial-screen scope
```

The exact production command was `npm run build`. It produced `dist/` with 27,574 B JavaScript (10,580 B gzip), 14,564 B CSS (4,000 B gzip), a 38,416 B WebP hero, and no font payload: all within the stated 200 KB JS, 50 KB CSS, 120 KB fonts, and 300 KB hero budgets. Source maps are emitted but not referenced by the page.

Local mobile Lighthouse 13.4.1 (Playwright Chromium) recorded Performance 100, Accessibility 100, Best Practices 100, and SEO 100; LCP 1,210.6 ms, CLS 0, TBT 62.5 ms. It was run on the initial route, so it does not override the state-specific Sing it back axe failure above.

### Candidate/live identity and deployment behaviour

SHA-256 matched exactly for the candidate build and live deployment:

| Asset | SHA-256 |
| --- | --- |
| `index.html` | `884c2d9a7051ecce497f1458d8ae0a8715cd71312995279e5f4339542805fa5f` |
| `assets/index-hPLuZjW2.js` | `c319e3bea01b9ae356ab3761cdcfee37f1d8cbf27789d1517829685cf9d515a9` |
| `assets/index-zNEEL382.css` | `00e6c0b1065ae9ec58bc39667173e9f92796025209106d2bf6411d245da3e823` |
| `assets/voice-paths.webp` | `693212da8df84ba7c7ee6a79bf7e842dff2caabd02a2ae8f52a6cbc0d4d285db` |
| `manifest.webmanifest` | `3211299faaab618384e6fdf16311368a34c4e3222eb5a8f30d3f7b04f1cc8a2f` |
| `sw.js` | `099e676521ebb9991b11df1727502699b444a8f7f87c8733f97a8fd4ddf0257b` |

The live response includes CSP, `Permissions-Policy: microphone=(self)`, `X-Content-Type-Options: nosniff`, referrer policy, and HSTS. Hashed JS and WebP return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache`; and the manifest returns `application/manifest+json`.

On both candidate preview and live: a service worker registered, `registration.update()` completed, the second load was controlled, and an offline reload rendered one `h1` and `Offline practice is ready...`. This verifies the current worker's update check and offline shell; it is not a simulated cross-version deployment.

### Representative product exercise

Chromium/Playwright exercised the candidate desktop at 1440 x 1000 and live mobile at 390 x 844.

- Initial practice has `lang="en"`, one `h1`, one `main`, valid title, no horizontal overflow at 390 px, a visible 3 px / 3 px-offset focus outline, and no initial console/page errors.
- Scale degrees, Progressions, and Sing it back all select. The progression prompt, voice-leading diagram, 24-key C3–B4 keyboard semantics, and Web Audio playback initiation were present. Headless automation cannot assess speaker output musically.
- Sandbox preview made no local review change and announced `Sandbox does not score answers.` Test mode recorded an answer and a local review. `S`, `H`, Space, numeric answer, and `N` after feedback work; `N` returns focus to Play context. Scheduler unit tests pass for one-day correct spacing, ten-minute missed spacing, level eligibility, and Hold level.
- A malformed stored progress value (`{malformed`) recovered to the initial state without page errors. An invalid malformed-looking license value (`<bad token>&x`) was URL-encoded to the production Sociobot verify endpoint, returned the quiet invalid-license message, and did not create a script node. No purchase was initiated.
- Simulated microphone denial and unsupported microphone input displayed actionable messages. Free-practice traffic was same-origin only: no analytics, ads, third-party scripts, remote fonts, or audio upload. The optional billing verification call targets `https://api.sociobot.in`, as required. The privacy/terms routes and localStorage-only privacy statement are present.
- Reduced-motion emulation changes transition duration to `0.01ms`. Initial-screen axe scans on candidate and live reported no violations; the dedicated Sing it back scan found the serious failure described above.

## Release gate

**FAIL.** The deployed site is exactly commit `e4e263e9708aa88ed2b1794d271d0d544302f4b8`, but its production security policy disables the core singing keyboard and it has a serious accessibility violation in the same module. Repair the keyboard/CSP compatibility and microphone-button contrast, add proper tab arrow-key behaviour, then re-run a state-aware browser/axe audit against the new deployed build.
