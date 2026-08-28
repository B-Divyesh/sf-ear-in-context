# Ear in Context — visual thesis

## Direction: generative voice-path geometry

Ear training is normally drawn as notation or rendered as game chrome. This product instead visualises the thing the ear is learning: several independent voices moving short distances through harmonic space. Circles are pitches, vertical stacks are chords, and thin paths show common tones and stepwise motion. The geometry is deliberately slightly human—offset, cropped, and printed on warm paper—so the app feels like a musician's practice table rather than a test dashboard.

The single visual idea also explains state. Open rings are notes to hear, filled coral discs are the current/voiced pitch, blue paths are stable connections, and a double outline indicates a held level. There are no generic gradients, dashboard card grids, waveform tropes, or ornamental music notes.

## Palette

- `paper #F4F0E7`: warm practice-page background.
- `paper-deep #E8E0D1`: separated control surfaces.
- `ink #17211D`: primary text and structural lines (13.3:1 on paper).
- `ink-soft #59625D`: secondary text (5.7:1 on paper).
- `signal #C53F32`: sung/current pitch, errors, and the main action; use dark ink or white according to context.
- `signal-dark #8F2B23`: accessible coral text and hover state.
- `signal-contrast #FFFFFF` in light mode and `#101714` in dark mode: action text chosen for 4.5:1 contrast.
- `tuning #1E6F78`: stable voice-leading paths and success feedback.
- `tuning-dark #15545C`: link/action text on paper.
- `sun #D59B2D`: caution, cadence arrival, and due-review accents.
- `night #101714`, `night-surface #1B2521`, `night-text #F5F0E6`, `night-muted #BBC4BE`: an explicit dark treatment, selected from the settings menu or the user's OS preference.

Color is never the sole signal: every result also has an icon/word, every pitch marker includes a note label, and active controls expose pressed state.

## Typography

- Display and musical labels: **Georgia**, a local system serif, chosen for its editorial, lesson-book authority and excellent numeral shapes.
- Interface and prose: **Arial / system sans**, chosen for direct, compact controls and zero font payload.
- Scale: 12px micro label, 14px utility, 16px body, 20px section, clamp(32px, 6vw, 64px) title. Body line height is 1.55 and prose is capped near 68 characters.

No font is fetched at runtime. The contrast between a humane serif and unadorned system sans separates listening material from app controls.

## Spacing and layout

An 8px rhythm with 4px optical adjustments: 4, 8, 12, 16, 24, 32, 48, 64. Corners are restrained (4–16px) and structural borders are 1.5px ink lines. Desktop uses an asymmetric two-column practice table; at 390px the context/controls stack above one edge-to-edge work surface, optional explanatory copy is shortened, and the keyboard remains horizontally scrollable with the detected octave centred.

Every target is at least 44px. Focus is a 3px sun outline with 3px offset. The one primary action in each state is filled; secondary actions stay paper/outlined.

## Interaction grammar

- **Listen** draws the voice paths in order while sounding each harmonic event.
- **Answer** fills one of the existing geometric choices; feedback appears in the same place, not in a detached toast.
- **Explore mode** turns the scoring boundary into a dotted line: choices still play, while scheduling and scoring stop.
- **Hold level** adds a double outline around the level control and freezes automatic difficulty changes without stopping spaced repetition.
- Keyboard shortcuts mirror visible controls: Space plays/replays, 1–6 chooses an answer, E toggles Explore mode, H keeps the level, and N advances after feedback.

## Motion policy

Pitch discs enter from their previous voice position over 220ms using transform and opacity only. The live sung marker follows pitch over 120ms with a small confidence fade; it never pulses or loops. Correct/incorrect feedback uses a single 180ms settle. Under `prefers-reduced-motion: reduce`, all spatial movement is removed and state changes are instant opacity changes. Audio never autoplays.

## Original asset plan and provenance

The hero illustration is a generated abstract still-life of paper-cut pitch circles and copper wire voice paths. It establishes the physical geometry of the interface without claiming functionality. UI diagrams, piano keys, icons, and live voice paths are hand-authored HTML/CSS/SVG and are original to this repository.

### Prompt sheet

Subject: an abstract tabletop harmonic machine, four sequences of circular pitch tokens connected by gently bending wire paths, clear voice-leading from chord to chord. World: quiet musician's workbench, tactile paper construction, modernist generative geometry. Materials: warm uncoated paper, charcoal ink, muted coral card, oxidised teal wire, tiny ochre registration marks. Light: soft side daylight, crisp but subtle paper shadows. Lens/composition: overhead 50mm, asymmetric crop, generous empty paper area, no horizon. Palette words: warm bone, near-black ink, signal coral, tuning teal, restrained ochre. Negative list: no people, no hands, no instruments, no piano keyboard, no text, no letters, no logos, no watermark, no gradients, no neon, no glossy 3D, no music notation, no brand symbols.

Asset generated 2026-08-27 with the factory Azure OpenAI image deployment via `/opt/fleet/lib/gen-image.sh`. The generated image is original to this product, stored with its prompt sidecar under `assets/src/`, and disclosed in the footer. Production derivatives are a locally optimised 40 KB WebP and 76 KB JPEG fallback; no remote asset calls are used.

The 1200 × 630 social image and 180 px touch image are local crops of this same
reviewed original asset, created 2026-08-28; they introduce no third-party
material.
