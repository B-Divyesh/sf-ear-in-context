# Adversarial first-read review 3 — Ear in Context

**Reviewed:** 2026-08-28 UTC

**Target:** <https://ear-in-context.sociobot.in>

**Candidate:** `9baaf73e4db321da30de91025b42ace96e62e1de`

**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900

**Verdict:** **FAIL — 1 blocking, 2 major, and 1 minor finding.**

The first read is clear and the implemented sandbox is isolated. The review
still fails because the phone demo does not put a usable sample exercise in
its first screen, and two visitor-facing microphone claims lack complete
claim-test coverage. A remaining copy group also fails the plain-word control
rules.

## Cold first read, before scrolling

At both widths, before scrolling, I understood the product as follows:

- **What it does:** it plays generated chord patterns and trains me to identify
  how their notes move.
- **For whom:** self-taught musicians.
- **What to click first:** **Try sample practice**.

The text that supplied those answers was:

> “Practice hearing harmony in chord patterns”
>
> “For self-taught musicians who want to hear how notes move together.”
>
> “Try sample practice”
>
> “Hear a short chord pattern, then choose the next note.”

This passes the cold first-read requirement. At 390 px, all four lines and the
three short facts were visible without scrolling. There were no console or
page errors, failed requests, or off-origin requests on the cold load.

## Findings, ordered by severity

### F-3-1 — BLOCKING — the one-click demo hides the usable sample below the phone viewport

**Earlier finding reopened:** `R1-B1` (half-fixed).

**Quote/location:** after clicking **“Try sample practice”** at 390 × 844, the
first viewport shows **“Demo — sample data, nothing is saved”**, **“Sample
practice”**, **“3 answered · 67% right”**, and three setup controls. It does
not show the voice-path sample, **Play context**, the sample question, an
answer, or the singing keyboard.

**Measured evidence:** at scroll position 0, the viewport ended at y=844. The
module tabs began at y=851.5, the exercise at y=920.6, **Play context** at
y=1156.2, and the question at y=1285.3. The visitor must scroll more than one
screen before any sample can be tried.

**Why this blocks a first-time visitor:** the banner and the score prove that
sample state exists, but they do not show the product doing its job. The demo
contract requires the first screen after one click to show realistic sample
data in the product itself. On the requested phone viewport, the actual ear
exercise is absent.

**Concrete fix:** on `/demo` at 390 px, remove the redundant sample hero and
compress the banner and setup controls so the first sample's voice map,
**Play chord pattern**, question, and at least one answer are in the initial
844 px viewport. Keep the banner persistent in a compact form. Add a browser
test that enters from the home CTA and asserts that the play button, question,
and one answer all have `bottom <= window.innerHeight` before any scroll.

### F-3-2 — MAJOR — sung-pitch feedback is a claim without an observable claim test

**Earlier findings reopened:** `R1-C1` and `R2-m1` (half-fixed).

**Quote/location:** landing how-it-works section: **“See one sung pitch on the
two-octave keyboard.”** The home meta description also promises **“sung-pitch
exercises.”**

**Check:** `.factory/claims.json` has `choose-or-sing`, but its test only opens
the singing tab, checks that a target exists, starts a fake microphone, and
waits for **Stop microphone**. It does not send a known pitch through the
microphone path or assert the detected note and keyboard marker. The
accessibility audit moves the marker by directly setting `data-position`, so
it also does not prove sung-pitch detection.

An independent synthetic 261.63 Hz stream did produce **“C4 · 0 cents sharp”**
and marker position 12. The feature appears to work; the public claim is still
untested under the required claim protocol.

**Why this matters:** live pitch feedback is a core reason to choose this tool.
A test that only proves microphone startup does not prove the promised result.

**Concrete fix:** add a distinct `sung-pitch-feedback` claim and tagged test.
Feed a synthetic 261.63 Hz `MediaStream` through the same `getUserMedia` path,
then assert the C4 label, visible marker, and expected marker position. Also
assert that stopping the microphone stops its track. Alternatively, remove the
sung-pitch sentence and metadata claim.

### F-3-3 — MAJOR — “not retained” is listed but not tested

**Quote/location:** landing boundaries: **“Microphone sound is analysed live
and is not retained.”** The registered `private-audio` claim similarly says
microphone sound is **“not retained.”**

**Check:** `@claim:private-audio` proves that requests are same-origin GETs and
that no remote script or frame is present. It does not compare localStorage,
IndexedDB, Cache Storage, or object-URL state before and after microphone use,
and it does not fail if `MediaRecorder` or audio `Blob` creation is introduced.
Source inspection currently shows an analyser buffer in memory, track stop,
and `AudioContext.close()`, with no recording code. That is implementation
evidence, not the clean-sandbox observable test required for the copy.

