# Adversarial first-read review 5 — Ear in Context

**Reviewed:** 2026-08-28 UTC  
**Target:** <https://ear-in-context.sociobot.in>  
**Candidate:** `4a2010573bbb597692ced7c0b432d890fba7c5c7`  
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900  
**Verdict:** **FAIL — 1 major and 2 minor findings. No blocking finding.**

The first screen is clear, the one-click sample is usable and isolated, and all
21 registered claim commands pass from a clean clone. The release still fails
the required zero-finding standard. Its paid “progress backup” cannot be
restored, the phone header hides Privacy, and external links are not identified
as external.

## Cold first read, before scrolling

I opened the live site in fresh, empty browser contexts and did not scroll.

At both widths I understood:

- **What it does:** plays chord patterns and trains me to hear the next note or
  sing it.
- **For whom:** self-taught musicians.
- **What to click first:** **Try sample practice**.

The exact first-screen text that supplied those answers was:

> “Practice hearing harmony in chord patterns”
>
> “For self-taught musicians who want to hear how notes move together.”
>
> “Try sample practice”
>
> “Hear a short chord pattern, then choose the next note.”

At 390 px, the three plain facts were also visible: **No account**, **Practice
audio stays in your browser**, and **Core practice and CSV export work without
Studio**. The first load had no console errors, failed requests, off-origin
requests, or horizontal overflow. This check passes.

## Findings, ordered by severity

### F-5-1 — MAJOR — the paid progress “backup” has no restore path

**Exact quotes/locations:** landing Studio section: **“Studio adds Clarity and
Reed textures plus a downloadable progress backup.”**; unlocked settings action:
**“Download progress backup”**; README: **“It adds two sound textures and a
downloadable progress backup.”**

**Check:** the Studio claim test proves that a JSON file downloads. The live UI
and `src/main.ts` contain no file input, import command, restore-preview step, or
backup parser. **Restore Studio** restores a license token, not practice
progress. Searching the source for import/file-upload behavior found no route by
which the downloaded progress can return to the product.

**Why a first-time visitor is misled:** “backup” ordinarily means data that can
be recovered. A visitor is asked to pay $24 for this feature but receives an
archive that Ear in Context cannot restore. The brief's paid-backup feature and
the missed-leverage import/export check both imply a recovery loop, not a
one-way download.

**Concrete fix:** add **Restore progress backup** beside the download action.
Accept the product's JSON file, validate its version and fields, preview the
number of records and settings, and ask the visitor to choose **Replace local
progress** or cancel. Reject malformed files without changing storage. Add a
`progress-backup-restore` claim test that downloads a seeded backup, clears
progress, restores the file, and compares all records and settings. If restore
is intentionally out of scope, rename the feature everywhere to **Download
progress archive** and state that it cannot be imported.

### F-5-2 — MINOR — the 390 px header hides the required Privacy link

**Exact location:** the live 390 px header shows **Ear in Context**, **Demo**,
and **Use dark theme**. It does not show **Privacy**. In
`src/style.css`, the phone rule
`.site-header nav > a:first-child, .site-header nav > a:nth-child(3) { display: none; }`
hides Practice and Privacy.

**Why this slows a first-time visitor:** the site-structure contract requires a
consistent header with Privacy. A phone visitor considering microphone and
local-storage claims must scroll through the full 3,929 px landing page to find
Privacy in the footer. The desktop header does expose it, so the navigation is
not consistent across the two required viewports.

**Concrete fix:** keep Privacy visible at 390 px. Use a two-row or wrapping
header if the wordmark, Demo, Privacy, and the result-naming theme control do not
fit in one row. Add a 390 px browser assertion that the Privacy link is visible
and has a 44 × 44 px target.

### F-5-3 — MINOR — external links do not say that they leave the site

**Exact quotes/locations:** landing action **“Buy Studio”** opens
`api.sociobot.in` and redirects to Dodo; footer **“Built by Param Factory”**
opens `sociobot.in`; Privacy and Terms use **“sociobot.in”** as a contact link.
None has visible or accessible external-link wording.

