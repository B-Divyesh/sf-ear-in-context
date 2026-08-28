import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const url = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173/';
const staticWebConfig = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
const csp = staticWebConfig.globalHeaders['Content-Security-Policy'];
const hsts = staticWebConfig.globalHeaders['Strict-Transport-Security'];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(String(error)));
if (csp !== "default-src 'self'; connect-src 'self' https://api.sociobot.in; img-src 'self'; media-src 'self' blob:; style-src 'self'; script-src 'self'; worker-src 'self';") {
  errors.push('Unexpected production CSP; the audit must exercise the deployed strict policy.');
}
if (hsts !== 'max-age=63072000; includeSubDomains; preload') {
  errors.push('HSTS is not preload-eligible.');
}
// Vite preview does not read Azure's staticwebapp.config.json. Add the exact
// production policy to navigation responses so this local regression catches
// CSP-blocked inline styles before deployment.
await page.route('**/*', async route => {
  if (!route.request().isNavigationRequest()) return route.continue();
  const response = await route.fetch();
  await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } });
});
await page.goto(url, { waitUntil: 'networkidle' });

const initialResults = await new AxeBuilder({ page }).analyze();
await page.getByRole('button', { name: 'Switch color theme' }).click();
const darkResults = await new AxeBuilder({ page }).analyze();
if (await page.locator('html').getAttribute('data-theme') !== 'dark') errors.push('Theme control did not apply the dark treatment.');
await page.getByRole('button', { name: 'Switch color theme' }).click();

// Exercise the state that was previously missed by the initial-route audit.
const tabs = page.getByRole('tab');
await tabs.nth(0).focus();
await page.keyboard.press('ArrowRight');
const rightTabState = await tabs.evaluateAll(items => items.map(item => ({
  selected: item.getAttribute('aria-selected'),
  tabIndex: item.getAttribute('tabindex'),
  focused: document.activeElement === item,
})));
if (rightTabState[1]?.selected !== 'true' || !rightTabState[1]?.focused || rightTabState[1]?.tabIndex !== '0') {
  errors.push(`ArrowRight tab state was ${JSON.stringify(rightTabState)}`);
}
await page.keyboard.press('ArrowLeft');
const leftTabState = await tabs.evaluateAll(items => items.map(item => ({
  selected: item.getAttribute('aria-selected'),
  focused: document.activeElement === item,
})));
if (leftTabState[0]?.selected !== 'true' || !leftTabState[0]?.focused) {
  errors.push(`ArrowLeft tab state was ${JSON.stringify(leftTabState)}`);
}

await page.getByRole('tab', { name: /Sing it back/i }).click();
await page.locator('.keyboard').waitFor();
const keyboard = await page.locator('.keyboard').evaluate(element => {
  const frame = element.getBoundingClientRect();
  const boxes = (selector) => Array.from(element.querySelectorAll(selector)).map(key => {
    const rect = key.getBoundingClientRect();
    return { className: key.className, left: rect.left, width: rect.width, style: key.getAttribute('style') };
  });
  return { frame: { left: frame.left, width: frame.width }, whites: boxes('.piano-key.white'), blacks: boxes('.piano-key.black') };
});
if (keyboard.whites.length !== 14 || keyboard.blacks.length !== 10) {
  errors.push(`Expected 14 white and 10 black keys, got ${keyboard.whites.length} and ${keyboard.blacks.length}`);
}
if ([...keyboard.whites, ...keyboard.blacks].some(key => key.style !== null)) {
  errors.push('Piano keys still have inline style attributes.');
}
const whiteWidth = keyboard.whites[0]?.width ?? 0;
if (!whiteWidth || keyboard.whites.some((key, index) => Math.abs(key.left - ((keyboard.whites[0]?.left ?? 0) + index * whiteWidth)) > 1)) {
  errors.push('White piano keys are not evenly laid out across the two octaves.');
}
for (const black of keyboard.blacks) {
  const afterWhite = Number(String(black.className).match(/black-after-white-(\d+)/)?.[1]);
  const expected = (keyboard.whites[0]?.left ?? 0) + afterWhite * whiteWidth - 11;
  if (!Number.isInteger(afterWhite) || Math.abs(black.left - expected) > 1) {
    errors.push(`Black piano key is misplaced: ${black.className}`);
  }
}

const marker = page.locator('#pitch-marker');
await marker.evaluate(element => { element.hidden = false; element.setAttribute('data-position', '4'); });
await page.waitForTimeout(140);
const firstMarkerLeft = await marker.evaluate(element => element.getBoundingClientRect().left);
await marker.evaluate(element => element.setAttribute('data-position', '20'));
await page.waitForTimeout(140);
const secondMarkerLeft = await marker.evaluate(element => element.getBoundingClientRect().left);
if (secondMarkerLeft <= firstMarkerLeft + 100) errors.push('Pitch marker did not move across the keyboard.');

const singResults = await new AxeBuilder({ page }).analyze();
await page.goto(new URL('/demo', url).href, { waitUntil: 'networkidle' });
const demoResults = await new AxeBuilder({ page }).analyze();
const routeResults = [];
for (const path of ['/privacy', '/terms', '/not-a-real-page']) {
  await page.goto(new URL(path, url).href, { waitUntil: 'networkidle' });
  routeResults.push(await new AxeBuilder({ page }).analyze());
  if (await page.locator('main h1').count() !== 1) errors.push(`${path} does not have exactly one main heading.`);
}
const serious = [...initialResults.violations, ...darkResults.violations, ...singResults.violations, ...demoResults.violations, ...routeResults.flatMap(result => result.violations)]
  .filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
console.log(JSON.stringify({
  seriousViolations: serious.length,
  violations: serious.map(item => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  })),
  themes: ['light', 'dark'],
  routes: ['/', '/demo', '/privacy', '/terms', '/not-a-real-page'],
  keyboard: { whiteKeys: keyboard.whites.length, blackKeys: keyboard.blacks.length, markerMoved: secondMarkerLeft > firstMarkerLeft + 100 },
  consoleErrors: errors,
}, null, 2));
await browser.close();
if (serious.length || errors.length) process.exit(1);
