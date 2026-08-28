# Perfection loop round 2 — finding closure

**Reviewed base:** `139c9a077d5c3890d54ad9fc3c3ef0a845faf6e7`  
**Runtime repair:** `d0575aeca16396498673463e1bd5071577d6d9ad`  
**Live target checked cold:** <https://ear-in-context.sociobot.in> on 2026-08-28 UTC

The review files did not assign machine IDs. The IDs below preserve their
report order: `R1`/`R2`, severity, then ordinal.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| R1-B1 — no isolated one-click demo | `/demo` and `/?demo=1` seed sample progress under `demo:` only. The banner persists, Reset reseeds, and leaving deletes the demo key before restoring untouched normal progress. | `@claim:demo-isolation`; [live demo mobile](evidence/polish-2-live-demo/screenshot-mobile.png); live `/demo` 200 and visible banner/reset/leave controls. |
| R1-B2 — claims registry/tests absent | `.factory/claims.json` now lists 16 observable promises, each with exactly one tagged browser test and clean-state sandbox. | Every registry command passed from clean clone `/tmp/eic-polish-2-clean.yUSCOF`; screenshots in that clone under `test-results/claims/`; all 16 also passed against the live URL. |
| R1-B3 — first screen omits audience and uses jargon | Headline is “Practice hearing harmony in chord patterns”; the next line names self-taught musicians; the action is “Try sample practice”; three tested facts follow. | `@claim:chord-pattern-practice`, `@claim:no-account`, `@claim:private-audio`, `@claim:core-free`; [live home mobile](evidence/polish-2-live/screenshot-mobile.png); live `/` 200. |
| R1-B4 — unknown routes show home | Unknown paths render the product-styled not-found view. Azure routes mark `/404` and every unknown URL as 404 before rewriting the app shell. | Combined browser check asserts response status and heading; [live not-found](evidence/polish-2-live/not-found.png); live `/404` = 404 and `/not-a-real-page` = 404. |
| R1-M1 — route metadata/focus incomplete | Home, Demo, Privacy, Terms, and not-found set distinct titles, descriptions, canonicals, OG/Twitter fields, and `og:url`. Push/back moves focus to the h1 and announces the title. | Combined browser metadata/focus test; [live home desktop](evidence/polish-2-live/screenshot-desktop.png); live titles and focus checks passed. |
| R1-M2 — crawl/skeleton items missing | Header exposes Demo; footer has Privacy, Terms, Param Factory, and v1.2.0. Sitemap, robots, icons, manifest, security headers, and known route rewrites ship in `dist/`. | Combined browser crawl; `sitemap.xml` live as `text/xml`; route/header curl checks; [live home desktop](evidence/polish-2-live/screenshot-desktop.png). |
| R1-M3 — jargon, inconsistent terms, vague actions | First use says “Note roles (scale degrees)”. Visible “Sandbox” became “Explore mode”. The demo-exit action names its result. Cadence jargon was removed from first-use copy. | `@claim:explore-unscored`, `@claim:explore-choice-preview`; `.factory/copy-audit.md`; [live demo mobile](evidence/polish-2-live-demo/screenshot-mobile.png). |
| R1-m1 — vague headings/unverified adjectives | Replaced metaphorical headings with task headings and removed “honest” and subjective “more musical” copy. | `@claim:voice-path-diagram`; copy audit has no banned words or sentence over 22 words; live home screenshot above. |
| R1-C1 — unlisted landing/README promises | All retained behavior is registered: chord modes, choice flow, Explore behavior, singing, diagram, keyboard, level hold, privacy, account-free use, free core/CSV, storage/erase, Studio, and offline reload. Unsupported copy was removed. | 16/16 individual clean-clone claim commands pass; `npm run test:browser` passes; per-claim PNGs in clean clone `test-results/claims/`. |
| R1-C2 — copy inventory defects | Rewrote the landing page and README in plain words and normalized practice, sample practice, note role, Explore mode, Scoring mode, and chord pattern. | `.factory/copy-audit.md`; catalog line is verb-first and 99 characters; live screenshots above. |
| R2-B1 — “real songs” promises the wrong product | Replaced it with “Practice hearing harmony in chord patterns”. A boundaries section says the product uses generated patterns, not song recordings. | `@claim:chord-pattern-practice` observes Web Audio oscillator creation and all three modes; [live home mobile](evidence/polish-2-live/screenshot-mobile.png); live copy checked cold. |
| R2-B2 — designed 404 returns HTTP 200 | Removed the catch-all 200 navigation fallback. Known routes rewrite explicitly; unknown routes receive 404 and the designed shell through `responseOverrides`. | Azure emulator and live browser both assert 404; live curl returned `/404` 404 and `/not-a-real-page` 404; [not-found screenshot](evidence/polish-2-live/not-found.png). |
| R2-m1 — behaviors lack matching claims | Added specific claims for the chord/choice flow, Explore scoring and playback, choose-or-sing, voice-path mapping, keyboard, and level hold. | `@claim:cadence-choice-flow`, `@claim:explore-unscored`, `@claim:explore-choice-preview`, `@claim:choose-or-sing`, `@claim:voice-path-diagram`, `@claim:keyboard-controls`, `@claim:keep-level`; all pass locally and live. |
| R2-m2 — one demo has three names | The action remains “Try sample practice”; page, status, docs, and metadata use “Sample practice”. The chord pattern is supporting text only. | `@claim:demo-isolation`; [live demo mobile](evidence/polish-2-live-demo/screenshot-mobile.png); live `/demo` title is “Demo — Ear in Context”. |
| R2-m3 — jargon before explanation | “Note roles (scale degrees)” defines the theory term at first use. “Explore mode” includes “Nothing is scored”. README developer jargon was rewritten. | Copy audit; `@claim:explore-unscored`; live demo screenshot above. |
| R2-m4 — “Start for real” does not name result | Replaced it with “Leave demo and open your practice”, plus “Sample progress is discarded; saved progress is unchanged.” The implementation actually deletes the demo key. | `@claim:demo-isolation` asserts demo-key deletion and byte-identical normal progress; live demo screenshot above. |
| R2-m5 — “more musical” cannot be tested | Replaced it with “Short paths show notes changing by small steps” and tested one SVG path per voice. | `@claim:voice-path-diagram`; live demo screenshot above. |
| R2-m6 — README deployment jargon | README now says to deploy `dist/` to a static host that applies the shipped config. Platform mechanics remain in maintainer evidence, not product copy. | README copy audit; clean `npm run build` emits `dist/index.html`; live route checks pass. |

## Cross-cutting acceptance evidence

- `npm test`: 3 files, 8 tests passed.
- `npm run test:browser`: all 16 claims plus HTTP routing, metadata, focus,
  crawl, 390 px overflow/touch targets, and console checks passed.
- `npm run audit:a11y`: zero serious/critical Axe findings across light/dark,
  home, demo, legal, singing-keyboard, and not-found states.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 0.9 s, CLS 0, TBT 0 ms.
- Production payload: 33.55 kB JS (12.02 kB gzip), 20.63 kB CSS
  (5.12 kB gzip), and 38.42 kB WebP hero.
- Live headers include strict CSP, HSTS, Referrer-Policy,
  X-Content-Type-Options, and microphone-only-self Permissions-Policy.

No review finding remains open.
