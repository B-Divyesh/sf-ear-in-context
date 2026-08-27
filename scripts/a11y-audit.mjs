import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const url = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(String(error)));
await page.goto(url, { waitUntil: 'networkidle' });

const results = await new AxeBuilder({ page }).analyze();
const serious = results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
console.log(JSON.stringify({ seriousViolations: serious.length, violations: serious.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })), consoleErrors: errors }, null, 2));
await browser.close();
if (serious.length || errors.length) process.exit(1);