**Why this matters:** “not uploaded” and “not retained” are different privacy
promises. The current test proves the former and leaves the latter untested.

**Concrete fix:** extend `@claim:private-audio` to snapshot localStorage,
IndexedDB databases, Cache Storage keys, and persistent object URLs before and
after start/stop. Instrument `MediaRecorder` and audio `Blob` creation to fail
the test if invoked, and assert that the stream track ends. Keep the existing
network interception.

### F-3-4 — MINOR — central controls still use inconsistent or non-result wording

**Earlier findings reopened:** `R1-M3`, `R1-C2`, and `R2-m3` (half-fixed).

**Quote/location:** practice controls use **“Play context”** and **“Replay
context”** while every explanation calls the material a **“chord pattern.”**
The scored-result button says **“Next sound”**, which has no verb. The Studio
button says **“Backup JSON”**, where “backup” is a noun. The level choices
**“Ground / Colour / Tension”** do not tell a learner what becomes harder. The
voice diagram's accessible name says **“voice-leading map”** while the visible
plain copy calls it a line for each voice.

**Why this slows a first-time visitor:** “context” and the level metaphors make
the visitor translate product language before acting. Two buttons do not state
the result as a verb.

**Concrete fix:** use **“Play chord pattern”**, **“Replay chord pattern”**,
**“Open next question”**, and **“Back up JSON.”** Rename the levels **“Starter
set / Larger set / Full set”** and add one line explaining that higher levels
add note roles, chord patterns, or singing targets. Rename the diagram for
screen readers as **“Chord pattern with four note groups and one line for each
voice.”**

## Copy audit

Counts use visible whitespace-separated words; hyphenated terms and paths
count as one word. The `·` divider does not count. The landing
inventory covers the cold normal page plus its expandable settings. Repeated
choice labels are listed once. No sentence exceeds 22 words and no banned
marketing adjective appears.

### Landing page

| Sentence or standalone copy | Words | Result |
| --- | ---: | --- |
| Skip to practice | 3 | Clear link |
| Ear in Context | 3 | Product name |
| Practice | 1 | Clear nav label |
| Demo | 1 | Clear nav label |
| Privacy | 1 | Clear nav label |
| Theme | 1 | Accessible name is “Switch color theme” |
| Ear training for self-taught musicians | 5 | Clear audience label |
| Practice hearing harmony in chord patterns | 6 | Clear headline; `chord-pattern-practice` |
| For self-taught musicians who want to hear how notes move together. | 11 | Clear audience/outcome |
| Try sample practice | 3 | Clear action |
| Hear a short chord pattern, then choose the next note. | 10 | `cadence-choice-flow` |
| No account | 2 | `no-account` |
| Practice audio stays in your browser | 6 | `private-audio` |
| Core practice and CSV export stay free | 7 | `core-free` |
| Paper pitch tokens connected by gently moving teal voice paths | 10 | Descriptive hero alt text |
| Listen, choose, sing | 3 | Clear section label |
| Today’s ear practice | 3 | Clear heading |
| 0 answered · 0% right | 4 | Clear status |
| Explore mode | 2 | Explained beside the control |
| Nothing is scored | 3 | `explore-unscored` |
| Keep current level | 3 | Clear control |
| Level can change with your score | 6 | `keep-level` |
| Level | 1 | Clear label |
| 1 · Ground | 2 | **Flag F-3-4:** opaque level name |
| 2 · Colour | 2 | **Flag F-3-4:** opaque level name |
| 3 · Tension | 2 | **Flag F-3-4:** opaque level name |
| Note roles (scale degrees) | 4 | Theory term is glossed |
| Progressions | 1 | Familiar music label |
| Sing it back | 3 | Clear action label |
| Explore mode · preview sounds | 4 | Clear state |
| Level 1 | 2 | Clear state |
| Each line shows one voice. | 5 | `voice-path-diagram` |
| Short paths show notes changing by small steps. | 8 | `voice-path-diagram` |
| A voice-leading map with 4 harmonic events | 7 | **Flag F-3-4:** unglossed accessible jargon |
| Play context | 2 | **Flag F-3-4:** inconsistent abstract object |
| Your ear | 2 | Section label, not a heading |
| Which note role comes after the home chord? | 8 | Clear after the note-role gloss |
| Choose any answer to preview its sound. | 7 | `explore-choice-preview` |
| Turn off Explore mode to score your answer. | 8 | `cadence-choice-flow` |
| 1 · home note (tonic) | 4 | Plain label precedes theory term |
| 2 · second (supertonic) | 3 | Plain label precedes theory term |
| 3 · third (mediant) | 3 | Plain label precedes theory term |
| Three ways to practise | 4 | Clear section label |
| Listen, choose, then sing | 4 | Clear heading |
| Play a chord pattern. | 4 | `chord-pattern-practice` |
| Hear where the home chord settles. | 6 | Clear instruction |
| Name the next note. | 4 | `choose-or-sing` |
| Use Note roles or compare Progressions. | 6 | Clear module instruction |
| Sing it back. | 3 | `choose-or-sing` |
| See one sung pitch on the two-octave keyboard. | 8 | **Flag F-3-2:** untested outcome |
| Clear boundaries | 2 | Clear section label |
| Generated patterns, not song recordings | 5 | Clear heading |
| The practice makes short chord patterns in your browser. | 9 | `chord-pattern-practice` |
| It does not load songs or record your voice. | 9 | `private-audio`; source confirms |
| Microphone sound is analysed live and is not retained. | 9 | **Flag F-3-3:** retention not tested |
| Optional Studio | 2 | Clear label |
| Choose extra sound textures | 4 | Clear heading |
| Studio adds Clarity and Reed textures plus a JSON backup. | 10 | `studio-unlock` |
| Core practice and CSV export stay free. | 7 | `core-free` |
| $24 | 1 | `studio-unlock` |
| one-time purchase | 2 | `studio-unlock` |
| Buy Studio | 2 | Result-naming action |
| Progress, sound & license | 4 | Clear settings summary |
| Sound texture | 2 | Clear heading |
| Warm / Free | 2 | Clear option/state |
| Clarity / Locked | 2 | Clear option/state |
| Reed / Locked | 2 | Clear option/state |
| Your data | 2 | Clear heading |
| No scored answers yet. | 4 | Clear empty state |
| Turn off Explore mode when you are ready. | 8 | Clear next action |
| Export CSV | 2 | Result-naming action |
| Erase local progress | 3 | Result-naming action |
| Restore Studio | 2 | Clear heading |
| Have a license? | 3 | Clear question |
| Paste it here. | 3 | Clear instruction |
| Verify license | 2 | Result-naming action |
| Checkout and refunds are handled by Sociobot/Dodo. | 7 | Plain legal statement |
| Read the terms. | 3 | Clear link action |
| Hear chord patterns, then name or sing the next note. | 10 | `choose-or-sing` |
| Built by Param Factory | 4 | Clear provenance link |
| v1.2.0 | 1 | Build identifier |

