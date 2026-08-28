# Perfection loop round 3 — finding closure

**Reviewed base:** `9baaf73e4db321da30de91025b42ace96e62e1de`  
**Repair commit deployed:** `626453776a6432c70635b62ccaae5f5403352882`  
**Live target rechecked cold:** <https://ear-in-context.sociobot.in> on 2026-08-28 UTC

All finding IDs below are retained from the earlier polish ledger. “Reverified”
means the earlier repair was kept and exercised again from the clean clone and
against the deployed production artifact.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| R1-B1 — isolated one-click demo | Removed the demo-only hero, collapsed optional settings, and retained the isolated banner/reset/exit controls so a playable sample is immediately visible at 390 × 844. | `@claim:demo-isolation`, `@claim:demo-first-screen`; [live first screen](evidence/polish-3-live/claims/demo-first-screen.png); live `/demo` 200. |
| R1-B2 — claims/tests absent | Expanded the registry from 16 to 19 exact tagged commands and ran every command individually from a clean clone. | `clean-claim-run.log` 19/19; live `npm run test:live` 19/19. |
| R1-B3 — audience/jargon first screen | Reverified the plain headline, self-taught audience sentence, sample action, adjacent outcome, and three tested facts. | [live mobile home](evidence/polish-3-live/screenshot-mobile.png); `@claim:chord-pattern-practice`, `@claim:no-account`, `@claim:private-audio`, `@claim:core-free`. |
| R1-B4 — unknown route showed home | Reverified the designed 404 route and HTTP 404 response. | `npm run test:browser`; live `/not-a-real-page` and `/404` return 404. |
| R1-M1 — route metadata/focus | Reverified per-route titles/canonicals, h1 focus, Back behavior, and polite route announcement. | `npm run test:browser`; live claims browser check. |
| R1-M2 — crawl/skeleton | Reverified Demo header link, footer provenance/version, sitemap, robots, icons, manifest MIME, and route crawl. | `npm run test:browser`; live `/sitemap.xml` is `text/xml`. |
| R1-M3 — jargon/inconsistent/vague controls | Replaced Play/Replay context with **Play/Replay chord pattern**, and changed remaining control terms in F-3-4. | `@claim:cadence-choice-flow`; live screenshot and test pass. |
| R1-m1 — vague headings/adjectives | Reverified the concrete section headings and absence of subjective marketing copy. | `.factory/copy-audit.md`; live cold home screenshot. |
| R1-C1 — unlisted claims | Added a distinct observable sung-pitch claim; all retained visitor promises map to the registry. | `@claim:sung-pitch-feedback`; `.factory/claims.json`; live 19/19. |
| R1-C2 — copy inventory | Re-audited terminology and result-naming actions, including difficulty sets and diagram text. | `.factory/copy-audit.md`; `@claim:level-sets`, `@claim:voice-path-diagram`. |
| R2-B1 — false “real songs” promise | Reverified generated chord-pattern wording and explicit no-recordings boundary. | `@claim:chord-pattern-practice`; live home copy. |
| R2-B2 — 404 served 200 | Reverified host-level 404 responses after deployment. | live `/404` = 404; `npm run test:browser`. |
| R2-m1 — behavior claims missing | Added the missing observed sung-pitch result and microphone-retention assertions. | `@claim:sung-pitch-feedback`, `@claim:private-audio`; live screenshots in `evidence/polish-3-live/claims/`. |
| R2-m2 — demo had three names | Reverified **sample practice** for the destination and **Try sample practice** for the entry action. | `@claim:demo-isolation`; live `/demo` title. |
| R2-m3 — jargon before explanation | Replaced the remaining abstract control and level language; the note-role gloss and Explore explanation remain in place. | `@claim:cadence-choice-flow`, `@claim:level-sets`; live screenshots. |
| R2-m4 — vague demo exit | Changed the compact exit action to **Open your practice** and retained the discard description for assistive technology. | `@claim:demo-isolation`; live first-screen screenshot. |
| R2-m5 — untestable “musical” adjective | Reverified the concrete small-step diagram sentence. | `@claim:voice-path-diagram`; live diagram screenshot. |
| R2-m6 — README deployment jargon | Reverified direct maintainer deployment wording and no user-facing platform mechanics. | `.factory/copy-audit.md`; clean `npm run build`. |
| F-3-1 — demo exercise below phone viewport | The sample map, **Play chord pattern**, question, and first answer now fit before y=844; optional settings are closed by default. | `@claim:demo-first-screen`; [live demo screenshot](evidence/polish-3-live/claims/demo-first-screen.png); live 390 × 844 check passed. |
| F-3-2 — sung pitch lacked observable test | Added `sung-pitch-feedback`: a synthetic 261.625565 Hz C4 stream uses the actual microphone path and proves C4 text, visible marker, position 12, and a stopped track. | `@claim:sung-pitch-feedback`; [live result](evidence/polish-3-live/claims/sung-pitch-feedback.png); live command passed. |
| F-3-3 — microphone non-retention untested | Privacy test now snapshots persistent stores, blocks recording/blob/object-URL APIs, intercepts the full flow, and confirms every microphone track ends. | `@claim:private-audio`; [live privacy flow](evidence/polish-3-live/claims/private-audio.png); live command passed. |
| F-3-4 — opaque/non-result controls | Renamed the controls, named **Starter/Larger/Full set** difficulty choices, explained what expands, and replaced the diagram accessible name with plain wording. Regression assertions cover replay, next, backup, levels, and the accessible label. | `@claim:cadence-choice-flow`, `@claim:level-sets`, `@claim:voice-path-diagram`, `@claim:studio-unlock`; [live levels](evidence/polish-3-live/claims/level-sets.png); live targeted commands passed. |

## Cross-cutting evidence

- Clean clone `/tmp/eic-polish-3-clean.l9KKxe`: `npm ci`, `npm test`, `npm run
  build`, every registry command individually, aggregate browser suite,
  `npm audit --omit=dev`, and `npm run audit:a11y` all passed.
- Live deployment: URL verifier, 19/19 claim tests, route/crawl/focus/mobile
  browser check, and Axe light/dark/singing/legal/not-found coverage passed.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1179.6 ms, CLS 0, TBT 10.5 ms.
- Production JavaScript and local build match SHA-256
  `a3400d29648ab963c9f0b40f11eca498afaf81a5d1fea8542e24c77f79b53188`.

No finding remains open.
