import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const liveBase = process.env.LIVE_URL?.replace(/\/$/, '');
const base = liveBase ?? 'http://127.0.0.1:4174';
const grepIndex = process.argv.indexOf('--grep');
const filter = grepIndex >= 0 ? process.argv[grepIndex + 1] : '';
const useAzureEmulator = !filter && !liveBase;
const server = liveBase
  ? null
  : useAzureEmulator
  ? spawn('swa', ['start', 'dist', '--host', '127.0.0.1', '--port', '4174'], { stdio: ['ignore', 'pipe', 'pipe'] })
  : spawn('./node_modules/.bin/vite', ['preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });

await mkdir('test-results/claims', { recursive: true });

async function ready() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch { /* server has not started */ }
    await delay(100);
  }
  throw new Error('Static preview did not start');
}

function assert(condition, message) { if (!condition) throw new Error(message); }

async function fresh(browser, microphone = false) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: microphone ? ['microphone'] : [],
  });
  const page = await context.newPage();
  return { context, page };
}

async function instrumentAudio(page) {
  await page.addInitScript(() => {
    window.__testOscillatorCount = 0;
    const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
    if (!NativeAudioContext) return;
    const original = NativeAudioContext.prototype.createOscillator;
    NativeAudioContext.prototype.createOscillator = function createOscillator() {
      window.__testOscillatorCount += 1;
      return original.call(this);
    };
  });
}

async function shot(page, id) {
  await page.screenshot({ path: `test-results/claims/${id}.png`, fullPage: false });
}

