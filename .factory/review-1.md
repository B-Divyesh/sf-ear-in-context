# Adversarial first-read review 1 — Ear in Context

**Reviewed:** 2026-08-28  
**Target:** `https://ear-in-context.sociobot.in`  
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900  
**Verdict:** **FAIL** — 4 blocking findings, plus major and minor findings.

## Cold first read

Before scrolling, the visitor can infer that this is a music-listening practice
tool and can click **“Open today’s practice.”** The visitor cannot identify who
the tool is for. No first-screen text names a musician, a learner level, or a
practice situation. The headline is also a metaphor rather than the job.

Exact text presented before the first scroll:

> “Hear the path, not the drill.”
>
> “Real voice leading, cadence-anchored notes, and a keyboard that shows what
> you sing. Explore freely, then test when you choose.”

This does not answer “for whom?” within the first screen, and terms such as
“voice leading” and “cadence-anchored” require existing theory vocabulary.
This is blocking under the first-read requirement. The first action is an
in-page anchor, not a try-with-sample-data action.

## Findings, in severity order

### BLOCKING — no isolated one-click demo

**Quote:** “Open today’s practice”; “Sandbox · audition choices freely”.

**Check:** There is no visible **“Try it with sample data”** action. `/demo`
is not a route and `?demo=1` is ignored. In a fresh local production build, the
review seeded real key `ear-in-context:progress:v1` with 77 answers, navigated
to `/?demo=1`, and observed **“77 answered · 86% right”**. There were zero
matches for a demo banner, **Reset demo**, **Start for real**, or a `demo:`
storage key.

**Why this loses or misleads a first-time visitor:** Sandbox is an exercise
scoring setting, not a clearly labelled safe trial. It is enabled initially,
but it writes the real progress key when toggled. A visitor cannot try a
realistic progression without affecting normal local data, and a verifier
cannot establish a clean, repeatable sample state.

**Concrete fix:** Add `/demo` and make the hero action read **“Try sample
practice”** with adjacent text **“Hear a cadence and answer one sample
question.”** Seed a representative cadence, progression, and sung-pitch task.
Show a persistent **“Demo — sample data, nothing is saved”** banner with
**Reset demo** and **Start for real**. Use only `demo:`-prefixed storage while
the banner is present; test that pre-existing real progress is neither read nor
written.

### BLOCKING — claims registry and claim tests are absent

**Quote:** “Private by default. Your audio never leaves this device.”

**Check:** `.factory/claims.json` is absent in the supplied checkout. There
are therefore no listed claim commands to run and no `@claim:<id>` tests. A
fresh clone did pass the unrelated unit suite (8 tests) and build, but that
does not exercise privacy, export, offline, or the live product.

**Why this loses or misleads a first-time visitor:** The landing page and
README make multiple behavioural and privacy promises. With no registry, a
visitor cannot rely on a reproducible proof that these promises hold, including
the microphone and local-storage promises.

**Concrete fix:** Add one registry entry and one clean-state observable test
for each claim listed in the inventory below. Run the tests through `/demo`.
At minimum add interception coverage proving that the whole demo flow makes no
off-origin request, storage coverage proving only `demo:` keys change, an
offline-reload test, and a CSV-download content test. Remove any claim that
cannot be tested.

### BLOCKING — the first screen omits the audience and uses theory jargon

**Quote:** “CONTEXT FIRST. YOUR PACE.”; “Hear the path, not the drill.”;
“Real voice leading, cadence-anchored notes…”

**Why this loses or misleads a first-time visitor:** The page assumes the
visitor already understands the musical concepts while never stating that it is
for self-taught musicians. The README supplies that audience, but a phone
visitor has not opened the README. The current headline does not name the job.

**Concrete fix:** Replace the first screen with, for example:

> **Practice hearing harmony in real songs**  
> For self-taught musicians who want to hear how notes move together.  
> **Try sample practice** — hear a short cadence, then choose the note.

Place three short facts beside it: **No account**, **Audio stays on this
device**, and **Core practice is free** (only after their tests exist).

### BLOCKING — unknown routes render the practice page instead of a designed 404

**Quote:** Navigating to `/not-a-real-page` returned HTTP 200 and displayed
the home h1, “Hear the path, not the drill.”

**Why this loses or misleads a first-time visitor:** A mistyped saved link
appears to succeed but silently opens unrelated practice content. This is
broken routing, not a recoverable empty state.

