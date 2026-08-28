# Ear in Context

Ear in Context is a browser ear trainer for self-taught musicians. It uses
generated chord patterns instead of song recordings.

[Try the sample practice](https://ear-in-context.sociobot.in/demo). Play a
short chord pattern, choose the next note, or sing it back.

## Use the sample practice

`/demo` and `/?demo=1` open the same sample practice. The banner offers
**Reset demo** and **Open your practice**.

Sample progress is separate from normal progress. Leaving the demo discards
the sample and keeps normal progress unchanged. Explore mode previews choices
without scoring them.

The tested product promises and their commands are in
[`.factory/claims.json`](.factory/claims.json). Sample contents and storage are
documented in [`.factory/demo.md`](.factory/demo.md).

## Develop and verify

Use Node.js 20 or newer.

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run audit:a11y
LIVE_URL=https://ear-in-context.sociobot.in npm run test:live
```

Start `npm run preview -- --host 127.0.0.1` before `npm run audit:a11y`. Run
each command in `.factory/claims.json` to verify one product promise at a time.

The production build is `dist/`, with `dist/index.html` at its root. Deploy
`dist/` to a static host that applies `staticwebapp.config.json`.

## Privacy and legal pages

Core practice needs no account. Practice audio stays in the browser. Core
practice and CSV export stay free.

Studio is an optional $24 one-time purchase. It adds two sound textures and a
JSON backup. Read [/privacy](https://ear-in-context.sociobot.in/privacy) and
[/terms](https://ear-in-context.sociobot.in/terms) for the user-facing policies.

## License

MIT. See [LICENSE](LICENSE).
