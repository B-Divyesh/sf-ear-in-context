# Adversarial first-read review 4 — Ear in Context

**Reviewed:** 2026-08-28 UTC  
**Target:** <https://ear-in-context.sociobot.in>  
**Candidate:** `c2dfe354f904f57d2e14860c9a7df53353b2a7de`  
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900  
**Verdict:** **FAIL — 2 major and 3 minor findings. No blocking finding.**

The cold first screen and sample practice now work. All 19 registered claim
commands pass from a separate clean clone, and the deployed bundle matches the
candidate. The release still cannot pass the required zero-finding standard:
visitor-facing billing, privacy, and license promises are absent from the
claims registry; the test for “stay free” proves only present access; and
three plain-word consistency defects remain.

## Cold first read, before scrolling

I opened the live site in fresh, empty contexts and did not scroll.

At both widths I understood:

- **What it does:** it plays chord patterns and trains me to hear the next
  note or sing it.
- **For whom:** self-taught musicians.
- **What to click first:** **Try sample practice**.

The exact first-screen copy that supplied those answers was:

> “Practice hearing harmony in chord patterns”
>
> “For self-taught musicians who want to hear how notes move together.”
>
> “Try sample practice”
>
> “Hear a short chord pattern, then choose the next note.”

The three facts — **No account**, **Practice audio stays in your browser**, and
**Core practice and CSV export stay free** — were also visible at 390 px. The
primary action ended at y=422 in the 844 px viewport. The fresh load produced
no console error, page error, failed request, horizontal overflow, or
off-origin request. This part passes.

## Findings, ordered by severity

### F-4-1 — MAJOR — live billing, privacy, and license promises are absent from the claims registry

**Exact quotes/locations:**

- Landing settings: **“Checkout and refunds are handled by Sociobot/Dodo.”**
- `/privacy`: **“Practice history, settings, and any Studio license are stored
  in your browser's local storage.”**
- `/privacy`: **“If you buy or verify Studio, your browser contacts the
  Sociobot billing API with your license token.”**
- `/privacy`: **“Sociobot/Dodo is the merchant of record and handles checkout
  records.”**
- `/privacy`: **“This site has no behavioural analytics, ads, or third-party
  scripts.”**
- `/privacy`: **“Browser site settings can remove all data, including your
  locally saved license.”**
- `/terms`: **“Checkout is hosted by Sociobot/Dodo, the merchant of record.”**
- `/terms`: **“Refunds are handled there; a refunded or revoked license stops
  unlocking Studio.”**
- `/terms`: **“A Studio license is for your personal use and may be restored
  on your devices.”**

**Check:** none of these promises appears as a claim in
`.factory/claims.json`. Existing tests provide partial implementation evidence:
`studio-unlock` checks the production checkout URL and a mocked verification
request, while `private-audio` checks demo traffic and remote scripts. They do
not register or prove the quoted merchant, refund, analytics, license-storage,
browser-erasure, revocation, or cross-device statements. A manual crawl did
confirm that the checkout currently redirects to Dodo and displays the $24
product, but an ad hoc live observation is not a clean-sandbox claim test.

**Why this matters:** these sentences affect a visitor's decision to provide a
license token or pay. The registry currently implies that every product promise
is tested when several sensitive promises are not listed.

**Concrete fix:** remove the operational promises that cannot be proved. For
the retained ones, add exact claims and observable tests. At minimum, add a
`no-third-party-runtime` test across every product route, extend the Studio test
to assert actual license storage/removal and revoked-license locking, and add a
recorded billing-contract fixture for merchant/checkout behavior. Replace the
landing sentence with the narrower tested wording **“Studio checkout opens on
Sociobot.”** Keep refund policy only where the billing contract can verify it.

### F-4-2 — MAJOR — “stay free” is a future promise tested only as current access

**Exact quotes/locations:** landing first-screen fact and Studio section, plus
README: **“Core practice and CSV export stay free.”** `/terms` strengthens it
to **“You may use the free core indefinitely.”**

**Check:** `@claim:core-free` passes, but it only opens the three modes and CSV
control in one currently unlicensed browser. It cannot establish “stay” or
“indefinitely.” The observable behavior is current access without Studio, not
a permanent pricing commitment.

