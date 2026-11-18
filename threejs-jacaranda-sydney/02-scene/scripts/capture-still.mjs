import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Usage:
//   node scripts/capture-still.mjs --mode=night --out=../../01-refs/direction-still-v1.png
//   node scripts/capture-still.mjs --mode=day   --out=../../01-refs/still-daylight.png

const __dirname = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const mode = arg('mode', 'night');
const outPath = resolve(
  __dirname,
  '..',
  arg('out', '../01-refs/direction-still-v1.png'),
);
const port = arg('port', '5180');
const width = Number(arg('width', '1920'));
const height = Number(arg('height', '1080'));
const azimuth = arg('azimuth', null);
const url = `http://127.0.0.1:${port}/?capture=1&mode=${mode}`;
const useServer = !argv.includes('--no-server');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(dirname(outPath), { recursive: true });

  let preview = null;
  if (useServer) {
    preview = spawn(
      'npx',
      ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
      {
        cwd: resolve(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let ready = false;
    const onData = (buf) => {
      const s = buf.toString();
      process.stdout.write(s);
      if (/Local:|127\.0\.0\.1/.test(s)) ready = true;
    };
    preview.stdout.on('data', onData);
    preview.stderr.on('data', onData);

    const t0 = Date.now();
    while (!ready && Date.now() - t0 < 25000) await wait(200);
    if (!ready) {
      preview.kill('SIGKILL');
      throw new Error('vite preview did not start on port ' + port);
    }
    await wait(400);
  }

  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: false,
    timeout: 120000,
    protocolTimeout: 600000,
    env: { ...process.env, DISPLAY: process.env.CAPTURE_DISPLAY || ':9' },
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader-webgl',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      `--window-size=${width},${height}`,
    ],
    defaultViewport: { width, height, deviceScaleFactor: 1 },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(420000);
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForFunction(() => window.__SHOT_READY === true, { timeout: 420000 });
    await wait(1600);
    if (azimuth !== null) {
      await page.evaluate((deg) => window.__setAzimuth(Number(deg)), azimuth);
      await wait(900);
    }
    await page.evaluate(() => document.activeElement?.blur?.());
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    writeFileSync(outPath, buf);
    console.log(`wrote ${outPath} (${buf.length} bytes, mode=${mode})`);
    if (errors.length) console.log('page console errors:\n' + errors.join('\n'));
  } finally {
    await Promise.race([browser.close(), wait(5000)]);
    if (preview) {
      try {
        preview.kill('SIGKILL');
      } catch {
        /* noop */
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
