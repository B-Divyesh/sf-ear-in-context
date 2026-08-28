# Copy audit — polish round 3

Counts treat hyphenated terms and product names as one word. No sentence is
over 22 words. No banned plain-words term remains in visitor copy.

## Landing page

| Copy | Words | Claim or result |
| --- | ---: | --- |
| Practice hearing harmony in chord patterns | 6 | `chord-pattern-practice` |
| For self-taught musicians who want to hear how notes move together. | 11 | Audience is named. |
| Hear a short chord pattern, then choose the next note. | 10 | `cadence-choice-flow` |
| No account | 2 | `no-account` |
| Practice audio stays in your browser | 6 | `private-audio` |
| Core practice and CSV export stay free | 7 | `core-free` |
| Nothing is scored | 3 | `explore-unscored` |
| Level changes are paused | 4 | Direct control state. |
| Level can change with your score | 6 | `keep-level` |
| Higher levels add note roles, chord patterns, or singing targets. | 10 | `level-sets` |
| Each line shows one voice. | 5 | `voice-path-diagram` |
| Short paths show notes changing by small steps. | 8 | `voice-path-diagram` |
| Choose any answer to preview its sound. | 7 | `explore-choice-preview` |
| Turn off Explore mode to score your answer. | 8 | `cadence-choice-flow` |
| Play a chord pattern. | 4 | `chord-pattern-practice` |
| Hear where the home chord settles. | 6 | Practice instruction. |
| Name the next note. | 4 | `choose-or-sing` |
| Use Note roles or compare Progressions. | 6 | `chord-pattern-practice` |
| Sing it back. | 3 | `choose-or-sing` |
| See one sung pitch on the two-octave keyboard. | 9 | `sung-pitch-feedback` |
| Generated patterns, not song recordings | 5 | `chord-pattern-practice` |
| The practice makes short chord patterns in your browser. | 9 | `chord-pattern-practice` |
| It does not load songs or record your voice. | 9 | `private-audio` |
| Microphone sound is analysed live and is not retained. | 9 | `private-audio` |
| Studio adds Clarity and Reed textures plus a JSON backup. | 10 | `studio-unlock` |
| Core practice and CSV export stay free. | 7 | `core-free` |
| Practice history and settings are stored in your browser’s local storage. | 10 | `local-data-control` |
| Use Erase local progress to remove training history. | 8 | `local-data-control` |
| Hear chord patterns, then name or sing the next note. | 10 | `choose-or-sing` |
| Play chord pattern | 3 | Result-naming action. |
| Replay chord pattern | 3 | Result-naming action. |
| Open next question | 3 | Result-naming action. |
| Back up JSON | 3 | Result-naming action. |

## Sample practice

| Copy | Words | Claim or result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | `demo-isolation` |
| Open your practice | 3 | Result-naming action. |
| Sample progress is discarded; saved progress is unchanged. | 8 | `demo-isolation` |
| Sample practice | 2 | One consistent page name. |

## README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Ear in Context is a browser ear trainer for self-taught musicians. | 11 | Plain audience statement. |
| It uses generated chord patterns instead of song recordings. | 8 | `chord-pattern-practice` |
| Play a short chord pattern, choose the next note, or sing it back. | 12 | `cadence-choice-flow`, `choose-or-sing` |
| `/demo` and `/?demo=1` open the same sample practice. | 8 | `demo-isolation` |
| The banner offers Reset demo and Open your practice. | 9 | `demo-isolation` |
| Sample progress is separate from normal progress. | 7 | `demo-isolation` |
| Leaving the demo discards the sample and keeps normal progress unchanged. | 11 | `demo-isolation` |
| Explore mode previews choices without scoring them. | 7 | `explore-unscored`, `explore-choice-preview` |
| The tested product promises and their commands are in `.factory/claims.json`. | 10 | Plain maintainer note. |
| Sample contents and storage are documented in `.factory/demo.md`. | 8 | Plain maintainer note. |
| Use Node.js 20 or newer. | 6 | Plain prerequisite. |
| Start the preview server before the accessibility audit. | 8 | Plain verification instruction. |
| Run each claim command to verify one product promise at a time. | 11 | Plain verification instruction. |
| The production build is `dist/`, with `dist/index.html` at its root. | 10 | Build result. |
| Deploy `dist/` to a static host that applies `staticwebapp.config.json`. | 9 | Deployment instruction. |
| Core practice needs no account. | 5 | `no-account` |
| Practice audio stays in the browser. | 6 | `private-audio` |
| Core practice and CSV export stay free. | 7 | `core-free` |
| Studio is an optional $24 one-time purchase. | 7 | `studio-unlock` |
| It adds two sound textures and a JSON backup. | 9 | `studio-unlock` |
| Read Privacy and Terms for the user-facing policies. | 8 | Plain navigation instruction. |

## Terminology

| Concept | One product term |
| --- | --- |
| learning activity | practice |
| isolated try-out | sample practice |
| note function in a key | note role, followed once by “scale degree” |
| non-scoring sound preview | Explore mode |
| scored answer state | Scoring mode |
| repeated chord audio | chord pattern |
| difficulty choices | Starter set, Larger set, Full set |
