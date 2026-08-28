# Ear in Context

Ear in Context is a browser practice table for self-taught musicians. Start the
[sample practice](/demo), hear a short chord pattern, and choose or sing the
next note.

## Use it

`/demo` and `/?demo=1` open the isolated sample. The demo banner includes
**Reset demo** and **Start for real**. Its progress uses the
`demo:ear-in-context:progress:v1` local-storage key.

The product includes scale-degree, progression, and sung-note practice. Its
executable behavioural claims and the test command for each are in
[`.factory/claims.json`](.factory/claims.json). The demo setup is documented in
[`.factory/demo.md`](.factory/demo.md).

## Develop and verify

Requires Node.js 20 or newer.

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run test:claims -- --grep @claim:demo-isolation
npm run audit:a11y
```

Start `npm run preview -- --host 127.0.0.1` before `npm run audit:a11y`. The
production build is `dist/`, with `dist/index.html` at its root.

## Privacy, legal, and deployment

Read [/privacy](/privacy) and [/terms](/terms) for the user-facing policies.
The static build deploys as an Azure Static Web App; `staticwebapp.config.json`
ships with the output and provides headers and the navigation fallback.

## License

MIT. See [LICENSE](LICENSE).
