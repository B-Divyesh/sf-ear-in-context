# Adversarial first-read review 6 — Ear in Context

**Reviewed:** 2026-08-28  
**Target:** https://ear-in-context.sociobot.in  
**Verdict:** **PASS** — no findings.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened before
scrolling. The phone screen answered the required questions.

- **What it does:** ear training with generated chord patterns: listen, name a
  next note, or sing it back.
- **For whom:** self-taught musicians who want to hear how notes move together.
- **What to click first:** **Try sample practice**; the adjacent text says it
  will play a short chord pattern and ask for the next note.

The first phone screen showed the headline, audience sentence, action, outcome,
and three plain facts. No first-read blocking finding applies.

## Copy audit

Counts use the repository convention: hyphenated words, product names, and
shortcut labels are one word. This lists visitor-facing sentences, headings,
and actions on the initial landing view and README. No item exceeds 22 words;
no banned marketing adjective, inconsistent term, uncontextual heading, or
non-result action was found.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to practice | 3 | Clear skip action |
| Ear in Context | 3 | Product name |
| Practice | 1 | Clear navigation |
| Demo | 1 | Clear navigation |
| Privacy | 1 | Clear navigation |
| Use dark theme / Use light theme | 4 | Names the next result |
| Ear training for self-taught musicians | 5 | Audience label |
| Practice hearing harmony in chord patterns | 6 | Plain job headline |
| For self-taught musicians who want to hear how notes move together. | 11 | Audience and change |
| Try sample practice | 3 | Names the result |
| Hear a short chord pattern, then choose the next note. | 10 | Immediate result |
| No account | 2 | Plain fact |
| Practice audio stays in your browser | 6 | Plain privacy fact |
| Core practice and CSV export work without Studio | 9 | Plain access fact |
| Today’s ear practice | 3 | Contextual section heading |
| Nothing is scored | 3 | Explains Explore mode |
| Level changes are paused | 4 | Explains held-level state |
| Level can change with your score | 6 | Explains automatic state |
| Higher levels add note roles, chord patterns, or singing targets. | 10 | Explains difficulty |
| Note roles (scale degrees) | 4 | Defines theory term at first use |
| Each line shows one voice. | 5 | Diagram explanation |
| Short paths show notes changing by small steps. | 8 | Diagram explanation |
| Choose any answer to preview its sound. | 7 | Explains Explore result |
| Turn off Explore mode to score your answer. | 8 | Explains next action |
| Play chord pattern / Replay chord pattern | 6 | Result-naming action |
| Open next question | 3 | Result-naming action |
| Three ways to practice | 4 | Contextual section heading |
| Listen, choose, then sing | 4 | Contextual section heading |
| Play a chord pattern. | 4 | Step one |
| Hear where the home chord settles. | 6 | Step-one instruction |
| Name the next note. | 4 | Step two |
| Use Note roles or compare Progressions. | 6 | Step-two instruction |
| Sing it back. | 3 | Step three |
| See one sung pitch on the two-octave keyboard. | 8 | Step-three outcome |
| Generated patterns, not song recordings | 5 | Concrete boundary heading |
| The practice makes short chord patterns in your browser. | 9 | Concrete capability |
| It does not load songs or record your voice. | 9 | Concrete boundary |
| Microphone sound is analysed live and is not retained. | 9 | Concrete privacy statement |
| Choose extra sound textures | 5 | Contextual Studio heading |
| Studio adds Clarity and Reed textures plus a progress backup you can restore. | 12 | Concrete paid result |
| Core practice and CSV export work without Studio. | 9 | Concrete access statement |
| $24 / one-time purchase | 3 | Concrete price |
| Open Studio checkout (external) | 4 | Names destination/result |
| Progress, sound & license | 3 | Contextual settings heading |
| Export CSV | 2 | Result-naming action |
| Download progress backup | 3 | Result-naming action |
| Restore progress backup | 3 | Result-naming action |
| Erase local progress | 3 | Result-naming action |
| Have a license? Paste it here. | 6 | Clear form instruction |
| Verify license | 2 | Result-naming action |
| Studio checkout opens on Sociobot. | 5 | Concrete provider statement |
| Hear chord patterns, then name or sing the next note. | 10 | Footer one-liner |
| Built by Param Factory (external) | 5 | External destination disclosed |

The exercise labels **home note (tonic)**, **second (supertonic)**, and
**third (mediant)** retain technical names alongside plain synonyms; they are
not unexplained first-use jargon.

### Demo-only copy

| Copy | Words | Check |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Persistent sandbox status |
| Reset demo | 2 | Result-naming action |
| Open your practice | 3 | Result-naming exit action |
| Sample progress is discarded; saved progress is unchanged. | 8 | Explicit exit consequence |
| Sample practice | 2 | Consistent demo name |

### README

