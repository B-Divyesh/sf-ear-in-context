import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const liveBase = process.env.LIVE_URL?.replace(/\/$/, '');
const base = liveBase ?? 'http://127.0.0.1:4174';
const grepIndex = process.argv.indexOf('--grep');
const filter = grepIndex >= 0 ? process.argv[grepIndex + 1] : '';
const screenshotDir = process.env.CLAIM_EVIDENCE_DIR ?? 'test-results/claims';
const browserScreenshot = process.env.BROWSER_EVIDENCE_PATH ?? 'test-results/browser-mobile.png';
const billingContract = JSON.parse(await readFile(new URL('../tests/fixtures/sociobot-billing-contract.json', import.meta.url), 'utf8'));
const useAzureEmulator = !filter && !liveBase;
const serverOptions = { stdio: 'ignore', detached: process.platform !== 'win32' };
const server = liveBase
  ? null
  : useAzureEmulator
  ? spawn('swa', ['start', 'dist', '--host', '127.0.0.1', '--port', '4174'], serverOptions)
  : spawn('./node_modules/.bin/vite', ['preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], serverOptions);

await mkdir(screenshotDir, { recursive: true });

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
  await page.screenshot({ path: `${screenshotDir}/${id}.png`, fullPage: false });
}

async function storageState(page) {
  return page.evaluate(() => ({
    real: localStorage.getItem('ear-in-context:progress:v1'),
    demo: localStorage.getItem('demo:ear-in-context:progress:v1'),
  }));
}

async function openPracticeSettings(page) {
  const setup = page.locator('.demo-setup');
  if (await setup.count() && !(await setup.evaluate(element => element.hasAttribute('open')))) {
    await setup.locator('summary').click();
  }
}

async function persistentAudioState(page) {
  return page.evaluate(async () => {
    const localStorageState = Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]));
    const indexedDb = typeof indexedDB.databases === 'function'
      ? (await indexedDB.databases()).map(({ name, version }) => ({ name: name ?? '', version: version ?? 0 })).sort((a, b) => a.name.localeCompare(b.name))
      : [];
    const cacheNames = typeof caches === 'undefined' ? [] : (await caches.keys()).sort();
    return { localStorageState, indexedDb, cacheNames };
  });
}

async function instrumentPrivacy(page) {
  await page.evaluate(() => {
    const probe = { blobCalls: 0, mediaRecorderCalls: 0, objectUrlCalls: 0, tracks: [] };
    window.__privacyProbe = probe;
    const NativeBlob = window.Blob;
    class GuardedBlob extends NativeBlob {
      constructor(parts, options) {
        probe.blobCalls += 1;
        throw new Error('Microphone flow must not create an audio Blob.');
      }
    }
    window.Blob = GuardedBlob;
    const NativeMediaRecorder = window.MediaRecorder;
    if (NativeMediaRecorder) {
      window.MediaRecorder = class GuardedMediaRecorder {
        constructor() {
          probe.mediaRecorderCalls += 1;
          throw new Error('Microphone flow must not create a MediaRecorder.');
        }
      };
    }
    const createObjectUrl = URL.createObjectURL.bind(URL);
    URL.createObjectURL = object => {
      probe.objectUrlCalls += 1;
      return createObjectUrl(object);
    };
    const actualGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    window.__testRealGetUserMedia = actualGetUserMedia;
  });
}

