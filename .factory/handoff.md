# Ear in Context — adversarial review 3 handoff

## Outcome

Review 3 is complete with a **FAIL** verdict. No product code was changed.
The full evidence, finding text, copy audit, claim results, prior-finding
recheck, and concrete repairs are in `.factory/review-3.md`.

Current findings:

- `F-3-1` BLOCKING: the actual demo exercise begins below the first 390 × 844
  viewport after the one-click entry.
- `F-3-2` MAJOR: sung-pitch display copy has no claim test that supplies and
  observes a known pitch.
- `F-3-3` MAJOR: the microphone “not retained” promise is not covered by the
  existing network-only privacy assertion.
- `F-3-4` MINOR: Play/Replay context, Next sound, Backup JSON, and the
  Ground/Colour/Tension levels are not fully plain or result-naming.

## Verification performed

Fresh clone: `/tmp/eic-review3-clean.k10Bti` at
`9baaf73e4db321da30de91025b42ace96e62e1de`.

```text
npm ci                                      PASS
npm test                                    PASS — 8 tests
npm run build                               PASS
every command in .factory/claims.json       PASS — 16/16 individually
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
                                            PASS
AUDIT_URL=https://ear-in-context.sociobot.in npm run audit:a11y
                                            PASS — 0 serious/critical
/opt/fleet/lib/verify-url.sh ...             PASS
```

Fresh 390 × 844 and 1440 × 900 browser contexts were used. Live/local HTML,
JS, and CSS hashes match. Known routes, a true unknown-route 404, route focus,
Back, metadata, all rendered links, mobile touch targets, offline reload,
demo isolation/reset/leave, same-origin network behavior, reduced motion,
and the distinctive visual treatment were checked.

## Next step

Repair the four findings without weakening the demo namespace or privacy
boundary. Add the two missing observable assertions, then perform another
full adversarial review rather than a diff-only check.
