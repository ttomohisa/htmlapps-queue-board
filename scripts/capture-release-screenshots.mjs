import { chromium, firefox, webkit } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import http from 'node:http';

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const distDir = path.join(workspace, 'dist');
const appPath = path.join(distDir, 'index.html');
const selfExtractPath = path.join(distDir, 'index.self-extract.html');
const assetsDir = path.join(workspace, 'assets');
await fs.mkdir(assetsDir, { recursive: true });

const browsers = { chromium, firefox, webkit };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.replace(/^\/+/, '');
    const target = path.join(distDir, relative);
    if (!target.startsWith(distDir)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    const bytes = await fs.readFile(target);
    const type = target.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    response.end(bytes);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Failed to start local release server.');
const serverOrigin = `http://127.0.0.1:${address.port}`;
const appUrl = serverOrigin + '/index.html';

async function waitForSetup(page) {
  await page.waitForFunction(() => {
    const gate = document.querySelector('#persistenceGate');
    const setup = document.querySelector('#setupView');
    return Boolean(gate?.hidden && setup && !setup.hidden);
  });
  const version = await page.locator('#versionBadge').textContent();
  assert(version?.trim() === 'v1.0.0', `Unexpected version badge: ${version}`);
}

async function startDemoSession(page, locale) {
  const ja = locale.startsWith('ja');
  await page.locator('#startNumber').fill('101');
  await page.locator('#counterCount').selectOption('2');
  await page.waitForSelector('[data-counter-index="1"]');
  await page.locator('[data-counter-index="0"]').fill(ja ? '受付 A' : 'Counter A');
  await page.locator('[data-counter-index="1"]').fill(ja ? '受付 B' : 'Counter B');
  await page.locator('#soundEnabled').uncheck();
  await page.locator('.display-settings').evaluate(element => { element.open = true; });
  await page.locator('#displayTitleInput').fill(ja ? '商品お渡し番号' : 'Pickup numbers');
  await page.locator('#setupForm button[type="submit"]').click();
  await page.waitForFunction(() => {
    const operator = document.querySelector('#operatorView');
    return Boolean(operator && !operator.hidden);
  });

  for (let index = 0; index < 8; index += 1) {
    await page.locator('#issueButton').click();
  }

  await page.locator('[data-counter-id="counter-1"] [data-counter-action="call"]').click();
  await page.locator('[data-counter-id="counter-2"] [data-counter-action="call"]').click();
  await page.locator('[data-counter-id="counter-1"] [data-counter-action="complete"]').click();
  await page.locator('[data-counter-id="counter-1"] [data-counter-action="call"]').click();
  await page.locator('[data-counter-id="counter-2"] [data-counter-action="absent"]').click();

  await page.waitForFunction(() =>
    document.querySelector('#waitingCount')?.textContent?.trim() === '5' &&
    document.querySelector('#completedCount')?.textContent?.trim() === '1'
  );
}

async function smokeDisplay(page) {
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#openDisplayButton').click();
  const display = await popupPromise;
  await display.waitForLoadState('domcontentloaded');
  await display.waitForFunction(() => document.querySelectorAll('.display-call-number').length > 0, null, { timeout: 15000 });
  const numbers = await display.locator('.display-call-number').allTextContents();
  assert(numbers.some(value => value.trim() === '103'), 'Display did not receive current Ticket 103.');
  await display.close();
}

async function smokePrintLimit(page) {
  await page.locator('#printTicketsButton').click();
  await page.locator('#printStartNumber').fill('1');
  await page.locator('#printEndNumber').fill('1000');
  await page.locator('#printPerPage').fill('20');
  await page.locator('#refreshPrintPreviewButton').click();
  await page.waitForFunction(() => document.querySelectorAll('.print-ticket').length === 1000, null, { timeout: 30000 });
  const count = await page.locator('.print-ticket').count();
  assert(count === 1000, 'Expected 1000 printable tickets.');
  await page.locator('#closePrintViewButton').click();
}

async function smokeDirectFile(browserType, name, filePath, label) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 900, height: 700 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const externalRequests = [];
  const pageErrors = [];
  context.on('request', request => {
    if (/^https?:/i.test(request.url())) externalRequests.push(request.url());
  });
  page.on('pageerror', error => pageErrors.push(String(error)));
  await page.goto(pathToFileURL(filePath).href);
  await waitForSetup(page);
  assert(externalRequests.length === 0, `${name} ${label}: unexpected HTTP(S) requests: ${externalRequests.join(', ')}`);
  assert(pageErrors.length === 0, `${name} ${label}: page errors: ${pageErrors.join(' | ')}`);
  await context.close();
  await browser.close();
}

async function runBrowserSmoke(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const unexpectedRequests = [];
  const pageErrors = [];
  context.on('request', request => {
    const url = request.url();
    if (/^https?:/i.test(url) && !url.startsWith(serverOrigin + '/')) unexpectedRequests.push(url);
  });
  context.on('page', target => target.on('pageerror', error => pageErrors.push(String(error))));
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.goto(appUrl);
  await waitForSetup(page);
  await startDemoSession(page, 'en-US');
  await smokeDisplay(page);
  await smokePrintLimit(page);

  assert(unexpectedRequests.length === 0, `${name}: unexpected external requests: ${unexpectedRequests.join(', ')}`);
  assert(pageErrors.length === 0, `${name}: page errors: ${pageErrors.join(' | ')}`);
  await context.close();
  await browser.close();

  await smokeDirectFile(browserType, name, appPath, 'readable file://');
  await smokeDirectFile(browserType, name, selfExtractPath, 'self-extract file://');
}

async function capture(locale, viewport, filename, mobile = false) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale, viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(appUrl);
  await waitForSetup(page);
  await startDemoSession(page, locale);
  if (mobile) {
    await page.locator('[data-mobile-tab="operate"]').click();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(assetsDir, filename), fullPage: false });
  await context.close();
  await browser.close();
}

try {
  for (const [name, browserType] of Object.entries(browsers)) {
    await runBrowserSmoke(browserType, name);
  }

  await capture('ja-JP', { width: 1360, height: 900 }, 'screenshot.png');
  await capture('en-US', { width: 1360, height: 900 }, 'screenshot-en.png');
  await capture('ja-JP', { width: 390, height: 844 }, 'screenshot-mobile.png', true);

  console.log('Release browser smoke tests and screenshots completed.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