**Why this matters:** “stay free” is a purchasing promise. A first-time visitor
can reasonably rely on it when deciding whether to invest practice history in
the tool.

**Concrete fix:** rewrite all occurrences as **“Core practice and CSV export
work without Studio.”** Change the registered claim to the same wording; the
existing test then proves the complete claim. Remove **“indefinitely”** from
Terms unless it is an intentional enforceable commitment outside this test
system.

### F-4-3 — MINOR — “JSON” is unexplained user-facing jargon

**Exact quotes/locations:** landing Studio copy **“Studio adds Clarity and Reed
textures plus a JSON backup.”**; unlocked action **“Back up JSON”**; README
**“It adds two sound textures and a JSON backup.”**

**Why this slows a first-time visitor:** the audience is self-taught musicians,
not developers. “JSON” names a file encoding but does not explain the useful
result or whether the file can restore progress.

**Concrete fix:** use **“Studio adds two sound textures and a downloadable
progress backup.”** Label the action **“Download progress backup”**; mention
**“JSON file”** only in secondary import/export documentation.

### F-4-4 — MINOR — the visible theme button does not name its result

**Exact quote/location:** desktop header button **“Theme”**; at 390 px only the
**“◐”** symbol is visible. Its accessible name is **“Switch color theme”**.

**Why this slows a first-time visitor:** the accessible name is sound, but the
visible mobile control is an unexplained symbol and the desktop noun does not
say which result clicking produces.

**Concrete fix:** show **“Use dark theme”** or **“Use light theme”** according to
the result of the next click, including at 390 px. Keep the same text as the
accessible name.

### F-4-5 — MINOR — the product mixes “practice” and “practise”

**Exact quotes/locations:** title **“Ear in Context — practise hearing
harmony”** and eyebrow **“Three ways to practise”**, versus headline
**“Practice hearing harmony in chord patterns”** and README's repeated
**“practice”** usage.

**Why this slows a first-time visitor:** the copy switches spelling convention
inside one route and between metadata and visible text.

**Concrete fix:** choose one locale. Given the existing headline and README,
use **“Ear in Context — practice hearing harmony”** and **“Three ways to
practice.”**

## Copy audit

