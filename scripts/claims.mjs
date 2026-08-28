import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4174';
const grepIndex = process.argv.indexOf('--grep');
const filter = grepIndex >= 0 ? process.argv[grepIndex + 1] : '';
const server = spawn('./node_modules/.bin/vite', ['preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });

async function ready() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch { /* server has not started */ }
    await delay(100);
  }
  throw new Error('Vite preview did not start');
}

function assert(condition, message) { if (!condition) throw new Error(message); }

async function fresh(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  return { context, page };
}

const tests = [
  {
    id: 'demo-isolation',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/`);
      const real = JSON.stringify({ answered: 77, correct: 66, reviews: {}, level: { intervals: 1, progressions: 1, sing: 1 } });
      await page.evaluate(value => localStorage.setItem('ear-in-context:progress:v1', value), real);
      await page.goto(`${base}/?demo=1`);
      await page.getByText('Demo — sample data, nothing is saved').waitFor();
      assert(await page.getByText(/3 answered/).count() === 1, 'sample progress was not seeded');
      await page.getByLabel('Sandbox').uncheck();
      await page.locator('[data-choice]').first().click();
      const state = await page.evaluate(() => ({ real: localStorage.getItem('ear-in-context:progress:v1'), demo: localStorage.getItem('demo:ear-in-context:progress:v1') }));
      assert(state.real === real, 'demo changed real progress');
      assert(Boolean(state.demo) && state.demo !== real, 'demo state was not stored in its demo namespace');
      await context.close();
    },
  },
  {
    id: 'private-audio',
    async run(browser) {
      const { context, page } = await fresh(browser);
      const requests = [];
      page.on('request', request => requests.push(request.url()));
      await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
      await page.locator('[data-action="play"]').click();
      await page.waitForTimeout(100);
      assert(requests.every(url => new URL(url).origin === base), `off-origin request during demo: ${requests.join(', ')}`);
      await context.close();
    },
  },
  {
    id: 'no-account',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      assert(await page.getByRole('heading', { name: 'Sample harmony practice' }).count() === 1, 'sample practice required an account step');
      assert(await page.getByText(/sign in|create account/i).count() === 0, 'account controls appeared before practice');
      await context.close();
    },
  },
  {
    id: 'csv-export',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      await page.getByText('Progress, sound & license').click();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export progress as CSV' }).click();
      const stream = await (await download).createReadStream();
      let body = '';
      for await (const chunk of stream) body += chunk;
      const rows = body.trim().split('\n');
      assert(rows[0] === 'exercise,attempts,correct,accuracy,next_review', 'CSV header is wrong');
      assert(rows.length >= 3, 'CSV did not include sample review rows');
      await context.close();
    },
  },
  {
    id: 'studio-unlock',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/`);
      assert(await page.getByText('$24', { exact: true }).count() === 1, 'Studio price is not shown');
      assert(await page.locator('a[href="https://api.sociobot.in/api/v1/products/ear-in-context/checkout"]').count() === 1, 'Studio checkout does not use the production Sociobot URL');
      await page.evaluate(() => localStorage.setItem('sb_license:ear-in-context', 'demo-license'));
      await page.reload();
      await page.getByText('Studio unlocked').waitFor();
      await page.getByText('Progress, sound & license').click();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Back up progress as JSON' }).click();
      assert((await download).suggestedFilename() === 'ear-in-context-backup.json', 'Studio backup did not download');
      await context.close();
    },
  },
  {
    id: 'offline-reload',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 10_000 }).catch(async () => {
        await page.reload();
        await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 10_000 });
      });
      await context.setOffline(true);
      await page.reload();
      await page.getByRole('heading', { name: 'Sample harmony practice' }).waitFor();
      await context.close();
    },
  },
];

async function browserChecks(browser) {
  const { context, page } = await fresh(browser);
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${base}/not-a-real-page`);
  assert(await page.title() === 'Page not found — Ear in Context', 'unknown route did not set a 404 title');
  assert(await page.getByRole('heading', { name: 'That practice page does not exist' }).count() === 1, 'unknown route did not render its 404 page');
  await page.getByRole('link', { name: 'Go to practice' }).click();
  await page.waitForURL(`${base}/`);
  assert(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'route change did not focus the page heading');
  await page.getByRole('link', { name: 'Privacy' }).click();
  assert(await page.title() === 'Privacy — Ear in Context', 'privacy title is not route-specific');
  await page.locator('#live-status').waitFor({ state: 'attached' });
  await page.waitForFunction(() => document.querySelector('#live-status')?.textContent === 'Privacy — Ear in Context');
  await page.goBack();
  assert(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'back navigation did not focus the page heading');
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'mobile page has horizontal overflow');
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  await context.close();
}

try {
  await ready();
  const browser = await chromium.launch();
  const selected = tests.filter(test => !filter || `@claim:${test.id}`.includes(filter));
  assert(selected.length > 0, `No claim test matched ${filter}`);
  for (const test of selected) { await test.run(browser); console.log(`PASS @claim:${test.id}`); }
  if (!filter) { await browserChecks(browser); console.log('PASS browser routes, focus, mobile, and console checks'); }
  await browser.close();
} finally {
  server.kill('SIGTERM');
}
