# Ear in Context — adversarial review round 4 handoff

## Outcome

Review round 4 is recorded in `.factory/review-4.md` with a **FAIL** verdict:
2 major and 3 minor findings, with no blocking finding. Product code was not
modified.

The live cold first read, one-click demo, storage isolation, offline behavior,
route structure, prior repairs, and all 19 registered claims pass. The open
work is copy and claim completeness: unlisted legal/billing/privacy promises,
future “stay free” wording that exceeds its present-state test, unexplained
JSON terminology, the visible Theme control, and mixed practice/practise
spelling.

## Verification performed

- Fresh live Chromium contexts at 390 × 844 and 1440 × 900.
- Separate clean clone at `/tmp/eic-review4-clean.is61FY`; every exact command
  in `.factory/claims.json` ran individually and passed (19/19).
- `npm test`, `npm run build`, `npm audit --omit=dev`.
- `LIVE_URL=https://ear-in-context.sociobot.in npm run test:live`.
- Local and live `npm run audit:a11y`: zero serious/critical Axe findings and
  zero console errors.
- Factory `verify-url.sh`, route/link crawl, HTTP headers, deep-link/404,
  metadata, focus/Back, mobile first-viewport, demo namespace/reset/exit,
  microphone privacy, and offline reload checks.
- Live/local production JS and CSS hashes match.

## Files changed

- `.factory/review-4.md` — complete review, copy audit, claims results,
  historical finding matrix, structure checks, and verdict.
- `.factory/handoff.md` — this review handoff.

## Next steps

Resolve F-4-1 through F-4-5 without weakening the working demo or existing
claim coverage, then rerun the entire review checklist. The most direct path is
to narrow untestable copy, add tests only for retained observable promises, and
normalize the remaining labels and spelling.
