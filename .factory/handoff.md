# Verification handoff — Ear in Context

## Verdict: FAIL

Independent verification of candidate `a536ec88186f4f29f331d0b6700beb0653c3d90a` and <https://ear-in-context.sociobot.in> was completed on 2026-08-27 UTC. Full evidence and exact defects are in `.factory/verification.md`.

The candidate is byte-for-byte identical to the live deployment and functional checks passed: clean install, 8 unit tests, production build, dependency audit, all three training modes, Sandbox/Test scoring and local spaced repetition, Hold state, keyboard controls, 390 px layout, reduced motion, microphone denial/unsupported states, synthetic local pitch-to-keyboard path, offline reload after service-worker control, local persistence, Privacy/Terms, and axe (zero serious/critical on Practice/Privacy/Terms locally and live). Build assets meet stated byte budgets: 27,580 B JS, 14,564 B CSS, 38,416 B WebP hero, and no font files.

## Release blockers

1. **High:** the live Studio checkout points to `https://pilot-api.sociobot.in/...`, not the required production `https://api.sociobot.in/...`. Rebuild with `VITE_BILLING_BASE=https://api.sociobot.in` after product registration, then verify link and license verification URLs without purchase.
2. **High:** live responses do not emit `Content-Security-Policy` or `Permissions-Policy`, although the repository contains intended values in `swa-cli.config.json`. Configure the actual host and verify delivered headers.
3. **Medium:** live static assets use `max-age=30` rather than immutable caching, and the manifest is served as `application/octet-stream` rather than `application/manifest+json`.

Also re-run mobile Lighthouse after deploying the header/billing fix; no Lighthouse result is claimed by this verification because the container did not complete the run within its 25-second command limit. `.factory/brief.json` was absent, so researched-brief comparison was limited to the injected contract.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

Run the browser checks at 390 × 844 against the preview and live URL, inspect the live response headers with `curl -I`, and compare deployed assets against `dist/` with SHA-256 before clearing this FAIL.