async function storageState(page) {
  return page.evaluate(() => ({
    real: localStorage.getItem('ear-in-context:progress:v1'),
    demo: localStorage.getItem('demo:ear-in-context:progress:v1'),
  }));
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
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      assert((await storageState(page)).real === real, 'demo answer changed real progress');
      await page.getByRole('button', { name: 'Reset demo' }).click();
      assert(await page.getByText(/3 answered/).count() === 1, 'Reset demo did not restore sample progress');
      await page.getByRole('button', { name: 'Leave demo and open your practice' }).click();
      const state = await storageState(page);
      assert(state.real === real, 'leaving demo changed real progress');
      assert(state.demo === null, 'leaving demo did not discard demo progress');
      assert(await page.getByText(/77 answered/).count() === 1, 'leaving demo did not restore normal progress');
      await shot(page, 'demo-isolation');
      await context.close();
    },
  },
  {
    id: 'chord-pattern-practice',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await instrumentAudio(page);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: /Play context/ }).click();
      await page.waitForFunction(() => window.__testOscillatorCount >= 3);
      assert(await page.getByRole('tab', { name: /Note roles/ }).count() === 1, 'note-role practice is missing');
      await page.getByRole('tab', { name: /Progressions/ }).click();
      assert(await page.getByRole('heading', { name: 'Which chord pattern did you hear?' }).count() === 1, 'progression practice is missing');
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      assert(await page.locator('.keyboard').count() === 1, 'singing practice is missing');
      await shot(page, 'chord-pattern-practice');
      await context.close();
    },
  },
  {
    id: 'cadence-choice-flow',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: /Play context/ }).click();
      await page.getByRole('button', { name: /Play context|Replay context/ }).waitFor({ state: 'visible', timeout: 5_000 });
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      const scored = JSON.parse((await storageState(page)).demo);
      assert(scored.answered === 4, `answer did not update the score: ${scored.answered}`);
      assert(await page.locator('.feedback').count() === 1, 'answer did not produce feedback');
      await shot(page, 'cadence-choice-flow');
      await context.close();
    },
  },
  {
    id: 'explore-unscored',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      const before = JSON.parse((await storageState(page)).demo);
      await page.locator('[data-choice]').first().click();
      const after = JSON.parse((await storageState(page)).demo);
      assert(after.answered === before.answered && after.correct === before.correct, 'Explore mode changed the score');
      assert(JSON.stringify(after.reviews) === JSON.stringify(before.reviews), 'Explore mode changed the review schedule');
      assert(await page.locator('.feedback').count() === 0, 'Explore mode judged the previewed answer');
      await shot(page, 'explore-unscored');
      await context.close();
    },
  },
  {
    id: 'explore-choice-preview',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await instrumentAudio(page);
      await page.goto(`${base}/demo`);
      const before = await page.evaluate(() => window.__testOscillatorCount);
      await page.locator('[data-choice]').first().click();
      await page.waitForFunction(value => window.__testOscillatorCount > value, before);
      assert(await page.locator('[data-choice]:not([disabled])').count() > 0, 'preview disabled the choices');
      await shot(page, 'explore-choice-preview');
      await context.close();
    },
  },
  {
    id: 'choose-or-sing',
    async run(browser) {
      const { context, page } = await fresh(browser, true);
      await page.goto(`${base}/demo`);
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      assert(await page.locator('.feedback').count() === 1, 'note choice did not complete');
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      assert(await page.getByText(/^Target:/).count() === 1, 'singing target is missing');
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('button', { name: 'Stop microphone' }).waitFor({ timeout: 5_000 });
      await shot(page, 'choose-or-sing');
      await context.close();
    },
  },
  {
    id: 'voice-path-diagram',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      assert(await page.getByText('Each line shows one voice. Short paths show notes changing by small steps.').count() === 1, 'voice-path explanation is missing');
      const counts = await page.locator('.voice-map').evaluate(svg => ({
        paths: svg.querySelectorAll('polyline').length,
        voices: Math.max(...Array.from(svg.querySelectorAll('.voice-column')).map(column => column.querySelectorAll('circle').length)),
      }));
      assert(counts.paths === counts.voices && counts.paths > 0, 'diagram lines do not map one-to-one to voices');
      await shot(page, 'voice-path-diagram');
      await context.close();
    },
  },
  {
    id: 'private-audio',
    async run(browser) {
      const { context, page } = await fresh(browser, true);
      const requests = [];
      page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
      await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /Play context/ }).click();
      await page.locator('[data-choice]').first().click();
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      await page.evaluate(() => {
        window.__testRealGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Blocked for test', 'NotAllowedError'));
      });
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('alert').getByText(/Microphone access was blocked/).waitFor();
      await page.evaluate(() => { navigator.mediaDevices.getUserMedia = window.__testRealGetUserMedia; });
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('button', { name: 'Stop microphone' }).waitFor({ timeout: 5_000 });
      await page.getByRole('button', { name: 'Stop microphone' }).click();
      assert(requests.every(request => new URL(request.url).origin === base), `off-origin request during demo: ${JSON.stringify(requests)}`);
      assert(requests.every(request => request.method === 'GET'), `upload-like request during demo: ${JSON.stringify(requests)}`);
      assert(await page.locator('script[src^="http"], iframe').count() === 0, 'remote script or frame is present');
      await shot(page, 'private-audio');
      await context.close();
    },
  },
  {
    id: 'keyboard-controls',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await instrumentAudio(page);
      await page.goto(`${base}/demo`);
      await page.keyboard.press('Space');
      await page.waitForFunction(() => window.__testOscillatorCount >= 3);
      await page.keyboard.press('e');
      assert(!(await page.getByLabel(/Explore mode/).isChecked()), 'E did not enable scoring');
      await page.keyboard.press('h');
      assert(await page.getByLabel(/Keep current level/).isChecked(), 'H did not keep the current level');
      await page.keyboard.press('1');
      assert(await page.locator('.feedback').count() === 1, 'number key did not answer');
      await page.keyboard.press('n');
      assert(await page.locator('.feedback').count() === 0, 'N did not open the next question');
      await shot(page, 'keyboard-controls');
      await context.close();
    },
  },
  {
    id: 'keep-level',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.addInitScript(() => { Math.random = () => 0; });
      await page.goto(`${base}/`);
      const seed = async holdLevel => page.evaluate(hold => {
        const review = { attempts: 7, correct: 7, ease: 2.3, intervalDays: 0, dueAt: 0 };
        localStorage.setItem('demo:ear-in-context:progress:v1', JSON.stringify({
          reviews: { 'degree-1': review }, level: { intervals: 1, progressions: 1, sing: 1 },
          holdLevel: hold, sandbox: false, sessions: 1, answered: 7, correct: 7,
          lastVisit: new Date().toISOString().slice(0, 10), texture: 'warm',
        }));
      }, holdLevel);
      await seed(false);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: /1 · home note/ }).click();
      let state = JSON.parse((await storageState(page)).demo);
      assert(state.level.intervals === 2, 'eligible score did not advance the level');
      await seed(true);
      await page.reload();
      await page.getByRole('button', { name: /1 · home note/ }).click();
      state = JSON.parse((await storageState(page)).demo);
      assert(state.level.intervals === 1, 'Keep current level did not prevent advancement');
      await shot(page, 'keep-level');
      await context.close();
    },
  },
  {
    id: 'no-account',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      assert(await page.getByRole('heading', { name: 'Sample practice' }).count() === 1, 'sample practice required an account step');
      assert(await page.getByText(/sign in|create account/i).count() === 0, 'account controls appeared before practice');
      await shot(page, 'no-account');
      await context.close();
    },
  },
  {
    id: 'core-free',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/`);
      assert(await page.getByRole('tab').count() === 3, 'a core practice mode is gated');
      await page.getByText('Progress, sound & license').click();
      assert(await page.getByRole('button', { name: 'Export progress as CSV' }).isEnabled(), 'CSV export is gated');
      assert(await page.getByRole('button', { name: 'Back up progress as JSON' }).count() === 0, 'paid JSON backup appeared without Studio');
      await shot(page, 'core-free');
      await context.close();
    },
  },
  {
    id: 'local-data-control',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: 'Leave demo and open your practice' }).click();
      await page.getByRole('button', { name: 'Switch color theme' }).click();
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      let stored = await page.evaluate(() => ({ progress: localStorage.getItem('ear-in-context:progress:v1'), theme: localStorage.getItem('ear-in-context:theme') }));
      assert(JSON.parse(stored.progress).answered === 1 && stored.theme === 'dark', 'progress or setting was not stored locally');
      await page.reload();
      assert(await page.locator('.score').getByText('1', { exact: true }).count() === 1, 'local progress did not survive reload');
      await page.getByText('Progress, sound & license').click();
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Erase local progress' }).click();
      stored = await page.evaluate(() => ({ progress: localStorage.getItem('ear-in-context:progress:v1'), theme: localStorage.getItem('ear-in-context:theme') }));
      assert(stored.progress === null, 'Erase local progress left practice history behind');
      assert(stored.theme === 'dark', 'Erasing progress removed an unrelated theme setting');
      await shot(page, 'local-data-control');
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
      assert(rows.length === 3, `CSV should contain exactly two sample rows, got ${rows.length - 1}`);
      await shot(page, 'csv-export');
      await context.close();
    },
  },
  {
    id: 'studio-unlock',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/`);
      assert(await page.getByText('$24', { exact: true }).count() === 1, 'Studio price is not shown');
      assert(await page.getByText('one-time purchase', { exact: true }).count() === 1, 'purchase type is not shown');
      assert(await page.locator('a[href="https://api.sociobot.in/api/v1/products/ear-in-context/checkout"]').count() === 1, 'Studio checkout does not use the production Sociobot URL');
      await page.evaluate(() => {
        localStorage.setItem('sb_license:ear-in-context', 'test-license');
        localStorage.setItem('sb_license_verdict:ear-in-context', JSON.stringify({ valid: true, checkedAt: Date.now() }));
      });
      await page.reload();
      await page.getByText('Studio unlocked').waitFor();
      await page.getByText('Progress, sound & license').click();
      for (const name of ['Clarity texture, Studio', 'Reed texture, Studio']) {
        assert(await page.getByRole('button', { name }).isEnabled(), `${name} is not unlocked`);
      }
      await page.getByRole('button', { name: 'Clarity texture, Studio' }).click();
      await page.getByText('Progress, sound & license').click();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Back up progress as JSON' }).click();
      assert((await download).suggestedFilename() === 'ear-in-context-backup.json', 'Studio backup did not download');
      let verifyUrl = '';
      await page.route('https://api.sociobot.in/api/v1/products/ear-in-context/verify?**', async route => {
        verifyUrl = route.request().url();
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
      });
      await page.getByLabel('Have a license? Paste it here.').fill('restored-license');
      await page.getByRole('button', { name: 'Verify Studio license' }).click();
      await page.getByText('License verified. Studio is unlocked.').waitFor();
      assert(verifyUrl.endsWith('license=restored-license'), `license verification used the wrong URL: ${verifyUrl}`);
      await shot(page, 'studio-unlock');
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
      await page.getByRole('heading', { name: 'Sample practice' }).waitFor();
      assert(await page.getByText(/Offline practice is ready/).count() === 1, 'offline state is not explained');
      await shot(page, 'offline-reload');
      await context.close();
    },
  },
];