**Why this slows a first-time visitor:** the site-structure contract requires
external links to say so. This matters most for the purchase action: the next
screen changes origin and enters a hosted checkout. The current text does not
name that immediate result.

**Concrete fix:** rename the purchase action **“Open Studio checkout
(external)”** and add **“(external)”** to the Param Factory and contact links,
either visibly or with an accessible suffix plus a consistent external-link
icon. Add a link audit that asserts every off-origin anchor exposes “external”
in its accessible name.

## Copy audit

Counts use whitespace-separated words; hyphenated terms, paths, and command
tokens count as one word. The `·` separator does not count. No sentence exceeds
22 words, no banned marketing adjective appears, and the terminology remains
consistent. Flags below are the three findings above.

### Landing page

| Copy | Words | Check / proposed rewrite |
| --- | ---: | --- |
| Skip to practice | 3 | Clear skip link |
| Ear in Context | 3 | Product name |
| Practice | 1 | Clear nav link; hidden at 390 px, where the wordmark still links home |
| Demo | 1 | Clear nav link |
| Privacy | 1 | **F-5-2:** retain visibly at 390 px |
| Use dark theme | 3 | Result-naming theme action |
| Use light theme | 3 | Result-naming alternate action |
| Ear training for self-taught musicians | 5 | Clear audience label |
| Practice hearing harmony in chord patterns | 6 | Clear job headline; `chord-pattern-practice` |
| For self-taught musicians who want to hear how notes move together. | 11 | Clear audience and situation |
| Try sample practice | 3 | Clear primary action |
| Hear a short chord pattern, then choose the next note. | 10 | `cadence-choice-flow` |
| No account | 2 | `no-account` |
| Practice audio stays in your browser | 6 | `private-audio` |
| Core practice and CSV export work without Studio | 8 | `core-free` |
| Paper pitch tokens connected by gently moving teal voice paths | 10 | Purposeful image alt text |
| Listen, choose, sing | 3 | Clear section label |
| Today’s ear practice | 3 | Clear heading |
| 0 answered · 0% right | 4 | Clear initial score |
| Explore mode | 2 | Explained beside the control |
| Nothing is scored | 3 | `explore-unscored` |
| Scoring is on | 3 | Clear alternate state; `cadence-choice-flow` |
| Keep current level | 3 | Clear control label |
| Level changes are paused | 4 | `keep-level` |
| Level can change with your score | 6 | `keep-level` |
| Difficulty | 1 | Clear select label |
| 1 · Starter set | 3 | Clear option |
| 2 · Larger set | 3 | Clear option |
| 3 · Full set | 3 | Clear option |
| Higher levels add note roles, chord patterns, or singing targets. | 10 | `level-sets` |
| Note roles (scale degrees) | 4 | Theory term is glossed on first use |
| Progressions | 1 | Clear module tab |
| Sing it back | 3 | Clear module tab |
| Explore mode · preview sounds | 4 | Clear mode state |
| Scoring mode · answer when ready | 5 | Clear alternate state |
| Level 1 | 2 | Clear state |
| Each line shows one voice. | 5 | `voice-path-diagram` |
| Short paths show notes changing by small steps. | 8 | `voice-path-diagram` |
| Chord pattern with four note groups and one line for each voice. | 12 | Plain diagram accessible name |
| Play chord pattern | 3 | Result-naming action |
| Replay chord pattern | 3 | Result-naming alternate action |
| Your ear | 2 | Understandable exercise label |
| Which note role comes after the home chord? | 8 | Plain after the note-role gloss |
| Choose any answer to preview its sound. | 7 | `explore-choice-preview` |
| Turn off Explore mode to score your answer. | 8 | `cadence-choice-flow` |
| 1 · home note (tonic) | 4 | Plain term precedes theory term |
| 2 · second (supertonic) | 3 | Plain term precedes theory term |
| 3 · third (mediant) | 3 | Plain term precedes theory term |
| Three ways to practice | 4 | Clear heading |
| Listen, choose, then sing | 4 | Clear heading |
| Play a chord pattern. | 4 | `chord-pattern-practice` |
| Hear where the home chord settles. | 6 | Clear instruction |
| Name the next note. | 4 | `choose-or-sing` |
| Use Note roles or compare Progressions. | 6 | Clear module instruction |
| Sing it back. | 3 | `choose-or-sing` |
| See one sung pitch on the two-octave keyboard. | 8 | `sung-pitch-feedback` |
| Generated patterns, not song recordings | 5 | Clear boundary heading |
| The practice makes short chord patterns in your browser. | 9 | `chord-pattern-practice` |
| It does not load songs or record your voice. | 9 | `chord-pattern-practice`, `private-audio` |
| Microphone sound is analysed live and is not retained. | 9 | `private-audio` |
| Choose extra sound textures | 4 | Clear Studio heading |
| Studio adds Clarity and Reed textures plus a downloadable progress backup. | 11 | **F-5-1:** add restore or say “downloadable progress archive” |
| Core practice and CSV export work without Studio. | 8 | `core-free` |
| $24 | 1 | `billing-contract`, `studio-unlock` |
| one-time purchase | 2 | `billing-contract`, `studio-unlock` |
| Buy Studio | 2 | **F-5-3:** use “Open Studio checkout (external)” |
| Progress, sound & license | 4 | Clear settings summary |
| Sound texture | 2 | Clear heading |
| Warm · Free | 2 | Clear option and state |
| Clarity · Locked | 2 | Clear option and state |
| Reed · Locked | 2 | Clear option and state |
| Your data | 2 | Clear settings heading |
| No scored answers yet. | 4 | Clear empty state |
| Turn off Explore mode when you are ready. | 8 | Clear next step |
| Export CSV | 2 | Result-naming action |
| Download progress backup | 3 | **F-5-1:** add restore or use “Download progress archive” |
| Erase local progress | 3 | Result-naming action |
| Restore Studio | 2 | Restores the license, not the progress backup |
| Have a license? | 3 | Clear question |
| Paste it here. | 3 | Clear instruction |
| Verify license | 2 | Result-naming action |
| Studio checkout opens on Sociobot. | 5 | `billing-contract` |
| Read the terms. | 3 | Clear link action |
| Hear chord patterns, then name or sing the next note. | 10 | `choose-or-sing` |
| Open next question | 3 | Result-naming action |
| Listen first, then start the mic. | 6 | Clear singing instruction |
| The marker shows your current note—not a recording. | 8 | `sung-pitch-feedback`, `private-audio` |
| Start microphone | 2 | Result-naming action |
| Stop microphone | 2 | Result-naming alternate action |
| Try another target | 3 | Result-naming action |
| Built by Param Factory | 4 | **F-5-3:** append “(external)” |