**Concrete fix:** Add a product-styled 404 route with an explicit h1 such as
**“That practice page does not exist”**, a Home/Practice link, a route-specific
title, and a server 404 response where the host supports it. Add a browser test
for a deep unknown URL.

### MAJOR — route metadata and route-change accessibility are incomplete

**Quote:** `<title>Ear in Context — hear harmony, not drills</title>` is used
on `/`, `/privacy`, `/terms`, and the unknown route.

**Check:** The home has one h1 and a 111-character meta description, but no
canonical link, no Open Graph/Twitter metadata or 1200 × 630 image, and no
apple-touch icon. Client navigation to Privacy left focus on `BODY` and the
Privacy page had no `aria-live` route announcement. The browser Back result
also left focus on `BODY`.

**Why this loses or misleads a first-time visitor:** Shared titles make browser
history and search previews ambiguous. Keyboard and screen-reader users are
not told that a new page has replaced the current one.

**Concrete fix:** Use route titles such as **“Ear in Context — practise hearing
harmony”**, **“Privacy — Ear in Context”**, and **“Terms — Ear in Context”**.
Set canonical, OG, Twitter, and touch-icon metadata. On every `pushState` and
`popstate`, move focus to a tabindex=-1 h1 and announce its new page title in a
polite live region. Add deep-link/back/focus tests.

### MAJOR — required crawl and site skeleton items are missing

**Quote:** `/sitemap.xml` returned the SPA `index.html`, rather than a sitemap.

**Check:** `/`, `/privacy`, `/terms`, `robots.txt`, favicon, and manifest
returned 200. `/sitemap.xml` also returned 200 but its body began with
`<!doctype html>`; no sitemap file exists. The header has Practice and Privacy
but no Demo, and the footer omits “Built by Param Factory” and a version/build
id. The visual system is product-specific rather than a generic SaaS template.

**Why this loses or misleads a first-time visitor:** Search engines receive an
HTML page where an XML sitemap is expected. Visitors have no visible route to
the required safe trial, and no build identifier for support.

**Concrete fix:** Ship a real `sitemap.xml` listing `/`, `/demo`, `/privacy`,
`/terms`, and `/404`; expose Demo in the shared header; add the required footer
provenance and build id. Verify each crawl target has the expected body and
content type.

### MAJOR — copy contains unexplained jargon, inconsistent terms, and vague buttons

**Quote:** “Real voice leading, cadence-anchored notes…”; “Hear the path, not
the drill.”; “Open today’s practice”.

**Why this loses or misleads a first-time visitor:** The page calls the first
module **“Scale degrees”** while its meta description and README call the
exercise **“intervals.”** “Voice leading,” “cadence,” “tonic,” “supertonic,”
“mediant,” and “YIN-style” are not explained before use. “Open today’s
practice” names neither a result nor a safe starting state.

**Concrete fix:** Use **scale degrees** everywhere if that is the task; reserve
**intervals** for an actual interval task. Define theory terms in the first
task or label choices more plainly. Replace the hero button as specified in the
demo finding. Replace the headline with the plain job statement above.

### MINOR — the marketing copy includes unverified adjectives and out-of-context headings

**Quote:** “More colours, same honest core.”; “Stay with the sound”; “Context
first. Your pace.”

**Why this loses or misleads a first-time visitor:** These headings do not say
what section or result follows. “honest” is an unmeasurable marketing adjective.

**Concrete fix:** Use **“Choose a sound texture”**, **“Today’s ear practice”**,
and a concrete audience sentence. Remove “honest.”

## Claim cross-check

Because the registry is absent, every factual statement below is an unlisted
claim. This inventory is intentionally conservative: it includes statements a
visitor could reasonably rely on, not decorative labels.

| Source | Unlisted claim-like copy |
| --- | --- |
| Landing | “Real voice leading, cadence-anchored notes, and a keyboard that shows what you sing.” |
| Landing | “Explore—nothing is scored.” |
| Landing | “Advance when ready.” |
| Landing | “Each line is one voice. Short paths mean smoother, more musical movement.” |
| Landing | “Choose any answer to hear that sound. Toggle Sandbox off when you want feedback.” |
| Landing | “Unlock Clarity and Reed synthesis textures plus a full JSON backup. Core exercises and CSV export stay free.” |
| Landing | “$24 one-time purchase” |
| Landing | “Private by default. Your audio never leaves this device.” |
| README | “Ear in Context is a local-first browser ear trainer …” and “It teaches scale degrees …” |
| README | “Sandbox previews sounds without judging or scheduling … Test mode maintains a per-item spaced-review schedule.” |
| README | “No account is required and microphone audio never leaves the browser.” |
| README | All eight feature bullets, including keyboard controls, offline shell, free CSV, $24 Studio, backup, and reduced-motion support. |
| README | “Progress and settings use `localStorage`; audio is analysed in memory and is neither recorded nor uploaded.” |
| README | “Studio uses only the Sociobot hosted checkout and license API.” |