| Sentence | Words | Check |
| --- | ---: | --- |
| Ear in Context is a browser ear trainer for self-taught musicians. | 11 | Audience stated |
| It uses generated chord patterns instead of song recordings. | 8 | Concrete scope boundary |
| Play a short chord pattern, choose the next note, or sing it back. | 12 | Concrete outcome |
| /demo and /?demo=1 open the same sample practice. | 8 | Clear entry path |
| The banner offers Reset demo and Open your practice. | 9 | Clear demo controls |
| Sample progress is separate from normal progress. | 7 | Concrete sandbox statement |
| Leaving the demo discards the sample and keeps normal progress unchanged. | 11 | Concrete exit statement |
| Explore mode previews choices without scoring them. | 7 | Defined product term |
| The tested product promises and their commands are in .factory/claims.json. | 10 | Maintainer pointer |
| Sample contents and storage are documented in .factory/demo.md. | 8 | Maintainer pointer |
| Core practice needs no account. | 5 | Plain access statement |
| Practice audio stays in the browser. | 6 | Plain privacy statement |
| Core practice and CSV export work without Studio. | 9 | Plain access statement |
| Studio is an optional $24 one-time purchase. | 7 | Concrete price |
| It adds two sound textures and a progress backup you can restore. | 11 | Concrete paid result |
| Studio checkout opens on Sociobot. | 5 | Concrete provider statement |
| Use Node.js 20 or newer. | 5 | Maintainer prerequisite |
| Start npm run preview -- --host 127.0.0.1 before npm run audit:a11y. | 11 | Maintainer instruction |
| Run each command in .factory/claims.json to verify one product promise at a time. | 13 | Maintainer instruction |
| The production build is dist/, with dist/index.html at its root. | 10 | Maintainer instruction |
| Deploy dist/ to a static host that applies staticwebapp.config.json. | 9 | Maintainer instruction |
| Read /privacy and /terms for the user-facing policies. | 8 | Clear legal links |
| MIT. | 1 | License identifier |
| See LICENSE. | 2 | License pointer |

## Demo and sandbox

**Try sample practice** reaches /demo in one click. The first phone screen
contained the banner, seeded score (**3 answered · 67% right**), voice-path
diagram, **Play chord pattern**, question, and first answer. The sample is
representative rather than placeholder content.

The persistent banner read **“Demo — sample data, nothing is saved”** and
offered **Reset demo** and **Open your practice**. Reset reseeded the sample;
leaving removed the demo key and retained the normal progress key. The live
demo-isolation probe passed. Source confirms separate read/write keys and
discard-on-exit behaviour.

Live network-intercepted private-audio and offline-reload probes passed:
practice used same-origin GETs only, microphone use did not use
recording/blob/object-URL persistence APIs and stopped its tracks, and the
sample reopened offline after first visit.

## Claims and clean-clone verification

.factory/claims.json contains 22 claims, each with one tagged command and
clean-state sandbox. In fresh clone /tmp/ear-in-context-review-6 at
cd507271e2bcb86cd61fe804d028c52ac6bc2ee8:

- npm ci, npm test (10 tests), and npm run build passed.
- Every exact listed claim command passed; test-results/claims contains
  evidence PNGs for all 22 ids.
- Live demo-isolation, privacy, and offline rechecks passed.

The live landing page and README were cross-checked against the registry.
Every visitor-reliant capability, privacy statement, price/access statement,
and Studio statement has a listed claim. No unlisted claim was found.

## Earlier findings

Read review-1.md through review-5.md, polish-2.md through polish-5.md, and
the preceding handoff. These were confirmed on live behaviour and in source,
not accepted from their status labels.

| Earlier finding group | Independent confirmation |
| --- | --- |
| R1-B1/B2/B3/B4 | One-click isolated demo; 22-command registry; clear first screen; designed live HTTP 404. |
| R1-M1/M2/M3, R1-m1/C1/C2 | Per-route metadata/focus, complete skeleton/static files, plain terms/actions, registered claims. |
| R2-B1/B2, R2-m1–m6 | Generated-pattern scope, HTTP 404, matching claims, one demo name, defined terms, concrete exit/diagram/README text. |
| F-3-1–F-3-4 | First answer fits at 390 px; synthetic sung-pitch; non-retention interception; result-naming controls. |
| F-4-1–F-4-5 | Billing/privacy/license coverage; no future-free promise; plain backup term; result-naming theme; consistent practice spelling. |
| F-5-1–F-5-3 | Versioned restore/validation; visible 44 px Privacy target; every off-origin link says (external). |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and visual identity

Confirmed on /, /demo, /privacy, /terms, and an unknown route:

- Route-specific titles, one h1, descriptions, canonicals, OG image, lang,
  favicon, apple-touch icon, theme colour, and a designed 404 are present.
- The unknown route returns HTTP 404 with **“That practice page does not
  exist”** and **Open practice**.
- Deep links render the correct state. Client navigation and Back move focus to
  the new h1 and update the polite live announcement.
- Header/footer are consistent and include Demo, Privacy, Terms, Param Factory,
  and v1.2.0. Robots, XML sitemap, manifest, and referenced static assets
  responded successfully.
- No console error occurred except Chromium’s expected failed-resource notice
  for the intentional 404 response.
- The warm-paper, coral, teal, pitch-token, and voice-path identity follows the
  thesis and is not a generic SaaS template.

## Missed leverage

No missing AI feature is expected: the brief calls for local, live listening
practice rather than a generative task, and AI would weaken its offline/privacy
core. CSV export and paid backup/restore are present. No provider key or
decorative AI feature appears in source or the live runtime.

## What would make this perfect

No required product change remains. Preserve the 22 clean-state claim commands
and rerun the cold phone, offline, privacy, route, and link checks after future
copy, storage, billing, or routing changes.