Additional stateful controls checked in source and interaction: **Replay
context** (2 words), **Next sound** (2), and **Backup JSON** (2) are included
in F-3-4. **Start microphone**, **Stop microphone**, **Try another target**,
and **Reset demo** are result-naming actions.

### README

| Sentence, heading, or action | Words | Result |
| --- | ---: | --- |
| Ear in Context | 3 | Product heading |
| Ear in Context is a browser ear trainer for self-taught musicians. | 11 | Clear description |
| It uses generated chord patterns instead of song recordings. | 9 | `chord-pattern-practice` |
| Try the sample practice. | 4 | Clear action |
| Play a short chord pattern, choose the next note, or sing it back. | 13 | `cadence-choice-flow`, `choose-or-sing` |
| Use the sample practice | 4 | Clear heading |
| `/demo` and `/?demo=1` open the same sample practice. | 8 | `demo-isolation` |
| The banner offers Reset demo and Leave demo and open your practice. | 12 | `demo-isolation` |
| Sample progress is separate from normal progress. | 7 | `demo-isolation` |
| Leaving the demo discards the sample and keeps normal progress unchanged. | 11 | `demo-isolation` |
| Explore mode previews choices without scoring them. | 7 | `explore-choice-preview`, `explore-unscored` |
| The tested product promises and their commands are in `.factory/claims.json`. | 10 | Plain maintainer statement |
| Sample contents and storage are documented in `.factory/demo.md`. | 8 | Plain maintainer statement |
| Develop and verify | 3 | Clear heading |
| Use Node.js 20 or newer. | 5 | Clear prerequisite |
| Start `npm run preview -- --host 127.0.0.1` before `npm run audit:a11y`. | 11 | Clear command instruction |
| Run each command in `.factory/claims.json` to verify one product promise at a time. | 13 | Clear verification instruction |
| The production build is `dist/`, with `dist/index.html` at its root. | 10 | Clear build result |
| Deploy `dist/` to a static host that applies `staticwebapp.config.json`. | 9 | Maintainer-specific but direct |
| Privacy and legal pages | 4 | Clear heading |
| Core practice needs no account. | 5 | `no-account` |
| Practice audio stays in the browser. | 6 | `private-audio` |
| Core practice and CSV export stay free. | 7 | `core-free` |
| Studio is an optional $24 one-time purchase. | 7 | `studio-unlock` |
| It adds two sound textures and a JSON backup. | 9 | `studio-unlock` |
| Read `/privacy` and `/terms` for the user-facing policies. | 8 | Clear link instruction |
| License | 1 | Clear heading |
| MIT. | 1 | Clear license statement |
| See `LICENSE`. | 2 | Clear instruction |