Counts use whitespace-separated words; punctuation and the `·` divider do not
count, while visible numbers do. The landing inventory covers the normal
landing state, its collapsed settings copy, and alternate action labels that
appear after interaction. Repeated exercise answer choices are listed once.
No sentence exceeds 22 words. No banned marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to practice | 3 | Clear skip link |
| Ear in Context | 3 | Product name |
| Practice | 1 | Clear nav link |
| Demo | 1 | Clear nav link |
| Privacy | 1 | Clear nav link |
| Theme | 1 | **F-4-4:** visible button is not a result-naming verb |
| Ear training for self-taught musicians | 5 | Clear audience label |
| Practice hearing harmony in chord patterns | 6 | Clear headline; `chord-pattern-practice` |
| For self-taught musicians who want to hear how notes move together. | 11 | Clear audience and situation |
| Try sample practice | 3 | Clear primary action |
| Hear a short chord pattern, then choose the next note. | 10 | `cadence-choice-flow` |
| No account | 2 | `no-account` |
| Practice audio stays in your browser | 6 | `private-audio` |
| Core practice and CSV export stay free | 7 | **F-4-2:** future wording exceeds its test |
| Paper pitch tokens connected by gently moving teal voice paths | 10 | Purposeful image alt text |
| Listen, choose, sing | 3 | Clear section label |
| Today’s ear practice | 3 | Clear heading |
| 0 answered · 0% right | 4 | Clear empty score |
| Explore mode | 2 | Explained by adjacent copy |
| Nothing is scored | 3 | `explore-unscored` |
| Keep current level | 3 | Clear control label |
| Level can change with your score | 6 | `keep-level` |
| Difficulty | 1 | Clear select label |
| 1 · Starter set | 3 | Clear level option |
| 2 · Larger set | 3 | Clear level option |
| 3 · Full set | 3 | Clear level option |
| Higher levels add note roles, chord patterns, or singing targets. | 10 | `level-sets` |
| Note roles (scale degrees) | 4 | Theory term is glossed |
| Progressions | 1 | Clear module tab |
| Sing it back | 3 | Clear module tab |
| Explore mode · preview sounds | 4 | Clear state |
| Scoring mode · answer when ready | 5 | Clear alternate state |
| Level 1 | 2 | Clear state |
| Each line shows one voice. | 5 | `voice-path-diagram` |
| Short paths show notes changing by small steps. | 8 | `voice-path-diagram` |
| Chord pattern with four note groups and one line for each voice. | 12 | Plain accessible diagram name |
| Play chord pattern | 3 | Result-naming action |
| Replay chord pattern | 3 | Result-naming alternate action |
| Your ear | 2 | Understandable in exercise context |
| Which note role comes after the home chord? | 8 | Plain after the note-role gloss |
| Choose any answer to preview its sound. | 7 | `explore-choice-preview` |
| Turn off Explore mode to score your answer. | 8 | `cadence-choice-flow` |
| 1 · home note (tonic) | 4 | Plain term precedes theory term |
| 2 · second (supertonic) | 3 | Plain term precedes theory term |
| 3 · third (mediant) | 3 | Plain term precedes theory term |
| Three ways to practise | 4 | **F-4-5:** spelling conflicts with headline/README |
| Listen, choose, then sing | 4 | Clear heading |
| Play a chord pattern. | 4 | `chord-pattern-practice` |
| Hear where the home chord settles. | 6 | Clear instruction |
| Name the next note. | 4 | `choose-or-sing` |
| Use Note roles or compare Progressions. | 6 | Clear module instruction |
| Sing it back. | 3 | `choose-or-sing` |
| See one sung pitch on the two-octave keyboard. | 8 | `sung-pitch-feedback` |
| Clear boundaries | 2 | Clear section label |
| Generated patterns, not song recordings | 5 | Clear heading |
| The practice makes short chord patterns in your browser. | 9 | `chord-pattern-practice` |
| It does not load songs or record your voice. | 9 | `chord-pattern-practice`, `private-audio` |
| Microphone sound is analysed live and is not retained. | 9 | `private-audio` |
| Optional Studio | 2 | Clear tier label |
| Choose extra sound textures | 4 | Clear heading |
| Studio adds Clarity and Reed textures plus a JSON backup. | 10 | **F-4-3:** unexplained file-format jargon |
| Core practice and CSV export stay free. | 7 | **F-4-2:** future wording exceeds its test |
| $24 | 1 | `studio-unlock` |
| one-time purchase | 2 | `studio-unlock` |
| Buy Studio | 2 | Result-naming action |
| Progress, sound & license | 4 | Clear settings summary |
| Sound texture | 2 | Clear heading |
| Warm · Free | 2 | Clear option and state |
| Clarity · Locked | 2 | Clear option and state |
| Reed · Locked | 2 | Clear option and state |
| Your data | 2 | Clear heading |
| No scored answers yet. | 4 | Clear empty state |
| Turn off Explore mode when you are ready. | 8 | Clear next step |
| Export CSV | 2 | Result-naming action |
| Back up JSON | 3 | **F-4-3:** verb is clear, object is developer jargon |
| Erase local progress | 3 | Result-naming action |
| Restore Studio | 2 | Clear heading |
| Have a license? | 3 | Clear question |
| Paste it here. | 3 | Clear instruction |
| Verify license | 2 | Result-naming action |
| Checkout and refunds are handled by Sociobot/Dodo. | 7 | **F-4-1:** unlisted billing/refund claim |
| Read the terms. | 3 | Clear link action |
| Hear chord patterns, then name or sing the next note. | 10 | `choose-or-sing` |
| Open next question | 3 | Result-naming post-answer action |
| Listen first, then start the mic. | 6 | Clear singing instruction |
| The marker shows your current note—not a recording. | 8 | `sung-pitch-feedback`, `private-audio` |
| Start microphone | 2 | Result-naming action |
| Stop microphone | 2 | Result-naming action |
| Try another target | 3 | Result-naming action |

### README

