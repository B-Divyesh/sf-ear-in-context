# Independent verification 3 — Ear in Context

**Verdict: PASS**

Verified 2026-08-27 UTC from clean checkout at candidate commit
`8700a2cab51d4cba0c98ccf9e60ea5211e32ff88` (`fix: repair CSP-safe singing
keyboard`) against https://ear-in-context.sociobot.in/.

The live production HTML and every requested immutable/runtime artifact are
byte-identical to this candidate build:

| Artifact | SHA-256 match |
| --- | --- |
| `index.html` | yes — `3df56660492b018e5709a071829465e524b67d694d94fe16193f85c81e4d8fd2` |
| `assets/index-Bea6Dn27.css` | yes — `ec5fc966e21351eda87ae8cd2c99be8037b0b7a410a2133d01fc85fc3005cc3c` |
| `assets/index-CxdrM7ZI.js` | yes — `593856793c7ba2388a8c3ce970b054a7cacff18beebcdec331c9ac52affe692d` |
| `assets/voice-paths.webp` | yes — `693212da8df84ba7c7ee6a79bf7e842dff2caabd02a2ae8f52a6cbc0d4d285db` |
| `sw.js` | yes — `099e676521ebb9991b11df1727502699b444a8f7f87c8733f97a8fd4ddf0257b` |
| `manifest.webmanifest` | yes — `3211299faaab618384e6fdf16311368a34c4e3222eb5a8f30d3f7b04f1cc8a2f` |

## Reproducible checks

```text
npm ci                         PASS — 58 packages installed; 0 vulnerabilities
npm test                       PASS — 3 files, 8 tests
npm run build                  PASS — tsc --noEmit and Vite production build
npm run audit:a11y             PASS — strict production CSP emulated; 0 serious/
                                      critical axe findings; 0 console/page errors
AUDIT_URL=https://ear-in-context.sociobot.in/ npm run audit:a11y
                               PASS — 0 serious/critical axe findings; 0 errors
npm audit --omit=dev           PASS — 0 vulnerabilities
```

`audit:a11y` requires the documented preview server to be running; invoking it
without `npm run preview -- --host 127.0.0.1` correctly fails with connection
refused and is not a product failure. Its state-specific checks passed with
the server running: 14 evenly placed white keys, 10 black keys, moving pitch
marker, no inline piano styles under `style-src 'self'`, and working roving
module tabs.

## End-to-end exercise

Playwright checks used both desktop (1440px) and mobile (390×844) contexts.

- Normal Test-mode interval flow: keyboard `1` answered, feedback named the
  cadence-context scale degree, and `N` advanced to a new sound with focus on
  Play context.
- Sandbox flow: keyboard `S`, then `1`, auditioned the choice and announced
  “Sandbox does not score answers”; persisted answer total did not increase.
- Hold-level toggle persisted its explicit “Difficulty stays here” state.
- Arrow-key module navigation selected and focused Sing it back. The focused
  tab had a visible 3px solid focus outline.
- Sing it back rendered the two-octave keyboard and microphone denial was
  handled. A simulated `NotAllowedError` produced: “Microphone access was
  blocked. Allow it in your browser settings, then try again.” Switching back
  to Scale degrees recovered normally.
- Malformed progress localStorage (`{invalid json`) safely reset to the empty
  0-answered state; no page error occurred.
- A malformed license token was URL-encoded for the allowed Sociobot endpoint;
  a mocked invalid response persisted an invalid verdict and rendered the
  recovery copy “That license is not active. Check the token or buy Studio.”
  The checkout is exactly
  `https://api.sociobot.in/api/v1/products/ear-in-context/checkout`.
- At 390px the 620px singing keyboard is deliberately horizontally scrollable.
  Under reduced motion its marker transition computed to `0.00001s`; axe had
  zero serious/critical findings and there were no browser errors.
- PWA: service worker registered, became active and controlled a subsequent
  page; `registration.update()` completed with no waiting worker for unchanged
  bytes; an offline reload rendered the practice `<h1>` successfully.

## Accessibility, privacy, security, and performance

- Desktop and mobile axe scans: zero serious or critical findings. The
  delivered audit also covers the initial route and Sing it back state.
- One title, `lang`, one h1, main landmark, alt text, tabs/panels, keyboard
  operation, visible focus, and reduced-motion behavior were verified.
- Fresh normal practice emitted no external requests. Source inspection and
  CSP show no analytics, third-party fonts, or third-party scripts. Progress,
  theme, and license are localStorage-only; audio uses browser microphone data
  in memory. The only allowed cross-origin app request is license verification
  to `https://api.sociobot.in`, and only after a license is supplied.
- Live headers: strict CSP (`default-src 'self'`; only the Sociobot API in
  `connect-src`), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: microphone=(self)`, and preload-eligible HSTS
  (`max-age=63072000; includeSubDomains; preload`).
- Live caching: content HTML is short revalidated (`max-age=30`), hashed CSS
  and JS are `max-age=31536000, immutable`, and `sw.js` is `no-cache`.
- Production sizes: JS 28,086 B / 10.72 kB gzip (under 200 kB budget); CSS
  16,444 B / 4.29 kB gzip (under 50 kB); WebP hero 38,416 B; no webfont
  payload. Source map is not an initial request.

## Defects by severity

No release-blocking, high, medium, or low product defects found.

## Environmental note

A separate `npx lighthouse` attempt could not yield a score because the
container's launched Chrome tab crashed. This does not alter the result above:
the product was exercised with the repository's installed Playwright Chromium,
including axe, console/page-error, PWA, reduced-motion, and bundle checks.