No README sentence is over 22 words. No banned adjective, unexplained product
term, inconsistent product name, or non-result CTA was found in the README.

## Demo and sandbox verification

**Isolation and controls: PASS.** `/demo` and `/?demo=1` enter directly. The
banner persists and includes **Reset demo** and **Leave demo and open your
practice**. A normal progress record seeded at 77 answers remained byte-for-byte
unchanged through a demo answer and reset. Leaving deleted
`demo:ear-in-context:progress:v1`, preserved
`ear-in-context:progress:v1`, and restored the 77-answer normal view.

**Realistic sample state: PASS below the fold.** The demo seeds two review
records and displays 3 answered / 67% right. The note-role, progression, and
singing modes are usable. F-3-1 records the blocking first-viewport failure.

**Network/privacy/offline behavior: PASS for the behavior exercised.** The
full play, preview, denied microphone, allowed microphone, and stop flow made
only same-origin GET requests. No remote script or frame was present. A
service-worker-controlled `/demo` reloaded offline and displayed **“Offline
practice is ready.”** F-3-3 records the untested retention half of the copy.

## Declared claims

Each command was run individually from the fresh clone
`/tmp/eic-review3-clean.k10Bti`. All listed commands exited 0.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Real key unchanged; reset reseeded; leave deleted demo key |
| `chord-pattern-practice` | PASS | Oscillators created; all three modes opened |
| `cadence-choice-flow` | PASS | Play, answer, feedback, and score increment |
| `explore-unscored` | PASS | Score and schedule unchanged |
| `explore-choice-preview` | PASS | Oscillator created without disabling choices |
| `choose-or-sing` | PASS with F-3-2 gap | Named answer and microphone startup; pitch result not asserted |
| `voice-path-diagram` | PASS | One path per voice and exact caption |
| `keyboard-controls` | PASS | Space, E, H, number, and N behavior |
| `keep-level` | PASS | Advancement with control off; held with it on |
| `private-audio` | PASS with F-3-3 gap | Same-origin GET-only traffic; retention not asserted |
| `no-account` | PASS | Seeded practice opened without account UI |
| `core-free` | PASS | Three modes and CSV available without license |
| `local-data-control` | PASS | Progress/theme persistence and progress erase |
| `csv-export` | PASS | Exact header and two seeded rows |
| `studio-unlock` | PASS | $24 one-time copy, production checkout, textures, JSON, restore URL |
| `offline-reload` | PASS | Controlled demo reloaded offline |

Because F-3-2 leaves a claim-like sentence without a matching observable test,
and F-3-3 leaves part of a listed claim untested, the review cannot report
“no untested claim.” No listed command itself failed, so there is no additional
blocking claim-test finding.

## Earlier finding verification

The live JS, CSS, and HTML hashes exactly match the local production build.
This table checks each earlier finding against both that code and the live
site, rather than accepting `.factory/polish-2.md` as evidence.