| Sentence, heading, or action | Words | Result |
| --- | ---: | --- |
| Ear in Context | 3 | Product heading |
| Ear in Context is a browser ear trainer for self-taught musicians. | 11 | Clear description |
| It uses generated chord patterns instead of song recordings. | 9 | `chord-pattern-practice` |
| Try the sample practice. | 4 | Clear link action |
| Play a short chord pattern, choose the next note, or sing it back. | 13 | `cadence-choice-flow`, `choose-or-sing` |
| Use the sample practice | 4 | Clear heading |
| `/demo` and `/?demo=1` open the same sample practice. | 8 | `demo-isolation` |
| The banner offers Reset demo and Open your practice. | 9 | `demo-isolation` |
| Sample progress is separate from normal progress. | 7 | `demo-isolation` |
| Leaving the demo discards the sample and keeps normal progress unchanged. | 11 | `demo-isolation` |
| Explore mode previews choices without scoring them. | 7 | `explore-choice-preview`, `explore-unscored` |
| The tested product promises and their commands are in `.factory/claims.json`. | 10 | **F-4-1:** inaccurate while claims remain unlisted |
| Sample contents and storage are documented in `.factory/demo.md`. | 8 | Clear maintainer note |
| Develop and verify | 3 | Clear heading |
| Use Node.js 20 or newer. | 6 | Clear prerequisite |
| Start `npm run preview -- --host 127.0.0.1` before `npm run audit:a11y`. | 11 | Direct maintainer instruction |
| Run each command in `.factory/claims.json` to verify one product promise at a time. | 13 | Direct maintainer instruction |
| The production build is `dist/`, with `dist/index.html` at its root. | 10 | Clear build result |
| Deploy `dist/` to a static host that applies `staticwebapp.config.json`. | 9 | Technical terms are appropriate in deployment section |
| Privacy and legal pages | 4 | Clear heading |
| Core practice needs no account. | 5 | `no-account` |
| Practice audio stays in the browser. | 6 | `private-audio` |
| Core practice and CSV export stay free. | 7 | **F-4-2:** future wording exceeds its test |
| Studio is an optional $24 one-time purchase. | 7 | `studio-unlock` |
| It adds two sound textures and a JSON backup. | 9 | **F-4-3:** unexplained file-format jargon |
| Read `/privacy` and `/terms` for the user-facing policies. | 8 | Clear link instruction |
| License | 1 | Clear heading |
| MIT. | 1 | Clear license statement |
| See `LICENSE`. | 2 | Clear instruction |

Terminology otherwise stays consistent: **practice**, **sample practice**,
**note role**, **Explore mode**, **Scoring mode**, **chord pattern**, and the
three named difficulty sets. F-4-5 records the one spelling exception.

## Demo and sandbox behavior

**PASS.** From the landing first screen, **Try sample practice** enters `/demo`
in one click. Before scrolling at 390 × 844, the live sample contains:

| Required sample element | Top | Bottom |
| --- | ---: | ---: |
| Voice map | 405.9 | 510.9 |
| Play chord pattern | 554.1 | 605.8 |
| Question | 648.8 | 694.6 |
| First answer | 757.8 | 817.8 |

The banner says **“Demo — sample data, nothing is saved”** and exposes **Reset
demo** and **Open your practice**. The sample starts with two realistic review
records and a 3 answered / 67% right score. The clean test seeded normal
progress, scored and reset the demo, then left it. The normal key stayed
byte-for-byte unchanged; only `demo:ear-in-context:progress:v1` changed, and
leaving deleted that demo key. Reset restored the sample. Direct `/demo` and
`/?demo=1` both work.

The privacy flow intercepted playback, answer preview, denied microphone,
allowed microphone, and stop. It observed same-origin GET requests only,
unchanged localStorage/IndexedDB/Cache Storage during microphone use, no
`MediaRecorder`, audio `Blob`, or object URL creation, and ended microphone
tracks. A service-worker-controlled sample reloaded successfully offline.

## Registered claims

I cloned candidate `c2dfe354f904f57d2e14860c9a7df53353b2a7de` to
`/tmp/eic-review4-clean.is61FY`, ran `npm ci`, and ran every exact `test` value
from `.factory/claims.json` separately. Each command rebuilt the product and
used a fresh browser context.