async function installSyntheticC4Microphone(page) {
  await page.evaluate(async () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 261.625565;
    const gain = context.createGain();
    gain.gain.value = 0.35;
    const destination = context.createMediaStreamDestination();
    oscillator.connect(gain).connect(destination);
    oscillator.start();
    await context.resume();
    const track = destination.stream.getAudioTracks()[0];
    window.__syntheticPitch = { context, oscillator, track };
    navigator.mediaDevices.getUserMedia = async () => destination.stream;
  });
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
      await openPracticeSettings(page);
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      assert((await storageState(page)).real === real, 'demo answer changed real progress');
      await page.getByRole('button', { name: 'Reset demo' }).click();
      assert(await page.getByText(/3 answered/).count() === 1, 'Reset demo did not restore sample progress');
      await page.getByRole('button', { name: 'Open your practice' }).click();
      const state = await storageState(page);
      assert(state.real === real, 'leaving demo changed real progress');
      assert(state.demo === null, 'leaving demo did not discard demo progress');
      assert(await page.getByText(/77 answered/).count() === 1, 'leaving demo did not restore normal progress');
      await shot(page, 'demo-isolation');
      await context.close();
    },
  },
  {
    id: 'demo-first-screen',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/`);
      await page.getByRole('link', { name: 'Try sample practice' }).click();
      await page.waitForURL(`${base}/demo`);
      const bounds = await page.evaluate(() => {
        const selectors = ['.voice-map', '[data-action="play"]', '#exercise-title', '[data-choice]'];
        return selectors.map(selector => {
          const element = document.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          return { selector, top: rect?.top ?? -1, bottom: rect?.bottom ?? Number.POSITIVE_INFINITY, viewport: window.innerHeight };
        });
      });
      assert(bounds.every(item => item.top >= 0 && item.bottom <= item.viewport), `sample exercise is below the first phone viewport: ${JSON.stringify(bounds)}`);
      await shot(page, 'demo-first-screen');
      await context.close();
    },
  },
  {
    id: 'chord-pattern-practice',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await instrumentAudio(page);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: /Play chord pattern/ }).click();
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
      await page.getByRole('button', { name: /Play chord pattern/ }).click();
      await page.getByRole('button', { name: /Play chord pattern|Replay chord pattern/ }).waitFor({ state: 'visible', timeout: 5_000 });
      await openPracticeSettings(page);
      await page.getByLabel(/Explore mode/).uncheck();
      await page.locator('[data-choice]').first().click();
      const scored = JSON.parse((await storageState(page)).demo);
      assert(scored.answered === 4, `answer did not update the score: ${scored.answered}`);
      assert(await page.locator('.feedback').count() === 1, 'answer did not produce feedback');
      assert(await page.getByRole('button', { name: /Open next question/ }).count() === 1, 'scored result does not name the next question action');
      assert(await page.getByRole('button', { name: /Replay chord pattern/ }).count() === 1, 'replay action does not name the chord pattern');
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
      await openPracticeSettings(page);
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
    id: 'sung-pitch-feedback',
    async run(browser) {
      const { context, page } = await fresh(browser, true);
      await page.goto(`${base}/demo`);
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      await installSyntheticC4Microphone(page);
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('button', { name: 'Stop microphone' }).waitFor({ timeout: 5_000 });
      await page.getByText(/^C4 · \d+ cents (sharp|flat)$/).waitFor({ timeout: 5_000 });
      const marker = page.locator('#pitch-marker');
      assert(await marker.isVisible(), 'detected C4 did not show the keyboard marker');
      assert(await marker.getAttribute('data-position') === '12', `C4 marker position was ${await marker.getAttribute('data-position')}`);
      await page.getByRole('button', { name: 'Stop microphone' }).click();
      const stopped = await page.evaluate(async () => {
        const state = window.__syntheticPitch.track.readyState;
        window.__syntheticPitch.oscillator.stop();
        await window.__syntheticPitch.context.close();
        return state;
      });
      assert(stopped === 'ended', `stopping the microphone left its track ${stopped}`);
      await shot(page, 'sung-pitch-feedback');
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
      assert(await page.locator('.voice-map').getAttribute('aria-label') === 'Chord pattern with four note groups and one line for each voice.', 'diagram accessible name is not plain language');
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
      await page.getByRole('button', { name: /Play chord pattern/ }).click();
      await page.locator('[data-choice]').first().click();
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      await instrumentPrivacy(page);
      await page.waitForTimeout(250);
      const before = await persistentAudioState(page);
      await page.evaluate(() => {
        navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Blocked for test', 'NotAllowedError'));
      });
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('alert').getByText(/Microphone access was blocked/).waitFor();
      await page.evaluate(() => {
        navigator.mediaDevices.getUserMedia = async constraints => {
          const stream = await window.__testRealGetUserMedia(constraints);
          window.__privacyProbe.tracks = stream.getTracks();
          return stream;
        };
      });
      await page.getByRole('button', { name: 'Start microphone' }).click();
      await page.getByRole('button', { name: 'Stop microphone' }).waitFor({ timeout: 5_000 });
      await page.getByRole('button', { name: 'Stop microphone' }).click();
      await page.waitForTimeout(100);
      const after = await persistentAudioState(page);
      const probe = await page.evaluate(() => ({
        blobCalls: window.__privacyProbe.blobCalls,
        mediaRecorderCalls: window.__privacyProbe.mediaRecorderCalls,
        objectUrlCalls: window.__privacyProbe.objectUrlCalls,
        trackStates: window.__privacyProbe.tracks.map(track => track.readyState),
      }));
      assert(requests.every(request => new URL(request.url).origin === base), `off-origin request during demo: ${JSON.stringify(requests)}`);
      assert(requests.every(request => request.method === 'GET'), `upload-like request during demo: ${JSON.stringify(requests)}`);
      assert(await page.locator('script[src^="http"], iframe').count() === 0, 'remote script or frame is present');
      assert(JSON.stringify(after.localStorageState) === JSON.stringify(before.localStorageState), 'microphone use changed local storage');
      assert(JSON.stringify(after.indexedDb) === JSON.stringify(before.indexedDb), 'microphone use changed IndexedDB');
      assert(JSON.stringify(after.cacheNames) === JSON.stringify(before.cacheNames), 'microphone use changed Cache Storage');
      assert(probe.blobCalls === 0 && probe.mediaRecorderCalls === 0 && probe.objectUrlCalls === 0, `microphone retention API was used: ${JSON.stringify(probe)}`);
      assert(probe.trackStates.length > 0 && probe.trackStates.every(state => state === 'ended'), `microphone tracks were not stopped: ${JSON.stringify(probe.trackStates)}`);
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
    id: 'level-sets',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.addInitScript(() => { Math.random = () => 0.999; });
      await page.goto(`${base}/demo`);
      await openPracticeSettings(page);
      assert(await page.getByText('Higher levels add note roles, chord patterns, or singing targets.').count() === 1, 'difficulty explanation is missing');
      const level = page.getByLabel('Difficulty level');
      const starterRoles = await page.locator('[data-choice]').count();
      await level.selectOption('3');
      const fullRoles = await page.locator('[data-choice]').count();
      assert(starterRoles === 3 && fullRoles === 7, `note-role sets were ${starterRoles} and ${fullRoles}`);
      await page.getByRole('tab', { name: /Progressions/ }).click();
      await openPracticeSettings(page);
      const progressionLevel = page.getByLabel('Difficulty level');
      await progressionLevel.selectOption('1');
      const starterPatterns = await page.locator('[data-choice]').count();
      await progressionLevel.selectOption('3');
      const fullPatterns = await page.locator('[data-choice]').count();
      assert(starterPatterns === 2 && fullPatterns === 6, `chord-pattern sets were ${starterPatterns} and ${fullPatterns}`);
      await page.getByRole('tab', { name: /Sing it back/ }).click();
      await openPracticeSettings(page);
      const singingLevel = page.getByLabel('Difficulty level');
      await singingLevel.selectOption('1');
      const starterTarget = await page.getByText(/^Target:/).textContent();
      await singingLevel.selectOption('3');
      const fullTarget = await page.getByText(/^Target:/).textContent();
      assert(starterTarget === 'Target: G4' && fullTarget === 'Target: D4', `singing targets did not expand: ${starterTarget}, ${fullTarget}`);
      await shot(page, 'level-sets');
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
      assert(await page.getByRole('button', { name: 'Download progress backup' }).count() === 0, 'paid progress backup appeared without Studio');
      await shot(page, 'core-free');
      await context.close();
    },
  },
  {
    id: 'local-data-control',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/demo`);
      await page.getByRole('button', { name: 'Open your practice' }).click();
      await page.getByRole('button', { name: 'Use dark theme' }).click();
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
      const verificationRequests = [];
      await page.route('https://api.sociobot.in/api/v1/products/ear-in-context/verify?**', async route => {
        const url = route.request().url();
        const token = new URL(url).searchParams.get('license');
        verificationRequests.push({ url, token });
        const revoked = token === 'revoked-license';
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: !revoked, reason: revoked ? 'revoked' : 'ok' }) });
      });
      await page.goto(`${base}/`);
      assert(await page.getByText('$24', { exact: true }).count() === 1, 'Studio price is not shown');
      assert(await page.getByText('one-time purchase', { exact: true }).count() === 1, 'purchase type is not shown');
      assert(await page.locator('a[href="https://api.sociobot.in/api/v1/products/ear-in-context/checkout"]').count() === 1, 'Studio checkout does not use the production Sociobot URL');
      await page.goto(`${base}/?license=return-license`);
      await page.waitForURL(`${base}/`);
      assert(!new URL(page.url()).searchParams.has('license'), 'license token remained in the return URL');
      assert(await page.evaluate(() => localStorage.getItem('sb_license:ear-in-context')) === 'return-license', 'return URL did not store the Studio license');
      await page.getByText('Studio unlocked').waitFor();
      await page.getByText('Progress, sound & license').click();
      for (const name of ['Clarity texture, Studio', 'Reed texture, Studio']) {
        assert(await page.getByRole('button', { name }).isEnabled(), `${name} is not unlocked`);
      }
      await page.getByRole('button', { name: 'Clarity texture, Studio' }).click();
      await page.getByText('Progress, sound & license').click();
      assert(await page.getByText('Download progress backup', { exact: true }).count() === 1, 'backup action does not name its result');
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download progress backup' }).click();
      assert((await download).suggestedFilename() === 'ear-in-context-backup.json', 'Studio backup did not download');
      await page.getByLabel('Have a license? Paste it here.').fill('restored-license');
      await page.getByRole('button', { name: 'Verify Studio license' }).click();
      await page.getByText('License verified. Studio is unlocked.').waitFor();
      assert(await page.evaluate(() => localStorage.getItem('sb_license:ear-in-context')) === 'restored-license', 'restore form did not store the Studio license');
      assert(verificationRequests.some(request => request.url.endsWith('license=restored-license')), `license verification used the wrong URL: ${JSON.stringify(verificationRequests)}`);
      await page.getByLabel('Have a license? Paste it here.').fill('revoked-license');
      await page.getByRole('button', { name: 'Verify Studio license' }).click();
      await page.getByText('That license is not active. Check the token or buy Studio.').waitFor();
      assert(await page.getByText('Studio unlocked', { exact: false }).count() === 0, 'revoked license left Studio unlocked');
      const settings = page.locator('.settings details');
      if (!(await settings.evaluate(element => element.hasAttribute('open')))) await page.getByText('Progress, sound & license').click();
      assert(await page.getByRole('button', { name: 'Clarity texture, locked' }).count() === 1, 'revoked license did not lock Studio textures');
      assert(await page.getByRole('button', { name: 'Download progress backup' }).count() === 0, 'revoked license left the paid backup available');
      await page.getByRole('button', { name: 'Remove stored license' }).click();
      await page.getByText('Stored Studio license removed.').waitFor();
      const licenseState = await page.evaluate(() => ({ token: localStorage.getItem('sb_license:ear-in-context'), verdict: localStorage.getItem('sb_license_verdict:ear-in-context') }));
      assert(licenseState.token === null && licenseState.verdict === null, `removing the license left data behind: ${JSON.stringify(licenseState)}`);
      await shot(page, 'studio-unlock');
      await context.close();
    },
  },
  {
    id: 'progress-backup-restore',
    async run(browser) {
      const { context, page } = await fresh(browser);
      await page.route('https://api.sociobot.in/api/v1/products/ear-in-context/verify?**', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
      });
      await page.goto(`${base}/?license=backup-license`);
      await page.waitForURL(`${base}/`);
      const seeded = await page.evaluate(() => ({
        reviews: {
          'degree-1': { attempts: 3, correct: 2, ease: 2.46, intervalDays: 2, dueAt: 1_800_000_000_000 },
          'progression-1': { attempts: 2, correct: 1, ease: 2.1, intervalDays: 0, dueAt: 1_800_000_100_000 },
        },
        level: { intervals: 2, progressions: 3, sing: 1 },
        holdLevel: true,
        sandbox: false,
        sessions: 8,
        answered: 5,
        correct: 3,
        lastVisit: new Date().toISOString().slice(0, 10),
        texture: 'clarity',
      }));
      await page.evaluate(value => localStorage.setItem('ear-in-context:progress:v1', JSON.stringify(value)), seeded);
      await page.reload();
      await page.getByText('Studio unlocked').waitFor();
      await page.getByText('Progress, sound & license').click();
      const downloadEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download progress backup' }).click();
      const downloaded = await downloadEvent;
      assert((await downloaded).suggestedFilename() === 'ear-in-context-backup.json', 'backup download has the wrong filename');
      const backupStream = await downloaded.createReadStream();
      const chunks = [];
      for await (const chunk of backupStream) chunks.push(Buffer.from(chunk));
      const backupFile = Buffer.concat(chunks);
      const envelope = JSON.parse(backupFile.toString('utf8'));
      assert(envelope.format === 'ear-in-context-progress' && envelope.version === 1, 'backup download is not versioned');
      assert(JSON.stringify(envelope.progress) === JSON.stringify(seeded), 'backup download did not contain every saved record and setting');
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Erase local progress' }).click();
      assert(await page.evaluate(() => localStorage.getItem('ear-in-context:progress:v1')) === null, 'test setup did not clear local progress');
      await page.getByText('Progress, sound & license').click();
      assert(await page.getByRole('button', { name: 'Restore progress backup' }).count() === 1, 'restore action is missing');
      await page.locator('#backup-file').setInputFiles({ name: 'ear-in-context-backup.json', mimeType: 'application/json', buffer: backupFile });
      await page.getByText('Backup ready: 2 saved records.').waitFor();
      await page.getByText('Levels: Note roles 2, Progressions 3, Sing it back 1. Scoring mode; Keep current level; clarity sound.').waitFor();
      await page.getByRole('button', { name: 'Replace local progress' }).click();
      await page.getByText('Progress backup restored.').waitFor();
      const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('ear-in-context:progress:v1') ?? '{}'));
      assert(JSON.stringify(restored) === JSON.stringify(seeded), 'restored progress did not match the downloaded records and settings');
      const beforeInvalid = JSON.stringify(restored);
      await page.locator('#backup-file').setInputFiles({ name: 'wrong-backup.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"wrong"}') });
      await page.getByText('This file is not an Ear in Context progress backup. Local progress was not changed.').waitFor();
      assert(await page.evaluate(() => localStorage.getItem('ear-in-context:progress:v1')) === beforeInvalid, 'invalid backup changed local progress');
      await shot(page, 'progress-backup-restore');
      await context.close();
    },
  },
  {
    id: 'billing-contract',
    async run(browser) {
      const { context, page } = await fresh(browser);
      assert(billingContract.schema_version === 1, 'billing contract fixture schema is unknown');
      assert(billingContract.product.slug === 'ear-in-context', 'billing contract fixture has the wrong product');
      assert(billingContract.product.price_usd === 24 && billingContract.product.purchase_type === 'one-time', 'billing contract fixture has the wrong price or purchase type');
      assert(billingContract.checkout.status === 303 && billingContract.checkout.redirect_origin === 'https://checkout.dodopayments.com', 'billing contract fixture does not record the checkout redirect');
      await page.goto(`${base}/`);
      assert(await page.getByText('$24', { exact: true }).count() === 1, 'Studio price is not shown');
      assert(await page.getByText('one-time purchase', { exact: true }).count() === 1, 'Studio purchase type is not shown');
      assert(await page.locator(`a[href="${billingContract.checkout.url}"]`).count() === 1, 'Studio checkout link does not match the recorded Sociobot contract');
      await page.getByText('Progress, sound & license').click();
      assert(await page.getByText('Studio checkout opens on Sociobot.').count() === 1, 'checkout wording is not the tested, narrow statement');
      await shot(page, 'billing-contract');
      await context.close();
    },
  },
  {
    id: 'no-third-party-runtime',
    async run(browser) {
      const routes = ['/', '/demo', '/privacy', '/terms', '/not-a-real-page'];
      for (const path of routes) {
        const { context, page } = await fresh(browser);
        const requests = [];
        page.on('request', request => requests.push(request.url()));
        await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        assert(requests.every(url => new URL(url).origin === base), `${path} loaded an off-origin runtime request: ${JSON.stringify(requests)}`);
        const embedded = await page.evaluate(() => Array.from(document.querySelectorAll('script[src], iframe[src]')).map(element => ({ tag: element.tagName, src: element.getAttribute('src') ?? '' })));
        assert(embedded.every(item => !/^https?:\/\//i.test(item.src)), `${path} embeds a third-party script or frame: ${JSON.stringify(embedded)}`);
        const adLikeElements = await page.locator('[data-analytics], [data-ad], [id*="advert" i], [class*="advert" i]').count();
        assert(adLikeElements === 0, `${path} contains an analytics or ad-like runtime element`);
        await context.close();
      }
      const { context, page } = await fresh(browser);
      await page.goto(`${base}/privacy`);
      await shot(page, 'no-third-party-runtime');
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
  page.on('console', message => {
    const expectedNotFoundNavigation = new URL(page.url()).pathname === '/not-a-real-page'
      && message.text().startsWith('Failed to load resource: the server responded with a status of 404');
    if (message.type() === 'error' && !expectedNotFoundNavigation) errors.push(message.text());
  });
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
  const mobilePrivacy = page.locator('.site-header').getByRole('link', { name: 'Privacy', exact: true });
  assert(await mobilePrivacy.isVisible(), 'Privacy is not visible in the 390 px header');
  const privacyTarget = await mobilePrivacy.evaluate(link => {
    const rect = link.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  assert(privacyTarget.width >= 44 && privacyTarget.height >= 44, `mobile Privacy target is too small: ${JSON.stringify(privacyTarget)}`);
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  assert(await page.locator('html').getAttribute('data-theme') === 'dark', 'theme control did not apply dark mode');
  assert(await page.getByRole('button', { name: 'Use light theme' }).count() === 1, 'theme control did not name the next visible result');
  const smallTargets = await page.evaluate(() => Array.from(document.querySelectorAll('a, button, select, summary, input[type="checkbox"]'))
    .filter(element => element.getClientRects().length > 0)
    .map(element => {
      const target = element instanceof HTMLInputElement ? element.closest('label') ?? element : element;
      const rect = target.getBoundingClientRect();
      return { name: element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
    })
    .filter(target => target.width < 44 || target.height < 44));
  assert(smallTargets.length === 0, `touch targets below 44px: ${JSON.stringify(smallTargets)}`);
  const externalLinkProblems = [];
  for (const path of ['/', '/privacy', '/terms', '/not-a-real-page']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const problems = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .filter(link => new URL(link.href).origin !== location.origin)
      .map(link => ({ href: link.href, name: link.getAttribute('aria-label') ?? link.textContent?.replace(/\s+/g, ' ').trim() ?? '' }))
      .filter(link => !/external/i.test(link.name)));
    externalLinkProblems.push(...problems.map(problem => ({ path, ...problem })));
  }
  assert(externalLinkProblems.length === 0, `off-origin links need external wording: ${JSON.stringify(externalLinkProblems)}`);
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  await page.screenshot({ path: browserScreenshot, fullPage: true });
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
  if (server?.pid) {
    try {
      if (process.platform === 'win32') server.kill('SIGTERM');
      else process.kill(-server.pid, 'SIGTERM');
    } catch { server.kill('SIGTERM'); }
  }
}