The claim list should identify the exact page/README locations, exact test
command, demo sandbox, and an observable assertion for each row.

## Copy audit

Counts treat hyphenated compounds and shortcut labels as one word. Labels and
fragments are included where they function as landing copy; these should not be
read as prose sentences.

### Landing page

| Copy | Words | Check / proposed rewrite |
| --- | ---: | --- |
| Context first. | 2 | Vague heading. Use “Hear notes in a chord progression.” |
| Your pace. | 2 | Vague fragment. Move the concrete self-directed benefit into the audience sentence. |
| Hear the path, not the drill. | 6 | Metaphor, not job. Use “Practice hearing harmony in real songs.” |
| Real voice leading, cadence-anchored notes, and a keyboard that shows what you sing. | 13 | Jargon and unlisted claim. Use “Hear a short chord pattern, choose the note, or match it with your voice.” |
| Explore freely, then test when you choose. | 7 | Unlisted behaviour claim. Use “Try the sample without changing your progress.” after it is true and tested. |
| Open today’s practice | 3 | Does not name the result or demo state. Use “Try sample practice.” |
| Practice table | 2 | Out-of-context heading. Use “Today’s ear practice.” |
| Stay with the sound | 4 | Out-of-context heading. Use “Practice one listening question.” |
| Explore—nothing is scored. | 4 | Unlisted claim; replace with the tested demo banner wording. |
| Advance when ready. | 3 | Ambiguous control explanation. Use “Keep this difficulty level.” |
| Each line is one voice. | 6 | Theory term needs a nearby definition or visual label. |
| Short paths mean smoother, more musical movement. | 7 | Unlisted instructional claim and vague “musical.” Use “Lines show how each note moves to the next chord.” |
| Which scale degree follows the cadence? | 6 | Jargon appears without a definition. Use “Which note feels like the next step after this chord?” or teach the term first. |
| Choose any answer to hear that sound. | 7 | Unlisted behaviour claim. Make it specific to demo or test mode. |
| Toggle Sandbox off when you want feedback. | 8 | Product term and state change are unclear. Use “Turn on scoring to check your answer.” |
| More colours, same honest core. | 5 | Marketing adjective and vague heading. Use “Choose extra sound textures.” |
| Unlock Clarity and Reed synthesis textures plus a full JSON backup. | 10 | Unlisted paid-feature claim; use “Studio adds two sound textures and JSON backup” once tested. |
| Core exercises and CSV export stay free. | 7 | Unlisted price/access claim; retain only with free-export test. |
| $24 one-time purchase | 4 | Unlisted price claim; attach to tested billing configuration. |
| Private by default. | 3 | Unverified adjective. Use the specific, tested storage statement. |
| Your audio never leaves this device. | 7 | Privacy claim; needs interception test. |
| Generated hero artwork, 2026. | 4 | Provenance fragment; acceptable if linked to the provenance record. |

Terminology to normalise: use **scale degrees** rather than alternating
**intervals**; use **practice** rather than **practice table**; define or avoid
**voice leading/cadence/tonic/supertonic/mediant**; distinguish a real isolated
**demo** from the scoring setting **Sandbox**.

### README

