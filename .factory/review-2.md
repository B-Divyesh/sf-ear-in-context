# Adversarial first-read review 2 — 2026-08-28

**Verdict: FAIL**

The first screen is visually distinctive and the demo is immediately usable, but the release fails the honesty and routing checks. There are two BLOCKING findings and more than three minor findings.

## Cold first read

Tested live in fresh Playwright contexts at 390 × 844 and 1440 × 900, without scrolling.

At 390 px I understood: this is ear training for self-taught musicians; it plays a chord pattern and asks me to identify or sing the next note; I should tap “Try sample practice”. The next screen identifies itself as a sample, already shows “3 answered · 67% right”, and contains a live question. That passes the basic what / who / click-first check.

However, “in real songs” materially changes that understanding. This product accepts neither recordings nor songs. Source review confirms that it generates short MIDI chord sequences with Web Audio oscillators.

## Findings, ordered by severity

### BLOCKING — headline promises a different product

**Quote:** “Practice hearing harmony in real songs”

**Why a first-time visitor is misled:** This reasonably promises practice using songs, song excerpts, or a visitor’s music. The primary action delivers generated cadence and progression exercises. The promise is false at the decision point and is not registered in claims.json.

**Evidence:** src/music.ts contains fixed MIDI chord arrays, while src/audio.ts creates OscillatorNodes. The live demo says “Sample cadence loaded”.

**Concrete fix:** Rewrite as **“Practice hearing harmony in chord patterns”**. Add a chord-pattern-practice claim and clean-demo test that presses Play context and verifies generated chord practice plus scale-degree, progression, and singing modes. Do not use “real songs” without actual song material and a test.

### BLOCKING — designed not-found page is served with HTTP 200

**Quote / observed result:** “That practice page does not exist”; GET /404 → 200 and GET /not-a-real-page → 200 on the live host.

**Why a first-time visitor is misled:** A broken or shared bad URL shows an error, but browsers, crawlers, caches, and link checkers are told that the request succeeded. This is broken routing, which site structure makes blocking.

**Concrete fix:** Deploy a fallback that returns the app shell with HTTP 404 for unknown paths, including /404, while retaining the designed view. Add a deployed-route test that asserts fetch('/not-a-real-page').status === 404 rather than only checking the heading.

### Minor — advertised behaviours have no matching claims

The existing registry covers No account, browser audio, demo isolation, CSV export, Studio price/unlock, and offline reload. The following testable promises are unlisted claims.

| Quote | Why visitor relies on it | Concrete fix |
| --- | --- | --- |
| “Hear a short chord pattern, then choose the next note.” | Promises the primary exercise flow. | Add @claim:cadence-choice-flow: open /demo, play context, complete an answer. |
| “Explore—nothing is scored” | Promises Sandbox has no scoring consequence. | Add @claim:sandbox-unscored: change Sandbox, answer, prove score/review state stays unchanged. |
| “Each line is one voice. Short paths mean smoother, more musical movement.” | Explains central diagram and makes a quality assertion. | Keep only “Each line shows one voice” unless the movement assertion is defined and tested. |
| “Choose any answer to hear that sound.” | Promises audition behaviour. | Add @claim:sandbox-choice-preview, asserting choice previews without scoring. |
| “Hear chord patterns, then name or sing the next note.” | Promises naming and sung-pitch flows. | Add @claim:choose-or-sing, exercising both from /demo. |
| README: “The product includes scale-degree, progression, and sung-note practice.” | Repeats a concrete feature promise. | Use choose-or-sing, or remove the promise. |
| README: “The static build deploys as an Azure Static Web App; staticwebapp.config.json ships with the output and provides headers and the navigation fallback.” | Makes deployment, security, and routing promises. | Use an implementation note without outcome promises or add artifact/deployed-header test. |

### Minor — one demo has three names

**Quotes:** “Try sample practice”; “Sample harmony practice”; “Sample cadence loaded”.

**Why a first-time visitor is lost:** These labels describe one entry point as an activity, a full practice, and one musical item.

**Concrete fix:** Use **“Try sample practice”** for the action and **“Sample practice”** for page/status; describe the cadence only in supporting text.

### Minor — jargon appears before its explanation

**Quotes:** “Scale degrees”; “Sandbox”; README: “Its executable behavioural claims”; README: “local-storage key”.

**Why a first-time visitor is lost:** A self-taught musician may not know the theory term, and the other terms are developer language. Sandbox is only explained after its label.

**Concrete fix:** Use **“Note roles (scale degrees)”** on first use and **“Explore mode”** with “Nothing is scored”. Rewrite the README as “The tested product promises are listed in…” and “Demo progress is stored only in…”.

### Minor — button does not name the result

**Quote:** “Start for real”

**Why a first-time visitor is lost:** It does not say whether it creates an account, copies the sample, erases the sample, or starts empty practice.

**Concrete fix:** Use **“Leave demo and start empty practice”** with “Your sample progress is discarded.”

### Minor — untestable marketing adjective

**Quote:** “Short paths mean smoother, more musical movement.”

**Why a first-time visitor is misled:** “More musical” has no stated comparison, definition, or test.

**Concrete fix:** Rewrite as **“Short paths show notes changing by small steps.”**

### Minor — README deployment wording is not plain product documentation

**Quote:** “The static build deploys as an Azure Static Web App; staticwebapp.config.json ships with the output and provides headers and the navigation fallback.”

**Why a first-time visitor is lost:** It mixes factory deployment jargon with user documentation and hides the useful instruction.

