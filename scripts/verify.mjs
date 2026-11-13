/**
 * Headless verification for the LeadPulse app.
 *
 * Drives the real UI in Edge: signs in, walks every route, exercises the
 * interactive controls, and fails on console errors or layout overflow.
 *
 *   node scripts/verify.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.APP_URL ?? 'http://127.0.0.1:5173';
const API = process.env.API_URL ?? 'http://127.0.0.1:3000';
const OUT = path.resolve('D:/Projects/LEADPLUS/.data/shots');

const results = [];
const consoleErrors = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function textOf(page, selector) {
  return page
    .$eval(selector, (el) => el.innerText.replace(/\s+/g, ' ').trim())
    .catch(() => null);
}

async function count(page, selector) {
  return page.$$eval(selector, (els) => els.length).catch(() => 0);
}

async function overflows(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
}

/** Sets a controlled React input's value the way a user would. */
async function setInput(page, selector, value) {
  await page.evaluate(
    (sel, val) => {
      const input = document.querySelector(sel);
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set;
      setter.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    selector,
    value
  );
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  // --- sign in through the real API --------------------------------------
  const signIn = await fetch(`${API}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@leadpulse.dev', password: 'demo1234' }),
  });
  if (!signIn.ok) throw new Error(`sign-in failed: ${signIn.status}`);
  const { data } = await signIn.json();
  const token = data.token;
  check('API sign-in returns a token', Boolean(token));

  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${page.url()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`[${page.url()}] pageerror: ${err.message}`));

  // Seed the session token, then reload so the app restores it.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await page.evaluate((t) => window.localStorage.setItem('leadpulse.token', t), token);

  // ---------------------------------------------------------------- landing
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(400);

  const h1 = await textOf(page, 'h1');
  check('landing renders the hero headline', h1?.includes('Never lose a follow-up'), h1 ?? '');

  const sectionIds = await page.$$eval('section[id]', (els) => els.map((e) => e.id));
  check(
    'landing renders every section',
    ['how-it-works', 'features', 'api', 'pricing', 'docs'].every((id) => sectionIds.includes(id)),
    sectionIds.join(',')
  );

  check('landing has no horizontal overflow', !(await overflows(page)));
  await shot(page, '01-landing-hero');

  // Pricing toggle
  const before = await textOf(page, '[class*="pricingGrid"] article:nth-child(1) span[class*="planAmount"]');
  await page.click('button[class*="toggleOption"]:nth-of-type(2)');
  await sleep(350);
  const after = await textOf(page, '[class*="pricingGrid"] article:nth-child(1) span[class*="planAmount"]');
  check('pricing toggle changes the price', before !== after && Boolean(after), `${before} -> ${after}`);

  // API tabs
  const firstTab = await textOf(page, '[role="tab"]');
  await page.click('[role="tab"]:nth-of-type(3)');
  await sleep(250);
  const thirdTab = await textOf(page, '[role="tab"][aria-selected="true"]');
  check('API tabs switch the visible endpoint', firstTab !== thirdTab, `${firstTab} -> ${thirdTab}`);

  // Copy button
  const copyCount = await count(page, 'button[class*="copy"]');
  check('landing exposes copy buttons', copyCount > 0, `${copyCount} found`);

  // ------------------------------------------------------------------- docs
  await page.goto(`${BASE}/docs`, { waitUntil: 'networkidle2' });
  await sleep(500);
  const endpointCount = await count(page, 'article[id]');
  check('docs lists endpoints', endpointCount >= 7, `${endpointCount} endpoints`);
  check('docs has no horizontal overflow', !(await overflows(page)));

  // Expand an endpoint and run the live request
  await page.click('article#observability button[class*="endpointHead"]');
  await sleep(400);
  const runnerVisible = await count(page, 'article#observability [class*="runnerHead"] button');
  check('docs endpoint expands to reveal the runner', runnerVisible > 0, `${runnerVisible} runner buttons`);

  await page.click('article#observability [class*="runnerHead"] button');
  await sleep(1500);
  const runnerStatus = await textOf(page, 'article#observability [class*="runnerStatus"]');
  check(
    'docs live request returns a real status',
    /^\d{3}$/.test(runnerStatus ?? ''),
    runnerStatus ?? 'no status'
  );
  await shot(page, '02-docs-runner');

  // ------------------------------------------------------------------- auth
  await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle2' });
  await sleep(300);
  check('sign-in page renders', (await textOf(page, 'h1'))?.includes('Welcome back'));
  await shot(page, '03-signin');

  // -------------------------------------------------------------- dashboard
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[class*="kpiValue"]', { timeout: 15000 });
  await sleep(700);

  const kpis = await page.$$eval('[class*="kpiValue"]', (els) => els.map((e) => e.textContent.trim()));
  check('overview renders four KPI tiles', kpis.length === 4, kpis.join(' | '));
  check('overview KPI values are populated', kpis.every((v) => v.length > 0));

  const chartPaths = await count(page, '.recharts-area-area');
  check('overview renders the trend chart', chartPaths > 0, `${chartPaths} paths`);

  // Axis labels must not collide along the horizontal axis.
  const axisLabels = await page.$$eval(
    '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value',
    (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, w: r.width };
      })
  );
  let overlap = 0;
  for (let i = 1; i < axisLabels.length; i += 1) {
    if (axisLabels[i].x < axisLabels[i - 1].x + axisLabels[i - 1].w) overlap += 1;
  }
  check('overview axis labels do not overlap', overlap === 0, `${axisLabels.length} labels, ${overlap} overlaps`);

  // Chart paint must come from the theme tokens, not from library defaults.
  const tickStyle = await page
    .$eval('.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value', (el) => {
      const s = getComputedStyle(el);
      return { fill: s.fill, family: s.fontFamily, size: s.fontSize };
    })
    .catch(() => null);
  check(
    'chart ticks are themed by the token system',
    !!tickStyle && tickStyle.fill === 'rgb(107, 116, 130)' && tickStyle.family.includes('JetBrains Mono'),
    tickStyle ? `${tickStyle.fill} / ${tickStyle.family} / ${tickStyle.size}` : 'no tick found'
  );

  const curveStroke = await page
    .$eval('.recharts-area-curve', (el) => getComputedStyle(el).stroke)
    .catch(() => null);
  check('chart curve is themed by the token system', curveStroke === 'rgb(224, 164, 94)', curveStroke ?? 'no curve');

  // Hover the plot to raise the custom tooltip.
  const plot = await page.$('.recharts-surface');
  if (plot) {
    const box = await plot.boundingBox();
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await sleep(500);
  }
  const tooltipText = await page.$eval('[class*="tooltip"]', (el) => el.textContent.trim()).catch(() => '');
  check('chart tooltip renders on hover', tooltipText.length > 0, tooltipText.replace(/\s+/g, ' '));
  await shot(page, '04b-chart-tooltip');
  await page.mouse.move(0, 0);
  await sleep(300);

  const pulseItems = await count(page, '[class*="pulseItem"]');
  check('right column shows a live pulse feed', pulseItems > 0, `${pulseItems} items`);

  check('dashboard has no horizontal overflow', !(await overflows(page)));
  await shot(page, '04-dashboard-overview');

  // Header navigation
  await page.click('a[href="/app/pipeline"]');
  await sleep(900);
  check('header nav routes to the pipeline', page.url().endsWith('/app/pipeline'), page.url());

  // --------------------------------------------------------------- pipeline
  await page.waitForSelector('table[class*="table"] tbody tr', { timeout: 10000 });
  const rowCount = await count(page, 'table[class*="table"] tbody tr');
  check('pipeline renders lead rows', rowCount > 10, `${rowCount} rows`);

  // Search
  await page.type('input[aria-label="Search leads"]', 'rahul');
  await sleep(500);
  const filtered = await count(page, 'table[class*="table"] tbody tr');
  check('pipeline search filters the table', filtered < rowCount && filtered >= 0, `${rowCount} -> ${filtered}`);

  await setInput(page, 'input[aria-label="Search leads"]', '');
  await sleep(500);
  const restored = await count(page, 'table[class*="table"] tbody tr');
  check('clearing the search restores every row', restored === rowCount, `${restored} rows`);

  // Status filter
  await page.select('select[aria-label="Filter by status"]', 'converted');
  await sleep(500);
  const convertedOnly = await page.$$eval('table[class*="table"] tbody tr td:nth-child(3)', (els) =>
    els.map((e) => e.textContent.trim())
  );
  check(
    'pipeline status filter returns only that stage',
    convertedOnly.length > 0 && convertedOnly.every((v) => v === 'converted'),
    `${convertedOnly.length} rows`
  );
  await page.select('select[aria-label="Filter by status"]', 'all');
  await sleep(400);

  // Sorting
  const firstBefore = await textOf(page, 'table[class*="table"] tbody tr:first-child td:first-child');
  await page.click('table[class*="table"] thead th:first-child button');
  await sleep(500);
  const firstAfter = await textOf(page, 'table[class*="table"] tbody tr:first-child td:first-child');
  check('pipeline sorting reorders the table', firstBefore !== firstAfter, `${firstBefore} -> ${firstAfter}`);

  // Sorting twice flips the direction
  await page.click('table[class*="table"] thead th:first-child button');
  await sleep(500);
  const firstReversed = await textOf(page, 'table[class*="table"] tbody tr:first-child td:first-child');
  check('clicking the same column flips the sort direction', firstReversed !== firstAfter, `${firstAfter} -> ${firstReversed}`);

  // Inline detail — no modal
  await page.click('table[class*="table"] tbody tr:first-child');
  await sleep(1200);
  const detailOpen = await count(page, 'section[class*="detail"]');
  check('selecting a lead opens an inline detail panel', detailOpen > 0);
  const dialogs = await count(page, 'div[role="dialog"], dialog');
  check('lead detail is not a modal overlay', dialogs === 0, `${dialogs} dialogs`);
  await shot(page, '05-pipeline-detail');

  // Status change from the detail panel
  const statusSelect = await page.$('select[id="lead-status"]');
  if (statusSelect) {
    const currentValue = await page.$eval('select[id="lead-status"]', (el) => el.value);
    const nextValue = currentValue === 'converted' ? 'contacted' : 'converted';
    await page.select('select[id="lead-status"]', nextValue);
    await sleep(1200);
    const newValue = await page.$eval('select[id="lead-status"]', (el) => el.value);
    check('lead status can be changed', newValue === nextValue, `${currentValue} -> ${newValue}`);
  } else {
    check('lead status can be changed', false, 'status select not found');
  }

  // ------------------------------------------------------------------ calls
  await page.click('a[href="/app/calls"]');
  await sleep(1200);
  const callRows = await count(page, 'li[class*="callRow"]');
  check('calls view lists call history', callRows > 0, `${callRows} rows`);
  const newestCallBefore = await textOf(page, 'li[class*="callRow"]:first-child');

  const transcript = 'Hi, we spoke about bulk pricing for a forty seat team. Send me the pricing sheet.';
  await page.type('textarea[id="call-transcript"]', transcript);
  await page.click('form[class*="callForm"] button[type="submit"]');
  await sleep(2500);

  const toastText = await textOf(page, '[class*="toast"]');
  check('logging a call raises a success toast', /Call logged/i.test(toastText ?? ''), toastText ?? 'no toast');

  const callRowsAfter = await count(page, 'li[class*="callRow"]');
  const newestCallAfter = await textOf(page, 'li[class*="callRow"]:first-child');
  check(
    'logging a call puts it at the top of the history',
    callRowsAfter >= callRows && newestCallAfter !== newestCallBefore,
    `${callRows} -> ${callRowsAfter} rows`
  );
  await shot(page, '06-calls-logged');

  // ----------------------------------------------------------- observability
  await page.click('a[href="/app/observability"]');
  await sleep(1200);
  const jobRows = await count(page, 'table[class*="table"] tbody tr');
  check('observability lists queue jobs', jobRows > 0, `${jobRows} rows`);
  const buckets = await count(page, '[class*="bucketBar"]');
  check('observability shows the latency distribution', buckets > 0, `${buckets} buckets`);
  check('observability has no horizontal overflow', !(await overflows(page)));
  await shot(page, '07-observability');

  // --------------------------------------------------------------- sign out
  await page.click('button[class*="iconButton"]');
  await sleep(900);
  check('sign out returns to the marketing site', new URL(page.url()).pathname === '/', page.url());

  // ----------------------------------------------------------------- mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(500);
  check('mobile landing has no horizontal overflow', !(await overflows(page)));
  await shot(page, '08-mobile-landing');

  await page.evaluate((t) => window.localStorage.setItem('leadpulse.token', t), token);
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[class*="kpiValue"]', { timeout: 15000 });
  await sleep(700);
  check('mobile dashboard has no horizontal overflow', !(await overflows(page)));
  await shot(page, '09-mobile-dashboard');

  await page.goto(`${BASE}/docs`, { waitUntil: 'networkidle2' });
  await sleep(500);
  check('mobile docs has no horizontal overflow', !(await overflows(page)));

  await browser.close();

  // ------------------------------------------------------------------ report
  const failed = results.filter((r) => !r.ok);
  const realErrors = consoleErrors.filter(
    (e) => !/favicon|Failed to load resource.*404|net::ERR_ABORTED/i.test(e)
  );

  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (realErrors.length) {
    console.log(`\nConsole errors (${realErrors.length}):`);
    [...new Set(realErrors)].slice(0, 15).forEach((e) => console.log(` - ${e}`));
  }
  if (failed.length) {
    console.log('\nFailures:');
    failed.forEach((f) => console.log(` - ${f.name} (${f.detail})`));
  }
  if (failed.length || realErrors.length) process.exit(1);
}

main().catch((err) => {
  console.error('verification crashed:', err);
  process.exit(1);
});