| Claim ID | Result | Observable check |
| --- | --- | --- |
| `demo-isolation` | PASS | Real key unchanged; reset reseeded; leaving deleted demo key |
| `demo-first-screen` | PASS | Map, play action, question, and answer fit at 390 × 844 |
| `chord-pattern-practice` | PASS | Web Audio oscillators and all three modes exercised |
| `cadence-choice-flow` | PASS | Pattern played; answer produced feedback and changed score |
| `explore-unscored` | PASS | Score and review schedule stayed unchanged |
| `explore-choice-preview` | PASS | Choice produced audio without scoring or disabling choices |
| `choose-or-sing` | PASS | Named-note result and singing target/microphone flow opened |
| `sung-pitch-feedback` | PASS | Synthetic C4 produced C4 text, marker position 12, and stopped track |
| `voice-path-diagram` | PASS | One SVG path per voice and exact plain caption/name |
| `keyboard-controls` | PASS | Space, E, H, number, and N behavior |
| `keep-level` | PASS | Eligible level changed only when hold was off |
| `level-sets` | PASS | Starter/full note, progression, and singing sets differed |
| `private-audio` | PASS | Same-origin GET-only traffic and non-retention probes |
| `no-account` | PASS | Seeded practice opened without account UI |
| `core-free` | PASS with F-4-2 scope gap | Current modes/CSV open without Studio; permanence is not proved |
| `local-data-control` | PASS | Progress/theme persisted; erase removed progress only |
| `csv-export` | PASS | Exact header and two seeded review rows |
| `studio-unlock` | PASS | Price, purchase type, checkout URL, textures, backup, and mocked restore |
| `offline-reload` | PASS | Controlled `/demo` reloaded offline with sample and status |

No listed command failed. F-4-1 records unlisted claims; F-4-2 records a listed
claim whose wording exceeds its observable assertion.

## Earlier finding verification

The local production JS and CSS are byte-identical to the live assets, so the
code and deployed checks refer to the same product. I rechecked every earlier
finding, rather than relying on the polish ledger.

| Earlier ID | Result now | Independent check |
| --- | --- | --- |
| `R1-B1` isolated one-click demo | FIXED | Entry, banner, namespace, reset, exit, and first-screen sample pass |
| `R1-B2` claims/tests absent | FIXED | 19 unique registry commands exist and all pass separately |
| `R1-B3` audience/jargon first screen | FIXED | Job, audience, action, outcome, and three facts visible cold |
| `R1-B4` unknown routes show home | FIXED | Unknown URL and `/404` return HTTP 404 with designed page |
| `R1-M1` metadata/route focus | FIXED | Per-route metadata, h1 focus, announcement, and Back pass |
| `R1-M2` crawl/skeleton | FIXED | Header/footer, sitemap, robots, icons, manifest, and statuses pass |
| `R1-M3` jargon/inconsistent/vague controls | FIXED for quoted controls | Play/replay, next, demo exit, levels, and diagram wording remain repaired |
| `R1-m1` vague headings/adjectives | FIXED | Original metaphors and “honest/musical” adjectives remain absent |
| `R1-C1` unlisted feature claims | FIXED for original inventory | Original feature claims map to tests; F-4-1 concerns later legal/billing copy |
| `R1-C2` original copy inventory defects | FIXED for quoted defects | Scale-degree, cadence, Sandbox, and action defects remain repaired |
| `R2-B1` false “real songs” promise | FIXED | Headline and boundary consistently say generated chord patterns |
| `R2-B2` 404 served 200 | FIXED | Live unknown route and `/404` return 404 |
| `R2-m1` missing behavior claims | FIXED for enumerated behaviors | Choice, Explore, singing, diagram, keyboard, and level tests pass |
| `R2-m2` demo had three names | FIXED | Entry uses “Try sample practice”; destination uses “Sample practice” |
| `R2-m3` jargon before explanation | FIXED for quoted terms | Note role is glossed; Explore and difficulty sets are explained |
| `R2-m4` vague “Start for real” | FIXED | “Open your practice” has discard description and tested behavior |
| `R2-m5` untestable “more musical” | FIXED | Concrete small-step sentence and SVG assertion remain |
| `R2-m6` README deployment jargon | FIXED for quoted sentence | Deployment instruction is short and located in maintainer section |
| `F-3-1` demo below first phone viewport | FIXED | First answer ends at y=817.8 before y=844 |
| `F-3-2` sung pitch lacked output test | FIXED | Synthetic C4 test passes locally and live |
| `F-3-3` non-retention was untested | FIXED | Persistent-store/API/track probes pass locally and live |
| `F-3-4` opaque/non-result practice controls | FIXED | Concrete play/replay/next/backup and level wording remain |

