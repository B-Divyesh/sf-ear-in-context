# Ear in Context

Ear in Context is a local-first browser ear trainer for self-taught musicians who want musical context instead of mechanical drills. It teaches scale degrees inside a cadence, identifies compactly voice-led chord progressions, and shows live sung pitch on a piano keyboard.

The learner controls the pace: Sandbox previews sounds without judging or scheduling, Hold level prevents automatic difficulty changes, and Test mode maintains a per-item spaced-review schedule. No account is required and microphone audio never leaves the browser.

## Features

- Cadence-anchored scale-degree identification
- Original, synthesised chord progressions with deliberate voice leading
- Live monophonic YIN-style pitch detection rendered on a two-octave keyboard
- Three explicit difficulty levels, global Sandbox and Hold level controls
- Per-item local spaced repetition and free CSV progress export
- Keyboard controls: Space to listen, 1–6 to answer, S for Sandbox, H for Hold, N for next
- Installable/offline shell, light/dark treatments, reduced-motion support
- Optional $24 one-time Studio unlock for Clarity/Reed textures and JSON backup

## Develop and verify

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

The reproducible production command is `npm run build`. It emits the static site to `dist/`, with `dist/index.html` at the deploy root. The accessibility audit expects the preview at `http://127.0.0.1:4173` unless `AUDIT_URL` is set and requires Playwright's Chromium (`npx playwright install chromium` on a new machine).

## Privacy and billing

Progress and settings use `localStorage`; audio is analysed in memory and is neither recorded nor uploaded. `/privacy` and `/terms` contain the user-facing policies.

Studio uses only the Sociobot hosted checkout and license API. The default development base is `https://pilot-api.sociobot.in`; release deployment should set `VITE_BILLING_BASE=https://api.sociobot.in`. The product slug is the public route slug, not an embedded provider product ID.

## Deployment

Deploy `dist/` as an Azure Static Web App. `public/swa-cli.config.json` supplies SPA fallback, security headers, and asset caching policy. DNS and billing registration are intentionally outside this repository.

## License

MIT. See [LICENSE](LICENSE).
