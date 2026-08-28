# Ear in Context — adversarial review round 5 handoff

## Outcome

Reviewed candidate `4a2010573bbb597692ced7c0b432d890fba7c5c7` against the live
deployment at <https://ear-in-context.sociobot.in> in fresh 390 × 844 and
1440 × 900 Chromium contexts.

Verdict: **FAIL** with one major and two minor findings. There are no blocking
findings. The first read, one-click isolated demo, registered claims, routing,
offline behavior, accessibility baseline, and distinct visual identity pass.
The remaining work is documented in `.factory/review-5.md`:

- `F-5-1`: the paid downloadable progress backup has no restore path.
- `F-5-2`: the 390 px header hides Privacy.
- `F-5-3`: off-origin links do not identify themselves as external.

No product code was modified.

## How verification was run

```bash
npm ci
npm test
npm run build
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y
VERIFY_NODE_MODULES=/work/repo/node_modules \
  bash /opt/fleet/lib/verify-url.sh https://ear-in-context.sociobot.in <evidence-dir>
```

Every exact command in `.factory/claims.json` was also run independently from
clean clone `/tmp/ear-in-context-review5.YGUQmh`, with a separate fresh browser
context per command.

## Verification results

- `npm test`: 3 files and 8 tests passed.
- `npm run build`: passed; emitted `dist/index.html`, 34.43 kB JS and 21.61 kB
  CSS before gzip.
- Registered claims: 21/21 passed independently from the clean clone.
- Live aggregate: 21/21 claims plus HTTP routing, metadata, focus/Back, phone
  layout, crawl, and console checks passed.
- Live accessibility audit: zero serious/critical Axe violations and zero
  console errors across light/dark, demo, legal, singing, and 404 states.
- URL verifier: title, `lang`, one h1, main, image alt text, labeled buttons,
  and console checks passed.
- Live and local JS/CSS SHA-256 hashes match.

## Next steps

Implement the three findings without weakening the passing demo or claim
coverage. Add a backup round-trip claim, a 390 px visible-Privacy assertion,
and an off-origin accessible-name assertion. Then rerun the full round-five
checklist from a clean clone and against the deployed URL.