No earlier finding is unfixed, half-fixed, or regressed, so none is reopened as
a blocking finding with its old ID. F-4-1 through F-4-5 are newly identified
scope and copy defects.

## Structure, accessibility, crawl, and visual identity

| Route | HTTP | Title | One h1 / main | Canonical |
| --- | ---: | --- | --- | --- |
| `/` | 200 | Ear in Context — practise hearing harmony | PASS | `/` |
| `/demo` | 200 | Demo — Ear in Context | PASS | `/demo` |
| `/privacy` | 200 | Privacy — Ear in Context | PASS | `/privacy` |
| `/terms` | 200 | Terms — Ear in Context | PASS | `/terms` |
| `/not-a-real-page` | 404 | Page not found — Ear in Context | PASS | unknown URL |

- Descriptions are under 155 characters. Canonicals, OG/Twitter metadata, the
  local 1200 × 630 image, SVG favicon, 180 px touch icon, theme color, `lang`,
  and one h1 are present.
- Deep links, SPA navigation, browser Back, h1 focus, and the polite route
  announcement pass. The designed 404 offers real and sample practice.
- Every rendered link across the five routes was crawled. Product, checkout,
  and Sociobot links resolve. The 404 page's own hash URL correctly retains its
  404 response and is not a dead destination.
- `robots.txt`, XML sitemap, manifest, favicon, touch icon, and social image
  resolve with expected types. The live host supplies CSP, HSTS,
  Referrer-Policy, nosniff, and microphone-only-self Permissions-Policy.
- Local and live Axe runs cover light/dark, home, demo, legal, singing, and
  not-found states: zero serious/critical violations and zero console errors.
  Touch targets, keyboard controls, reduced motion, and mobile overflow checks
  pass.
- The warm paper, coral pitch tokens, teal voice paths, tactile still life,
  serif/sans pairing, and asymmetric layout are product-specific. This is not
  a generic centered SaaS hero or three-card icon template.

F-4-5 is the only title/copy issue; title shape and route differentiation pass.

## Quality and artifact evidence

```text
npm ci                                      PASS — 58 packages, 0 vulnerabilities
npm test                                    PASS — 3 files, 8 tests
npm run build                               PASS — dist/index.html produced
19 claims.json commands, individually       PASS — 19/19
LIVE_URL=... npm run test:live              PASS — 19/19 + route/crawl/focus/mobile
npm run audit:a11y                          PASS — 0 serious/critical, 0 errors
AUDIT_URL=... npm run audit:a11y             PASS — 0 serious/critical, 0 errors
verify-url.sh                               PASS — title/lang/h1/main/alt/console
npm audit --omit=dev                        PASS — 0 vulnerabilities
```

Production output is 33,910 B JS (12.16 kB gzip), 21,531 B CSS (5.23 kB
gzip), and a 38,416 B WebP hero. The live/local SHA-256 values match:

- JS: `a3400d29648ab963c9f0b40f11eca498afaf81a5d1fea8542e24c77f79b53188`
- CSS: `96c01becd5825d6bebbb462fc23e21d71db94ac59d2d1a9d3a2da33b818aab9e`

## Missed leverage

No additional AI feature is expected. Pitch detection, chord generation, and
scheduling are deterministic, local, and latency-sensitive. A model call would
add cost and a network/privacy boundary without improving the brief's core job.
CSV export exists, Studio supplies a full backup, and accountless local storage
makes automatic sync an intentional non-goal. No model request, embedded key,
Azure endpoint, decorative AI, or unexplained AI feature is present.

## What would make this perfect

1. Register and prove, or remove, every billing, analytics, license-storage,
   refund, revocation, and cross-device promise in F-4-1.
2. Replace the untestable future-free wording with current, observable
   **“works without Studio”** wording.
3. Replace JSON format jargon with the user result: a downloadable progress
   backup.
4. Give the theme control a visible result label on mobile and desktop.
5. Use one spelling of **practice** across title, page, and README.

Until those five findings are closed and the full checklist is rerun, the
required verdict remains **FAIL**.