### Sample practice

| Copy | Words | Check |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | `demo-isolation` |
| Reset demo | 2 | Clear reset action |
| Open your practice | 3 | Clear exit action with described consequence |
| Sample progress is discarded. | 4 | `demo-isolation` |
| Saved progress is unchanged. | 4 | `demo-isolation` |
| Sample practice | 2 | Consistent destination name |
| Practice settings | 2 | Clear disclosure summary |

### README

| Sentence, heading, or action | Words | Check / proposed rewrite |
| --- | ---: | --- |
| Ear in Context | 3 | Product heading |
| Ear in Context is a browser ear trainer for self-taught musicians. | 11 | Clear product and audience |
| It uses generated chord patterns instead of song recordings. | 9 | `chord-pattern-practice` |
| Try the sample practice. | 4 | Clear link action |
| Play a short chord pattern, choose the next note, or sing it back. | 13 | `cadence-choice-flow`, `choose-or-sing` |
| Use the sample practice | 4 | Clear heading |
| `/demo` and `/?demo=1` open the same sample practice. | 8 | `demo-isolation` |
| The banner offers Reset demo and Open your practice. | 9 | `demo-isolation` |
| Sample progress is separate from normal progress. | 7 | `demo-isolation` |
| Leaving the demo discards the sample and keeps normal progress unchanged. | 11 | `demo-isolation` |
| Explore mode previews choices without scoring them. | 7 | `explore-choice-preview`, `explore-unscored` |
| The tested product promises and their commands are in `.factory/claims.json`. | 10 | Accurate; all 21 commands passed |
| Sample contents and storage are documented in `.factory/demo.md`. | 8 | Clear maintainer note |
| Develop and verify | 3 | Clear heading |
| Use Node.js 20 or newer. | 5 | Clear prerequisite |
| Start `npm run preview -- --host 127.0.0.1` before `npm run audit:a11y`. | 11 | Direct maintainer instruction |
| Run each command in `.factory/claims.json` to verify one product promise at a time. | 13 | Direct maintainer instruction |
| The production build is `dist/`, with `dist/index.html` at its root. | 10 | Clear build result |
| Deploy `dist/` to a static host that applies `staticwebapp.config.json`. | 9 | Appropriate maintainer terminology |
| Privacy and legal pages | 4 | Clear heading |
| Core practice needs no account. | 5 | `no-account` |
| Practice audio stays in the browser. | 6 | `private-audio` |
| Core practice and CSV export work without Studio. | 8 | `core-free` |
| Studio is an optional $24 one-time purchase. | 7 | `billing-contract`, `studio-unlock` |
| It adds two sound textures and a downloadable progress backup. | 10 | **F-5-1:** add restore or say “downloadable progress archive” |
| Studio checkout opens on Sociobot. | 5 | `billing-contract` |
| Read `/privacy` and `/terms` for the user-facing policies. | 8 | Clear link instruction |
| License | 1 | Clear heading |
| MIT. | 1 | Clear license statement |
| See `LICENSE`. | 2 | Clear instruction |

