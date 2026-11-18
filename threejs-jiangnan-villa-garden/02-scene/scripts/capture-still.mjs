import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const outPath = resolve(here, '..', arg('out', '../01-refs/direction-still-golden-hour-v2.png'));
const port = arg('port', '5181');
const width = Number(arg('width', '1920'));
const height = Number(arg('height', '1080'));
const timeArg = arg('time', '');
const time = timeArg === 'day' || timeArg === 'golden' || timeArg === 'night' ? timeArg : '';
const click = arg('click', '');
const clickAfter = Number(arg('after', '2400'));
const url = `http://127.0.0.1:${port}/?capture=1${argv.includes('--noshadow') ? '&noshadow=1' : ''}${time ? `&time=${time}` : ''}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function startServer() {
  const server = spawn(
    resolve(here, '..', 'node_modules', '.bin', 'vite'),
    ['preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: resolve(here, '..'), stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let ready = false;
  const onData = (buf) => {
    const s = buf.toString();
    process.stdout.write(s);
    if (/Local:|127\.0\.0\.1/.test(s)) ready = true;
  };
  server.stdout.on('data', onData);
  server.stderr.on('data', onData);
  const t0 = Date.now();
  while (!ready && Date.now() - t0 < 25000) await wait(150);
  if (!ready) throw new Error(`preview server did not start on ${port}`);
  await wait(400);
  return server;
}

async function captureOnce(puppeteer, attempt) {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: true,
    timeout: 120000,
    protocolTimeout: 900000,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu-sandbox',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--force-device-scale-factor=1',
      '--font-render-hinting=none',
      '--hide-scrollbars',
      `--window-size=${width},${height}`,
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    page.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error' || !/GPU stall|WebGL/i.test(t)) console.log('[page]', t);
    });
    page.on('pageerror', (e) => console.error('[pageerror]', e));

    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 180000 });
    await page.waitForFunction('window.__stillReady === true', { timeout: 300000, polling: 400 });
    await wait(1600);
    if (click === 'day' || click === 'golden' || click === 'night') {
      await page.click(`[data-time="${click}"]`);
      await wait(clickAfter);
    }
    const probe = await page.evaluate(() => (window.__probe ? window.__probe() : null));
    const theme = await page.evaluate(() => document.documentElement.dataset.time);
    console.log('attempt', attempt, 'theme', theme, 'anchors', JSON.stringify(probe));
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`saved ${outPath} (${Date.now() - t0}ms)`);
    return true;
  } finally {
    await browser.close().catch(() => {});
  }
}

async function main() {
  mkdirSync(dirname(outPath), { recursive: true });

  let server = null;
  if (!argv.includes('--no-server')) server = await startServer();

  try {
    const { default: puppeteer } = await import('puppeteer-core');
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await captureOnce(puppeteer, attempt);
        return;
      } catch (err) {
        lastErr = err;
        console.error(`attempt ${attempt} failed:`, String(err.message || err).slice(0, 600));
        await wait(2500);
      }
    }
    throw lastErr || new Error('capture failed');
  } finally {
    if (server) server.kill('SIGKILL');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