| Earlier ID | Current result | Verification |
| --- | --- | --- |
| `R1-B1` no isolated one-click demo | **HALF-FIXED — F-3-1** | One-click route, namespace, reset, and leave work; actual sample is below the first phone screen |
| `R1-B2` registry/tests absent | FIXED | 16 registry entries and 16 passing tagged commands |
| `R1-B3` audience/jargon first screen | FIXED | Job, self-taught audience, action, outcome, and three facts are above the fold |
| `R1-B4` unknown routes show home | FIXED | `/404` and unknown path return HTTP 404 with designed view |
| `R1-M1` metadata/route focus | FIXED | Per-route titles/canonicals; push, back, focus, and live announcement pass |
| `R1-M2` crawl/skeleton | FIXED | Header/footer, sitemap, robots, icons, manifest, and route statuses pass |
| `R1-M3` jargon/inconsistent terms/vague buttons | **HALF-FIXED — F-3-4** | First screen is plain; practice controls still say context, Next sound, Backup JSON, and metaphorical levels |
| `R1-m1` adjectives/out-of-context headings | FIXED | Earlier marketing adjectives and headings are absent |
| `R1-C1` unlisted claims | **HALF-FIXED — F-3-2** | Broad registry exists; sung-pitch display has no observable claim test |
| `R1-C2` copy inventory | **HALF-FIXED — F-3-4** | Main terms are normalized; named control issues remain |
| `R2-B1` “real songs” false promise | FIXED | Headline says chord patterns; boundary explicitly excludes song recordings |
| `R2-B2` 404 returns 200 | FIXED | Live unknown routes return 404 |
| `R2-m1` behaviors lack claims | **HALF-FIXED — F-3-2/F-3-3** | Most behavior is tested; sung-pitch output and microphone retention are not fully proven |
| `R2-m2` three demo names | FIXED | Action and page consistently use sample practice |
| `R2-m3` jargon before explanation | **HALF-FIXED — F-3-4** | Note roles are glossed; context and level names remain opaque |
| `R2-m4` Start for real vague | FIXED | Exit action names demo exit and practice result |
| `R2-m5` “more musical” untestable | FIXED | Small-step wording is concrete and tested |
| `R2-m6` README deployment jargon | FIXED | Deployment instruction is direct and scoped to maintainers |

## Structure, accessibility, crawl, and visual identity

| Route | HTTP | Title | One h1 / main / header / footer | Canonical |
| --- | ---: | --- | --- | --- |
| `/` | 200 | Ear in Context — practise hearing harmony | PASS | `/` |
| `/demo` | 200 | Demo — Ear in Context | PASS | `/demo` |
| `/privacy` | 200 | Privacy — Ear in Context | PASS | `/privacy` |
| `/terms` | 200 | Terms — Ear in Context | PASS | `/terms` |
| `/not-a-real-page` | 404 | Page not found — Ear in Context | PASS | unknown URL |

- Meta descriptions, canonical links, local SVG favicon, 180 px touch icon,
  theme color, OG/Twitter metadata, and the local 1200 × 630 image are present.
- Direct deep links, SPA navigation, browser Back, h1 focus, and the polite
  route announcement pass. The not-found screen is designed and offers both
  real and sample practice routes.
- Every rendered link across the five routes was crawled. Internal links,
  Sociobot checkout, and Param Factory resolved successfully. The unknown
  route's own skip link correctly retains the route's 404 response.
- `robots.txt`, `sitemap.xml`, manifest, favicon, touch icon, and social image
  return the expected successful status and content type.
- The live CSP, HSTS, referrer, content-type, and microphone permissions
  headers are present. No console/page errors or failed requests occurred.
- Playwright Axe found zero serious/critical violations in light and dark
  themes across home, demo, privacy, terms, singing, and not-found states.
  The keyboard has 14 white and 10 black keys; the marker movement check and
  module arrow keys pass. The factory URL verifier also passed title, `lang`,
  one h1, main, alt text, labelled buttons, and console checks.
- The warm paper, coral pitch tokens, teal voice paths, asymmetric desktop
  layout, and tactile generated still life form a product-specific identity.
  It is not a centered generic SaaS hero or a three-card icon template.

## Quality gates and artifact identity

```text
npm ci                                      PASS — 58 packages, 0 vulnerabilities
npm test                                    PASS — 3 files, 8 tests
npm run build                               PASS
all 16 claims.json commands, individually   PASS
LIVE_URL=... npm run test:live              PASS — claims + routing/crawl/focus/mobile
AUDIT_URL=... npm run audit:a11y             PASS — 0 serious/critical, 0 errors
verify-url.sh                               PASS
```

The build produced 33.55 kB JS (12.02 kB gzip), 20.63 kB CSS (5.12 kB gzip),
and the 38.42 kB WebP hero. Live and local SHA-256 hashes match for HTML, JS,
and CSS.

## Missed leverage

No additional AI feature is expected. Pitch detection, chord generation, and
scheduling are deterministic, local, and latency-sensitive; a model call would
not improve the core job. CSV export exists, Studio supplies JSON backup, and
automatic sync would conflict with the stated local-first/no-account scope.
No decorative AI, embedded provider key, Azure endpoint, or unexplained model
request was found.

## What would make this perfect

1. Put a playable sample exercise, question, and answer in the initial mobile
   demo viewport and lock that requirement with a 390 × 844 test.
2. Register and test actual sung-pitch feedback with a deterministic synthetic
   input.
3. Extend the privacy test to prove microphone audio is not retained, not only
   that it is not uploaded.
4. Replace the remaining context/level metaphors and noun-label buttons with
   concrete result wording.

After those four fixes, rerun this full checklist from a fresh browser context
and clean clone. Until then, the required zero-finding standard is not met.