Terminology remains consistent: **practice**, **sample practice**, **note
role**, **Explore mode**, **Scoring mode**, **chord pattern**, **Starter/Larger/
Full set**, and **downloadable progress backup**. The last term is consistent
but fails F-5-1 on completeness.

## Demo and sandbox verification

**PASS.** **Try sample practice** enters `/demo` in one click. At 390 × 844,
before scrolling, the sample contained:

| Required item | Top | Bottom |
| --- | ---: | ---: |
| Voice map | 405.9 | 510.9 |
| Play chord pattern | 554.1 | 605.8 |
| Question | 648.8 | 694.6 |
| First answer | 757.8 | 817.8 |

The persistent banner says **“Demo — sample data, nothing is saved”** and
offers **Reset demo** and **Open your practice**. A direct fresh `/demo` visit
created only `demo:ear-in-context:progress:v1`; it did not create the normal
progress key. The registered isolation test seeded normal progress, scored and
reset the sample, left demo mode, and confirmed that the normal value stayed
byte-for-byte unchanged while the sample key was discarded.

The full privacy flow intercepted playback, answer preview, microphone denial,
synthetic microphone input, and stop. It observed allowed same-origin traffic,
no recording API, audio Blob, or object-URL use, unchanged persistent stores,
and stopped media tracks. A service-worker-controlled sample reloaded offline.

## Registered claims