async function browserChecks(browser) {
  const { context, page } = await fresh(browser);
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const unknown = await page.goto(`${base}/not-a-real-page`);
  assert(unknown?.status() === 404, `unknown route returned HTTP ${unknown?.status()}`);
  assert(await page.title() === 'Page not found — Ear in Context', 'unknown route did not set a 404 title');
  assert(await page.getByRole('heading', { name: 'That practice page does not exist' }).count() === 1, 'unknown route did not render its 404 page');
  assert((await (await context.request.get(`${base}/404`)).status()) === 404, '/404 did not return HTTP 404');
  await page.getByRole('link', { name: 'Open practice' }).click();
  await page.waitForURL(`${base}/`);
  errors.length = 0; // Chromium reports the intentional 404 navigation as a resource error.
  assert(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'route change did not focus the page heading');
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
  assert(await page.title() === 'Privacy — Ear in Context', 'privacy title is not route-specific');
  assert(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/privacy`, 'privacy canonical is wrong');
  await page.waitForFunction(() => document.querySelector('#live-status')?.textContent === 'Privacy — Ear in Context');
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
  await page.goto(`${base}/demo`);
  assert(await page.title() === 'Demo — Ear in Context', 'demo title is not route-specific');
  assert(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/demo`, 'demo canonical is wrong');
  const crawl = await page.evaluate(async () => {
    const paths = ['/', '/demo', '/privacy', '/terms', '/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/favicon.svg'];
    return Promise.all(paths.map(async path => {
      const response = await fetch(path);
      return { path, status: response.status, type: response.headers.get('content-type') ?? '' };
    }));
  });
  assert(crawl.every(item => item.status === 200), `crawl failure: ${JSON.stringify(crawl)}`);
  assert(crawl.find(item => item.path === '/sitemap.xml')?.type.includes('xml'), 'sitemap is not XML');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'mobile page has horizontal overflow');
  await page.goto(`${base}/`);
  const firstScreen = await page.getByRole('heading', { name: 'Practice hearing harmony in chord patterns' }).isVisible()
    && await page.getByRole('link', { name: 'Try sample practice' }).isVisible();
  assert(firstScreen, 'mobile first screen does not show the job and sample action');
  await page.getByRole('button', { name: 'Switch color theme' }).click();
  assert(await page.locator('html').getAttribute('data-theme') === 'dark', 'theme control did not apply dark mode');
  const smallTargets = await page.evaluate(() => Array.from(document.querySelectorAll('a, button, select, summary, input[type="checkbox"]'))
    .filter(element => element.getClientRects().length > 0)
    .map(element => {
      const target = element instanceof HTMLInputElement ? element.closest('label') ?? element : element;
      const rect = target.getBoundingClientRect();
      return { name: element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
    })
    .filter(target => target.width < 44 || target.height < 44));
  assert(smallTargets.length === 0, `touch targets below 44px: ${JSON.stringify(smallTargets)}`);
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  await page.screenshot({ path: 'test-results/browser-mobile.png', fullPage: true });
  await context.close();
}

try {
  await ready();
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const selected = tests.filter(test => !filter || `@claim:${test.id}`.includes(filter));
  assert(selected.length > 0, `No claim test matched ${filter}`);
  for (const test of selected) { await test.run(browser); console.log(`PASS @claim:${test.id}`); }
  if (!filter) { await browserChecks(browser); console.log('PASS browser HTTP routing, metadata, focus, mobile, crawl, and console checks'); }
  await browser.close();
} finally {
  server?.kill('SIGTERM');
}