**Concrete fix:** Rewrite as **“Deploy dist/ to a static web host that rewrites app routes to index.html.”** Keep platform specifics in maintainer docs.

## Copy audit

Counts treat hyphenated compounds and product/code tokens as one word. This lists visitor-facing propositions in the normal landing state and every README sentence; controls that are only nouns or note names are not sentences.

### Landing page

| Sentence or proposition | Words | Result |
| --- | ---: | --- |
| Ear training for self-taught musicians | 5 | Context label; plain |
| Practice hearing harmony in real songs | 7 | BLOCKING: false, unlisted |
| For self-taught musicians who want to hear how notes move together. | 11 | Plain |
| Hear a short chord pattern, then choose the next note. | 11 | Unlisted claim |
| No account | 2 | Tested no-account |
| Practice audio stays in your browser | 6 | Tested private-audio |
| $24 Studio is optional | 4 | Covered by studio-unlock |
| Listen, choose, sing | 3 | Context label |
| 0 answered · 0% right | 4 | Status |
| Explore—nothing is scored | 3 | Jargon, unlisted |
| Advance when ready | 3 | Plain hint |
| Sandbox · audition choices freely | 4 | Jargon, unlisted |
| Each line is one voice. | 6 | Unlisted claim |
| Short paths mean smoother, more musical movement. | 7 | Unlisted; marketing adjective |
| Which scale degree follows the cadence? | 6 | Theory jargon |
| Choose any answer to hear that sound. | 8 | Unlisted claim |
| Toggle Sandbox off when you want feedback. | 8 | Jargon |
| Studio adds Clarity and Reed textures plus a JSON backup. | 10 | Tested studio-unlock |
| CSV export stays free. | 4 | Tested csv-export |
| No scored answers yet. | 4 | Plain empty state |
| Start in Test mode when you are ready. | 8 | Test mode introduced late |
| Have a license? | 3 | Plain question |
| Paste it here. | 4 | Plain instruction |
| Checkout and refunds are handled by Sociobot/Dodo. | 7 | Plain enough; terms link |
| Hear chord patterns, then name or sing the next note. | 10 | Unlisted claim |

No landing proposition exceeds 22 words. Flags: **real songs** (false), **Sandbox**, **scale degree**, **Test mode**, and subjective **musical**. “Start for real” is the result-ambiguous button.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Ear in Context is a browser practice table for self-taught musicians. | 11 | Plain product description |
| Start the sample practice, hear a short chord pattern, and choose or sing the next note. | 16 | Unlisted feature claim |
| /demo and /?demo=1 open the isolated sample. | 7 | Demo isolation in substance; isolated is technical |
| The demo banner includes Reset demo and Start for real. | 10 | Terminology mismatch |
| Its progress uses the demo:ear-in-context:progress:v1 local-storage key. | 5 | Developer jargon |
| The product includes scale-degree, progression, and sung-note practice. | 8 | Unlisted feature claim; jargon |
| Its executable behavioural claims and the test command for each are in .factory/claims.json. | 13 | Executable behavioural is jargon |
| The demo setup is documented in .factory/demo.md. | 7 | Plain enough for maintainers |
| Requires Node.js 20 or newer. | 5 | Plain prerequisite |
| Start npm run preview -- --host 127.0.0.1 before npm run audit:a11y. | 7 | Plain instruction |
| The production build is dist/, with dist/index.html at its root. | 9 | Plain instruction |
| Read /privacy and /terms for the user-facing policies. | 8 | Plain instruction |
| The static build deploys as an Azure Static Web App; staticwebapp.config.json ships with the output and provides headers and the navigation fallback. | 19 | Jargon; unlisted |
| MIT. | 1 | Plain license label |
| See LICENSE. | 2 | Plain instruction |

No README sentence exceeds 22 words. “Sample” appears as sample practice, isolated sample, and demo setup; use “sample practice” throughout.

## Demo, privacy, and claims verification

**Demo: PASS.** /demo and /?demo=1 open into a seeded sample with “3 answered · 67% right”, a cadence question, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real. Reset reseeded the two sample reviews. The clean-context isolation test preloaded real progress, answered in demo, and confirmed the real key was byte-for-byte unchanged while the demo key changed.

**Declared claims: PASS.** From clean clone /tmp/eic-review-clean.Ol54Ja, every command listed in claims.json passed:

| Claim | Result |
| --- | --- |
| demo-isolation | PASS |
| private-audio | PASS — network interception allowed same-origin requests only during /demo playback |
| no-account | PASS |
| csv-export | PASS — header and two seeded review rows checked |
| studio-unlock | PASS |
| offline-reload | PASS — service-worker-controlled /demo reloaded offline |

Also passed from that clone: npm test (8 tests), npm run build, npm run test:browser (all claims, 404 view, route focus/back, mobile and console), and npm run audit:a11y with its documented preview server (0 serious/critical axe violations; no console errors). The connection-refused audit without the documented preview server is not a product failure.

## Structure and visual verification

- Live /, /demo, /privacy, /terms, and an unknown route had route-specific titles, one h1, descriptions, canonical links, favicon, OG/Twitter metadata, header/footer legal links, and no console errors.
- Crawled all rendered landing links. Internal links, Sociobot checkout, and Param Factory link returned 200.
- Back navigation and route-change focus pass in the supplied browser test.
- The warm-paper pitch-token / teal voice-path illustration and asymmetric practice surface are product-specific, not a generic SaaS template.
- The exception is BLOCKING: the unknown-route visual is designed but the live server reports HTTP success rather than 404.