From clean clone `/tmp/ear-in-context-review5.YGUQmh`, I ran every exact `test`
value in `.factory/claims.json` independently. Each command rebuilt the product
and used a fresh browser context.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Normal key unchanged; reset reseeded; exit removed sample key |
| `demo-first-screen` | PASS | Map, play action, question, and answer fit at 390 × 844 |
| `chord-pattern-practice` | PASS | Generated oscillators and all three modes exercised |
| `cadence-choice-flow` | PASS | Pattern played; answer produced feedback and changed score |
| `explore-unscored` | PASS | Score and schedule stayed unchanged |
| `explore-choice-preview` | PASS | Choice played without scoring or disabling answers |
| `choose-or-sing` | PASS | Named-note answer and singing flow opened |
| `sung-pitch-feedback` | PASS | Synthetic C4 produced label, marker position 12, and stopped track |
| `voice-path-diagram` | PASS | SVG path count matched voices and plain caption |
| `keyboard-controls` | PASS | Space, E, H, number, and N behavior |
| `keep-level` | PASS | Eligible level changed only when hold was off |
| `level-sets` | PASS | Starter and full sets differed in all three modes |
| `private-audio` | PASS | Network, storage, recording API, object URL, and track probes |
| `no-account` | PASS | Seeded practice opened without account UI |
| `core-free` | PASS | All modes and CSV available without Studio |
| `local-data-control` | PASS | Progress/theme persisted and erase removed progress |
| `csv-export` | PASS | Exact header and two sample rows |
| `studio-unlock` | PASS | License states, textures, and backup download |
| `billing-contract` | PASS | $24 one-time fixture and checkout URL |
| `no-third-party-runtime` | PASS | All routes loaded without third-party scripts, frames, ads, or analytics |
| `offline-reload` | PASS | Controlled sample reloaded offline with status |

No listed claim is untested and no listed command failed. I found no unlisted
claim-like landing or README sentence. F-5-1 concerns the missing recovery half
of a paid feature, not a failure of the literal download assertion.

## Earlier finding verification

The local production JS and CSS are byte-identical to the live assets. I
rechecked the prior findings against both source and the deployed app rather
than relying on the polish ledgers.

| Earlier ID | Result now | Independent check |
| --- | --- | --- |
| `R1-B1` isolated one-click demo | FIXED | Entry, banner, separate key, reset, exit, and first-screen sample pass |
| `R1-B2` claims/tests absent | FIXED | 21 registry commands exist and pass separately |
| `R1-B3` audience/jargon first screen | FIXED | Job, audience, action, outcome, and three facts are visible cold |
| `R1-B4` unknown routes showed home | FIXED | Unknown URLs and `/404` return 404 with the designed page |
| `R1-M1` metadata/focus incomplete | FIXED | Route titles, canonical/OG data, h1 focus, announcement, and Back pass |
| `R1-M2` crawl/skeleton incomplete | FIXED for the quoted defects | Demo nav, footer, sitemap, icons, manifest, and headers pass; F-5-2 is a new phone-visibility defect |
| `R1-M3` jargon/inconsistent controls | FIXED | Concrete play, next, level, and diagram wording remains |
| `R1-m1` vague headings/adjectives | FIXED | Original metaphors and subjective adjectives remain absent |
| `R1-C1` unlisted claims | FIXED | Retained behavior, billing, privacy, and runtime statements map to tests |
| `R1-C2` original copy defects | FIXED | Terminology is consistent and no sentence exceeds 22 words |
| `R2-B1` false “real songs” promise | FIXED | Headline and boundary say generated chord patterns |
| `R2-B2` 404 served 200 | FIXED | Live unknown paths return HTTP 404 |
| `R2-m1` missing behavior claims | FIXED | Choice, Explore, singing, diagram, keyboard, and level tests pass |
| `R2-m2` three demo names | FIXED | Entry and destination consistently use sample practice |
| `R2-m3` jargon before explanation | FIXED | Note roles, Explore mode, and difficulty sets are explained |
| `R2-m4` vague demo exit | FIXED | Open your practice has an explicit discard description |
| `R2-m5` “more musical” claim | FIXED | Concrete small-step wording remains |
| `R2-m6` README deployment jargon | FIXED | Short instruction is scoped to maintainer verification |
| `F-3-1` demo below phone viewport | FIXED | First answer ends at y=817.8 in the 844 px viewport |
| `F-3-2` sung pitch lacked output test | FIXED | Synthetic C4 test passes locally and live |
| `F-3-3` non-retention untested | FIXED | Persistent-store, API, object URL, and track probes pass |
| `F-3-4` opaque controls | FIXED | Result-naming play/replay/next/backup and clear level wording remain |
| `F-4-1` unregistered sensitive promises | FIXED | Runtime, billing, stored/removed/revoked license tests pass |
| `F-4-2` “stay free” exceeded test | FIXED | Copy says current observable “work without Studio” |
| `F-4-3` JSON jargon | FIXED | Visitor copy says downloadable progress backup; F-5-1 concerns missing restore behavior |
| `F-4-4` theme did not name result | FIXED | Visible control switches between Use dark/light theme at both widths |
| `F-4-5` mixed practice/practise | FIXED | Visible copy and metadata consistently use practice |

