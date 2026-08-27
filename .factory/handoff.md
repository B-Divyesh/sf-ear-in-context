# Repair handoff — Ear in Context

## Result

This repair resolves the blockers recorded by independent verifier-2 at
`52522cbf04541e12b9c356e48f5dafd2b3e15daf` while preserving the existing
practice, offline, and Sociobot billing flows.

- The Sing it back keyboard no longer generates inline `style` attributes or
  writes `element.style`. White keys use flex layout, black keys use reviewed
  CSS position classes, and the live marker changes a `data-position` state
  that strict, self-hosted CSS maps to each displayed semitone. The deployed
  CSP remains `style-src 'self'`—no `unsafe-inline`, hashes, or nonces were
  added.
- Start microphone is again dark ink on paper (`#17211d` / `#f4f0e7`,
  14.52:1), rather than being overridden by the generic button-row surface.
- Module tabs now have complete tab/panel relationships, roving `tabindex`,
  and automatic ArrowLeft/ArrowRight navigation (with Home/End support).
- Azure static headers now set preload-eligible HSTS:
  `max-age=63072000; includeSubDomains; preload`.
- `.factory/brief.json` restores a concise self-contained product brief. Its
  source note makes clear that the original research artifact was absent and
  this record was reconstructed from the supplied factory work order and
  implemented product contract.

## Verification

Clean local verification on 2026-08-27 UTC:

```text
npm ci                         PASS — 58 packages, 0 vulnerabilities
npm test                       PASS — 3 files, 8 tests
npm run build                  PASS
npm audit --omit=dev           PASS — 0 vulnerabilities
npm run audit:a11y             PASS — strict CSP injected from Azure config,
                                      zero console errors and zero serious/
                                      critical axe findings on initial and
                                      Sing it back states
verify-url.sh local preview    PASS — title, lang, one h1, main, image alt,
                                      zero browser errors
offline browser exercise       PASS — active service worker controls reload;
                                      offline shell renders the practice h1
billing browser exercise       PASS — production checkout URL and one mocked
                                      license verification request to
                                      api.sociobot.in; valid response unlocks
                                      Studio without initiating a purchase
```

The state-aware browser regression in `scripts/a11y-audit.mjs` now asserts all
of the repaired behavior under the exact strict production CSP: 14 evenly laid
out white keys, 10 correctly placed black keys, no inline piano styles, a
moving pitch marker, and correct ArrowRight then ArrowLeft tab selection and
focus. It runs axe on both the initial route and Sing it back state.

The production build is within budget: JavaScript is 28,090 B (10.72 kB gzip),
CSS is 16,444 B (4.29 kB gzip), and the WebP hero is 38,416 B.

## Run and deploy

```bash
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit:a11y
```

Deploy the generated `dist/` with the factory static deployment workflow.
`dist/staticwebapp.config.json` is the Azure Static Web Apps config filename;
it contains the CSP and HSTS headers tested above.

## Live deployment status

No deployment was performed from this repair checkout: repository policy
assigns deployment to the factory. Therefore the live custom domain must be
re-checked by the deployment worker after it publishes this commit, using:

```bash
AUDIT_URL=https://ear-in-context.sociobot.in/ npm run audit:a11y
```

At handoff time, a live header check still returned the previous
`max-age=10886400; includeSubDomains; preload` HSTS value, so the repair is
not yet deployed. That check is expected to verify the strict CSP state
regression against the newly deployed artifact. Do not treat the prior
verifier-2 deployment (which was byte-identical to `e4e263e`) as evidence for
this repaired commit.