| Copy | Words | Check / proposed rewrite |
| --- | ---: | --- |
| Ear in Context is a local-first browser ear trainer for self-taught musicians who want musical context instead of mechanical drills. | 20 | Clear audience, but unlisted claims and “local-first” unexplained. Use this audience sentence on the landing page. |
| It teaches scale degrees inside a cadence, identifies compactly voice-led chord progressions, and shows live sung pitch on a piano keyboard. | 21 | Jargon and three ideas. Split into three tested sentences. |
| The learner controls the pace: Sandbox previews sounds without judging or scheduling, Hold level prevents automatic difficulty changes, and Test mode maintains a per-item spaced-review schedule. | 26 | **Over 22 words**, jargon, and three claims. Split into three short tested sentences. |
| No account is required and microphone audio never leaves the browser. | 11 | Two claims. Use “No account is required.” and a separately tested privacy sentence. |
| Cadence-anchored scale-degree identification | 4 | Jargon fragment. Use “Hear which scale degree follows a cadence.” |
| Original, synthesised chord progressions with deliberate voice leading | 7 | “Original” provenance and theory claim need proof/definition. |
| Live monophonic YIN-style pitch detection rendered on a two-octave keyboard | 9 | Unexplained “YIN-style”; use “Shows one sung note on a two-octave keyboard.” |
| Three explicit difficulty levels, global Sandbox and Hold level controls | 9 | Product terms; define them before listing. |
| Per-item local spaced repetition and free CSV progress export | 8 | Two unlisted claims. Split and test. |
| Keyboard controls: Space to listen, 1–6 to answer, S for Sandbox, H for Hold, N for next | 16 | Clear enough but must be tested as an interaction claim. |
| Installable/offline shell, light/dark treatments, reduced-motion support | 6 | Three unlisted claims. Use full sentences with tests. |
| Optional $24 one-time Studio unlock for Clarity/Reed textures and JSON backup | 10 | Price and feature claim; test or remove. |
| Requires Node.js 20 or newer. | 5 | Clear. |
| The reproducible production command is `npm run build`. | 8 | Clear, verify in CI. |
| It emits the static site to `dist/`, with `dist/index.html` at the deploy root. | 13 | Clear, verify in CI. |
| The accessibility audit expects the preview at `http://127.0.0.1:4173` unless `AUDIT_URL` is set and requires Playwright's Chromium. | 18 | Clear but implementation detail; retain in developer documentation. |
| Progress and settings use `localStorage`; audio is analysed in memory and is neither recorded nor uploaded. | 14 | Privacy/storage claims; split and test with interception/storage checks. |
| `/privacy` and `/terms` contain the user-facing policies. | 7 | Verify as route tests. |
| Studio uses only the Sociobot hosted checkout and license API. | 10 | Billing claim; test final destination/configuration. |
| Production defaults to `https://api.sociobot.in`; a staging build may explicitly set `VITE_BILLING_BASE=https://pilot-api.sociobot.in`. | 13 | Developer configuration statement; retain in developer documentation. |
| The product slug is the public route slug, not an embedded provider product ID. | 15 | Developer implementation detail; move from user README if it is customer-facing. |
| Deploy `dist/` as an Azure Static Web App. | 7 | Clear deployment instruction. |
| The Vite public copy emits `staticwebapp.config.json` at the `dist/` root, where Azure applies the SPA fallback, security headers, cache policy, and manifest MIME type. | 22 | At cap and implementation-heavy; split if retained. |
| DNS and billing registration are intentionally outside this repository. | 9 | Clear. |
| MIT. | 1 | Clear. |
| See [LICENSE](LICENSE). | 2 | Clear. |

## Verification record

| Check | Result / evidence |
| --- | --- |
| Live cold load, 390 px and desktop | Loaded without console errors. Mobile first screen showed the headline, jargon-heavy description, “Open today’s practice,” and hero art. |
| Demo entry and storage isolation | Failed as described above; `?demo=1` read the seeded real progress key and created no demo namespace. |
| Claims from clean clone | Failed registry precondition: no `.factory/claims.json`, therefore no claim tests existed to execute. |
| Clean-clone general tests | `npm ci && npm test && npm run build` passed: 3 files / 8 tests; build emitted `dist/` with 10.72 kB gzip JS. These are not claim tests. |
| Local accessibility audit | `npm run audit:a11y` passed with zero serious violations and no console errors. Independent Axe run on home also returned zero violations. |
| Offline/privacy sandbox | Could not be validated through the required demo because no demo exists. Initial home load made no off-origin request; this does not prove the advertised privacy claim across the microphone, export, license, or demo flows. |
| Links and routes | Home, Privacy, Terms, favicon, manifest, and robots returned 200. Checkout returned 303 then 200. Sitemap was SPA HTML, and the unknown route rendered home content. |
| Visual identity | Confirmed distinct warm-paper, voice-path geometry rather than a generic gradient/card SaaS template. |

## Required acceptance retest

1. Start from a fresh browser context at `/demo` and assert the visible sample
   practice appears in one click.
2. Seed real storage, use every demo feature, Reset demo, and prove only
   `demo:` storage changed.
3. Run every `.factory/claims.json` command from a fresh clone; retain command
   output and traces/screenshots for each.
4. Intercept the entire demo flow, including microphone denial/allow path, and
   assert the privacy claim's permitted requests only.
5. Crawl every route and metadata artifact; confirm real sitemap, designed 404,
   per-route title/canonical/OG, and h1 focus/live announcement after forward
   and back navigation.