No earlier finding is unfixed, half-fixed, or regressed, so none is reopened as
a blocking finding with its earlier ID.

## Structure, accessibility, crawl, and visual identity

| Route | HTTP | Title | One h1 / main | Canonical after load |
| --- | ---: | --- | --- | --- |
| `/` | 200 | Ear in Context — practice hearing harmony | PASS | `/` |
| `/demo` | 200 | Demo — Ear in Context | PASS | `/demo` |
| `/privacy` | 200 | Privacy — Ear in Context | PASS | `/privacy` |
| `/terms` | 200 | Terms — Ear in Context | PASS | `/terms` |
| `/not-a-real-page` | 404 | Page not found — Ear in Context | PASS | unknown URL |

- Meta descriptions are under 155 characters. Canonical, OG/Twitter, local
  1200 × 630 art, favicon, touch icon, theme color, `lang`, and one h1 pass.
- Deep links, History API navigation, Back, h1 focus, and the live announcement
  pass. The 404 is designed and returns HTTP 404.
- Every rendered internal and external link was crawled. Internal links return
  200, the checkout returns its expected 303 redirect, and `sociobot.in`
  returns 200. There are no dead links; F-5-3 concerns labeling.
- `robots.txt`, XML sitemap, manifest, icons, and social image resolve with the
  expected types. CSP, HSTS, Referrer-Policy, nosniff, and microphone policy are
  present.
- Live Axe coverage across light/dark, home, demo, legal, singing, and
  not-found states found zero serious/critical violations and no console
  errors. Touch targets, keyboard use, reduced motion, and overflow checks pass.
- F-5-2 is the one header-structure defect. Footer links and version are present.
- The warm paper, coral tokens, teal voice paths, tactile original artwork,
  serif/sans pairing, and asymmetric practice surface are product-specific.
  This is not a generic SaaS template.

## Quality evidence

```text
npm ci                                      PASS — 58 packages, 0 vulnerabilities
npm test                                    PASS — 3 files, 8 tests
npm run build                               PASS — dist/index.html produced
21 claims.json commands, individually       PASS — 21/21 from clean clone
LIVE_URL=... npm run test:live              PASS — claims + route/crawl/focus/mobile
AUDIT_URL=... npm run audit:a11y             PASS — 0 serious/critical, 0 errors
verify-url.sh                               PASS — title/lang/h1/main/alt/console
```

Production output is 34,426 B JS (12.07 kB gzip), 21,606 B CSS (5.24 kB
gzip), and a 38,416 B WebP hero. Live and local asset hashes match:

- JS: `a4aecab112926839ce8b6c30befcf44082391ffda99e247a1eb215609292929f`
- CSS: `8575343ba55c758f534df3bda85017603b99aaff2e6bce91dd9c26583f5d123a`

## Missed leverage

F-5-1 is the missed leverage: a paid downloadable backup needs a tested restore
path. No AI feature is expected. Pitch detection, chord generation, and
scheduling are deterministic, local, and latency-sensitive; a model call would
add cost and a privacy boundary without improving the brief's core job. No
provider key, Azure endpoint, decorative AI, or unexplained model action is
present.

## What would make this perfect

1. Complete the paid backup loop with validated, previewed progress restore and
   a clean-state round-trip claim test, or rename it as a non-restorable archive.
2. Keep Privacy visible in the 390 px header without shrinking touch targets or
   reverting the result-naming theme label.
3. Mark every off-origin link as external and name the checkout action's actual
   result.

Until all three findings are closed and the entire checklist is rerun, the
required verdict remains **FAIL**.
