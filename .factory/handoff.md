# Handoff — Ear in Context v1

## Shipped

- A complete Vite + vanilla TypeScript static product with three modules sharing one exercise/audio/scheduling engine:
  - scale-degree identification after a IV–V–I cadence;
  - six original chord paths with compact voice leading and an animated voice map;
  - five sing-back targets with local YIN-style microphone pitch detection and a live two-octave piano marker.
- A global Sandbox mode that auditions choices without feedback or scheduling, Test mode with per-item local spaced repetition, manual difficulty selection, and Hold level.
- Local progress, session accuracy, free CSV export, reset confirmation, keyboard shortcuts, explicit empty/error/offline states, and a cache-first-capable PWA shell.
- A $24 one-time Studio tier using the required Sociobot hosted checkout/license flow. It unlocks two synthesis textures and JSON backup; free practice, CSV export, privacy, and accessibility remain ungated. The default API is Pilot and can be replaced at build time with `VITE_BILLING_BASE`.
- Responsive light/dark generative-geometry UI, including an original factory-generated hero image, documented in `.factory/design.md`.
- Plain-language `/privacy` and `/terms` routes, security headers, local-only mic processing, no analytics, no third-party runtime scripts or fonts.

## Verification

Run from a clean checkout:

```bash
npm install
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

Verified on 27 August 2026:

- `npm test`: 3 files, 8 tests passed.
- `npm run build`: passed; output at `dist/index.html`.
- Initial assets: 27.4 KB JS (10.5 KB gzip), 14.4 KB CSS (4.0 KB gzip), 40 KB WebP hero.
- `/opt/fleet/lib/verify-url.sh`: title, `lang`, one `h1`, main landmark, image alt, and console checks passed at desktop and 390×844.
- Playwright functional smoke: sandbox-to-test scoring, next exercise, all module switches, sing keyboard, Hold shortcut, privacy route, and 390 px no-overflow passed with zero console errors.
- Axe Playwright scan at 390×844: zero serious or critical violations.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 0 ms, FCP 0.9 s.
- `npm audit --omit=dev`: zero vulnerabilities.

## Known gaps and release steps

- Browser pitch tracking is deliberately monophonic and works best with headphones in a quiet room. It covers roughly 70–1000 Hz and may show octave ambiguity for breathy or overtone-heavy voices; no voice audio is retained.
- Microphone permission requires HTTPS (or localhost). Denial and unsupported-browser states are handled inline, but physical-device microphone behaviour should receive a final iOS Safari/Android Chrome pass.
- The factory must register the paid product and set `VITE_BILLING_BASE=https://api.sociobot.in` for production. Until then, checkout defaults to the Pilot API as required by the staging contract.
- Azure Static Web Apps should use `public/swa-cli.config.json` for SPA fallback and response headers.
