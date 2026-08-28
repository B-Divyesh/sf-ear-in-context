# Perfection loop round 4 — finding closure

**Reviewed candidate:** `c2dfe354f904f57d2e14860c9a7df53353b2a7de`  
**Repair commit deployed:** `6e1310074f5b53ea5803097058287997e525e343`  
**Deployment:** Azure Static Web Apps deployment `0c238fea-9ccb-482f-9d65-59832e0eea4d`  
**Live target rechecked cold:** <https://ear-in-context.sociobot.in> on 2026-08-28 UTC

Every finding from reviews 1–4 is closed below. “Live browser” means the full
`LIVE_URL=https://ear-in-context.sociobot.in npm run test:live` suite, including
all 21 tagged claims, routing, metadata, focus, mobile, crawl, and console
checks. Live screenshots are retained under `evidence/polish-4-live/`.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| R1-B1 — isolated one-click demo | Kept `/demo` and `?demo=1` as one-click, demo-prefixed storage only, persistent banner, reset, and discard-on-exit behavior. | `@claim:demo-isolation`; [live screenshot](evidence/polish-4-live/claims/demo-isolation.png); live `/demo`. |
| R1-B2 — claim registry/tests absent | Retained the registry and expanded it to 21 independently executable clean-state tests. | Every `.factory/claims.json` command passed from clean clone; live 21/21. |
| R1-B3 — audience/jargon first screen | Kept the plain job headline, self-taught audience, sample action, adjacent outcome, and three tested facts. | [live mobile screenshot](evidence/polish-4-live/screenshot-mobile.png); `@claim:chord-pattern-practice`, `@claim:no-account`, `@claim:private-audio`, `@claim:core-free`. |
| R1-B4 — unknown routes showed home | Retained the designed not-found screen and host-level HTTP 404. | Live browser route check; live `/not-a-real-page` returns 404. |
| R1-M1 — metadata/focus incomplete | Retained route titles, canonical/OG updates, h1 focus, Back restoration, and polite announcement; normalized the home title spelling. | Live browser route/focus check; [URL verifier](evidence/polish-4-live/verify.json). |
| R1-M2 — crawl/skeleton incomplete | Retained Demo navigation, footer provenance/version, sitemap, icons, manifest, headers, and route crawl. | Live browser crawl; live `/sitemap.xml` and static artifacts return expected content. |
| R1-M3 — jargon/inconsistent/vague controls | Retained concrete listening controls and replaced the backup label with **Download progress backup**. | `@claim:cadence-choice-flow`, `@claim:studio-unlock`; [Studio screenshot](evidence/polish-4-live/claims/studio-unlock.png). |
| R1-m1 — vague headings/adjectives | Kept concrete section headings and removed the remaining vague Theme noun. | `.factory/copy-audit.md`; [live home](evidence/polish-4-live/screenshot-desktop.png). |
| R1-C1 — unlisted claims | Registered every retained behavioral, billing, privacy, and runtime statement. | `.factory/claims.json`; each of 21 commands passed independently and live. |
| R1-C2 — original copy inventory defects | Re-audited landing, legal, and README language; terms now use one name for every concept. | `.factory/copy-audit.md`; live cold-home check. |
| R2-B1 — false “real songs” promise | Retained generated chord-pattern wording and no-recordings boundary. | `@claim:chord-pattern-practice`; [live chord practice](evidence/polish-4-live/claims/chord-pattern-practice.png). |
| R2-B2 — designed 404 returned 200 | Retained host-level 404 configuration and route assertion. | Live browser route check; `curl -I /not-a-real-page` = 404. |
| R2-m1 — behavior claims missing | Retained and re-ran choice, Explore, singing, diagram, keyboard, level, privacy, storage, export, and offline claims. | All tagged screenshots under `evidence/polish-4-live/claims/`; live 21/21. |
| R2-m2 — three demo names | Kept **Try sample practice** for entry and **Sample practice** for the destination. | `@claim:demo-isolation`; [live demo](evidence/polish-4-live/claims/demo-isolation.png). |
| R2-m3 — jargon before explanation | Retained first-use note-role gloss, Explore explanation, and named difficulty sets. | `@claim:level-sets`, `@claim:cadence-choice-flow`; live browser check. |
| R2-m4 — vague demo exit | Kept **Open your practice** with its explicit discard description. | `@claim:demo-isolation`; live `/demo`. |
| R2-m5 — untestable “musical” adjective | Retained concrete small-step wording and one-path-per-voice assertion. | `@claim:voice-path-diagram`; [live diagram](evidence/polish-4-live/claims/voice-path-diagram.png). |
| R2-m6 — README deployment jargon | Kept direct maintainer deployment instructions, scoped to the verification section. | README review; clean `npm run build`. |
| F-3-1 — demo exercise below phone viewport | Retained compact demo layout so map, play action, question, and first answer fit at 390 × 844. | `@claim:demo-first-screen`; [live screenshot](evidence/polish-4-live/claims/demo-first-screen.png). |
| F-3-2 — sung pitch lacked observable test | Retained synthetic-C4 test proving label, marker, position, and stopped track. | `@claim:sung-pitch-feedback`; [live screenshot](evidence/polish-4-live/claims/sung-pitch-feedback.png). |
| F-3-3 — microphone retention untested | Retained request, persistent-store, recording-API, object-URL, and stopped-track probes. | `@claim:private-audio`; [live screenshot](evidence/polish-4-live/claims/private-audio.png). |
| F-3-4 — opaque/non-result controls | Kept result-naming play/replay/next controls and clear level/diagram wording; changed backup action to the user result. | `@claim:cadence-choice-flow`, `@claim:level-sets`, `@claim:voice-path-diagram`, `@claim:studio-unlock`. |
| F-4-1 — unregistered billing/privacy/license promises | Removed unverifiable merchant, refund, browser-settings, and cross-device promises. Added `no-third-party-runtime` across every route, a recorded Sociobot/Dodo billing fixture, and full stored/returned/restored/revoked/removed-license coverage. | `@claim:no-third-party-runtime`, `@claim:billing-contract`, `@claim:studio-unlock`; [runtime screenshot](evidence/polish-4-live/claims/no-third-party-runtime.png), [billing screenshot](evidence/polish-4-live/claims/billing-contract.png), [Studio screenshot](evidence/polish-4-live/claims/studio-unlock.png); live `/privacy` and `/terms`. |
| F-4-2 — “stay free” exceeded test scope | Rewrote every instance as **Core practice and CSV export work without Studio**. | `@claim:core-free`; [live screenshot](evidence/polish-4-live/claims/core-free.png); live home, Privacy, Terms, README. |
| F-4-3 — JSON jargon | Replaced visitor-facing JSON wording with **downloadable progress backup** and **Download progress backup**. | `@claim:studio-unlock`; [live Studio screenshot](evidence/polish-4-live/claims/studio-unlock.png). |
| F-4-4 — Theme did not name result | Replaced noun/icon-only control with responsive **Use dark theme** / **Use light theme** labels and matching accessible names. | Live browser mobile check; live Axe light/dark check; [mobile screenshot](evidence/polish-4-live/browser-mobile.png). |
| F-4-5 — mixed practice/practise | Standardized visible copy, title, OG title, and Twitter title on **practice**. | [live verifier](evidence/polish-4-live/verify.json); live title check. |

## Evidence summary

- Clean clone `/tmp/ear-in-context-polish-4.EzbNX1` at
  `6e1310074f5b53ea5803097058287997e525e343`: `npm ci`, `npm test` (8/8),
  `npm run build`, `npm audit --omit=dev`, every one of the 21 registry
  commands separately, aggregate `npm run test:browser`, and `npm run
  audit:a11y` all passed.
- Live deployment: all 21 claims, route/crawl/focus/mobile check, URL verifier,
  and live Axe light/dark/singing/legal/not-found coverage passed with zero
  console errors and zero serious/critical violations.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.0 s, TBT 10 ms, CLS 0. Report:
  `evidence/polish-4-live/lighthouse-live-mobile.json`.

No review finding remains open.
