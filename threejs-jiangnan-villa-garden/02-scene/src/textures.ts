import type { TimeOfDay } from './config';
import * as THREE from 'three';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [c, ctx];
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number, oct = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += vnoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export interface TexOpts {
  srgb?: boolean;
  repeat?: [number, number];
  flipY?: boolean;
}

function tex(c: HTMLCanvasElement, o: TexOpts = {}): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (o.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function pixelNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: 'plaster' | 'stone' | 'paving' | 'ground' | 'wood' | 'table' | 'tile',
  seed = 3,
): void {
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      let n = fbm(u * 7 + seed, v * 7 + seed, 4);
      let shade = 0;
      if (kind === 'plaster') {
        shade = (n - 0.5) * 16;
        const stain = Math.max(0, fbm(u * 2.4, v * 9 + 11, 3) - 0.62) * 26;
        shade -= stain * (0.4 + v * 0.9);
      } else if (kind === 'stone') {
        shade = (n - 0.5) * 26 + (hash2(x, y) - 0.5) * 9;
        const vein = Math.abs(fbm(u * 5, v * 5, 3) - 0.5) * 70;
        if (vein < 3) shade -= 12;
      } else if (kind === 'paving') {
        shade = (n - 0.5) * 22 + (hash2(x * 1.4, y * 1.4) - 0.5) * 16;
      } else if (kind === 'ground') {
        shade = (n - 0.5) * 30 + (hash2(x, y) - 0.5) * 12;
      } else if (kind === 'wood') {
        const grain = Math.sin(v * 40 + fbm(u * 3, v * 12, 3) * 8) * 6;
        shade = grain + (n - 0.5) * 14;
      } else if (kind === 'table') {
        const grain =
          Math.sin((u * 8 + fbm(u * 2, v * 26, 4) * 3) * 9) * 5 +
          Math.sin(v * 160 + n * 9) * 2;
        shade = grain + (n - 0.5) * 10;
      } else {
        shade = (n - 0.5) * 20;
      }
      d[(y * w + x) * 4 + 0] = 128 + shade;
      d[(y * w + x) * 4 + 1] = 128 + shade;
      d[(y * w + x) * 4 + 2] = 128 + shade;
      d[(y * w + x) * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function tint(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, alpha: number): void {
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function plasterTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#e9e1cf';
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'plaster', 12);
  tint(ctx, 512, 512, '#d8cbb2', 0.35);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#c9b99c';
  ctx.fillRect(0, 300, 512, 212);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return tex(c, { repeat: [1.6, 1.6] });
}

export function pavingTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#a9a08d';
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'paving', 5);
  tint(ctx, 512, 512, '#b6ab93', 0.3);
  return tex(c, { repeat: [2, 2] });
}

export function stoneTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#98907f';
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'stone', 8);
  tint(ctx, 512, 512, '#a49b86', 0.34);
  return tex(c, { repeat: [2, 2] });
}

export function stoneBump(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  pixelNoise(ctx, 256, 256, 'stone', 8);
  return tex(c, { srgb: false, repeat: [2, 2] });
}

export function woodTexture(warm = '#8a5b36'): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'wood', 3);
  tint(ctx, 512, 512, '#7a4c2b', 0.35);
  return tex(c, { repeat: [1.4, 1.4] });
}

export function tileTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#3c424a';
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'tile', 21);
  ctx.globalAlpha = 0.24;
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() < 0.5 ? '#2a3037' : '#545b63';
    ctx.fillRect(0, y, 512, Math.random() * 2 + 0.6);
  }
  ctx.globalAlpha = 1;
  return tex(c, { repeat: [3, 3] });
}

export function groundTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#9c967c';
  ctx.fillRect(0, 0, 512, 512);
  pixelNoise(ctx, 512, 512, 'ground', 4);
  ctx.globalCompositeOperation = 'multiply';
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#b3a88b');
  g.addColorStop(1, '#8c946c');
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.42;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return tex(c, { repeat: [2.6, 2.6] });
}

export function strataTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 256);
  ctx.fillStyle = '#5c4b39';
  ctx.fillRect(0, 0, 512, 256);
  const bands = [
    ['#6a5440', 0.0, 0.16],
    ['#4a3a2d', 0.16, 0.34],
    ['#7d6246', 0.34, 0.5],
    ['#524132', 0.5, 0.68],
    ['#6c553c', 0.68, 0.84],
    ['#403122', 0.84, 1.0],
  ] as const;
  for (const [col, a, b] of bands) {
    ctx.fillStyle = col;
    ctx.fillRect(0, a * 256, 512, (b - a) * 256 + 1);
  }
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.fillStyle = `rgba(20,14,9,${Math.random() * 0.25})`;
    ctx.fillRect(x, y, Math.random() * 8 + 1, Math.random() * 2 + 0.5);
  }
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#8c7453';
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 256, Math.random() * 4, 0.6);
  }
  ctx.globalAlpha = 1;
  return tex(c, { repeat: [3, 1] });
}

export function tableTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024, 1024);
  ctx.fillStyle = '#2a1d15';
  ctx.fillRect(0, 0, 1024, 1024);
  pixelNoise(ctx, 1024, 1024, 'table', 7);
  tint(ctx, 1024, 1024, '#2a1c13', 0.6);
  return tex(c, { repeat: [3, 3] });
}

export function waterNormalTexture(): THREE.CanvasTexture {
  const n = 256;
  const [c, ctx] = makeCanvas(n, n);
  const img = ctx.createImageData(n, n);
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = x / n;
      const v = y / n;
      const ripple =
        Math.sin(u * Math.PI * 6 + fbm(u * 3, v * 3, 3) * 7) * 0.28 +
        Math.sin(v * Math.PI * 9 + 1.7) * 0.16 +
        fbm(u * 6, v * 6, 4) * 0.5;
      h[y * n + x] = ripple;
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const xl = h[y * n + ((x - 1 + n) % n)];
      const xr = h[y * n + ((x + 1) % n)];
      const yt = h[((y - 1 + n) % n) * n + x];
      const yb = h[((y + 1) % n) * n + x];
      const dx = (xr - xl) * 1.4;
      const dy = (yb - yt) * 1.4;
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * n + x) * 4;
      img.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return tex(c, { srgb: false, repeat: [2.2, 2.2] });
}

export function blossomTexture(): THREE.CanvasTexture {
  const s = 128;
  const [c, ctx] = makeCanvas(s, s);
  ctx.clearRect(0, 0, s, s);
  const cx = s / 2;
  const cy = s / 2;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * 21;
    const py = cy + Math.sin(a) * 21;
    const g = ctx.createRadialGradient(px, py, 2, px, py, 26);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px, py, 24, 17, a, 0, Math.PI * 2);
    ctx.fill();
  }
  const g2 = ctx.createRadialGradient(cx, cy, 1, cx, cy, 13);
  g2.addColorStop(0, 'rgba(255,255,255,1)');
  g2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fill();
  return tex(c, { srgb: false, repeat: [1, 1] });
}

export function needleTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 160;
  const [c, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  const fans = [
    { x: w * 0.5, y: h - 2, n: 120, spread: 2.5, scale: 1 },
    { x: w * 0.29, y: h - 18, n: 62, spread: 1.9, scale: 0.66 },
    { x: w * 0.72, y: h - 14, n: 62, spread: 1.9, scale: 0.7 },
  ];
  for (const fan of fans) {
    for (let i = 0; i < fan.n; i++) {
      const x0 = fan.x + (Math.random() - 0.5) * 14;
      const y0 = fan.y - Math.random() * 16;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * fan.spread;
      const len = (28 + Math.random() * 82) * fan.scale;
      const lean = (Math.random() - 0.5) * 20;
      ctx.strokeStyle = `rgba(255,255,255,${0.62 + Math.random() * 0.38})`;
      ctx.lineWidth = (Math.random() * 1.35 + 0.45) * fan.scale;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(
        x0 + Math.cos(ang) * len * 0.5 + lean * 0.4,
        y0 + Math.sin(ang) * len * 0.5,
        x0 + Math.cos(ang) * len + lean,
        y0 + Math.sin(ang) * len,
      );
      ctx.stroke();
    }
  }
  return tex(c, { srgb: false, repeat: [1, 1] });
}

export function bambooLeafTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(128, 256);
  ctx.clearRect(0, 0, 128, 256);
  ctx.save();
  ctx.translate(64, 128);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath();
  ctx.moveTo(0, -118);
  ctx.quadraticCurveTo(26, -30, 7, 58);
  ctx.quadraticCurveTo(2, 96, 0, 118);
  ctx.quadraticCurveTo(-2, 96, -7, 58);
  ctx.quadraticCurveTo(-26, -30, 0, -118);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,190,190,0.9)';
  ctx.fillRect(-0.8, -108, 1.6, 210);
  ctx.restore();
  return tex(c, { srgb: false, repeat: [1, 1] });
}

export function leafVeinTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#f4f2e8';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = 8 + (i / 25) * (w - 16) + (Math.random() - 0.5) * 6;
    const curve = (x - w / 2) * 0.16;
    ctx.strokeStyle = `rgba(186,190,176,${0.22 + Math.random() * 0.24})`;
    ctx.lineWidth = 1 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.quadraticCurveTo(x + curve, h * 0.52, x + curve * 1.5, 0);
    ctx.stroke();
  }
  const rib = ctx.createLinearGradient(w / 2 - 8, 0, w / 2 + 8, 0);
  rib.addColorStop(0, 'rgba(214,205,180,0)');
  rib.addColorStop(0.5, 'rgba(234,225,198,0.85)');
  rib.addColorStop(1, 'rgba(214,205,180,0)');
  ctx.fillStyle = rib;
  ctx.fillRect(w / 2 - 9, 0, 18, h);
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 2 ? '#d7dccb' : '#e8e4d2';
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 2 + Math.random() * 10, 8 + Math.random() * 36, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return tex(c, { repeat: [1, 1] });
}

export function waterSkyTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(244,198,154,0.34)');
  g.addColorStop(0.2, 'rgba(226,196,172,0.3)');
  g.addColorStop(0.46, 'rgba(178,193,202,0.32)');
  g.addColorStop(0.72, 'rgba(132,156,171,0.24)');
  g.addColorStop(1, 'rgba(104,126,140,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 46; i++) {
    const y = Math.random() * h;
    const alpha = 0.04 + Math.random() * 0.08;
    ctx.fillStyle = `rgba(255,232,204,${alpha})`;
    ctx.fillRect(0, y, w, 0.7 + Math.random() * 2.6);
  }
  ctx.globalCompositeOperation = 'destination-out';
  const edge = ctx.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, 'rgba(0,0,0,0.85)');
  edge.addColorStop(0.18, 'rgba(0,0,0,0)');
  edge.addColorStop(0.82, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  return tex(c, { repeat: [1, 1] });
}


export function gravelTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#c9bda6';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 150 + Math.random() * 80;
    ctx.fillStyle = `rgba(${v},${v - 8},${v - 24},${0.2 + Math.random() * 0.3})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2.2, 1 + Math.random() * 2.2);
  }
  ctx.strokeStyle = 'rgba(120,110,94,0.12)';
  ctx.lineWidth = 1.6;
  for (let y = 14; y < h; y += 27) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.05) * 4);
    ctx.bezierCurveTo(w * 0.33, y + 2, w * 0.66, y - 2, w, y + Math.sin(y * 0.07) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = i % 2 ? '#7f8a70' : '#8e927a';
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 24, 5 + Math.random() * 14, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return tex(c, { repeat: [2, 2] });
}

export function reflectionTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,190,120,0)');
  g.addColorStop(0.24, 'rgba(255,190,120,0.30)');
  g.addColorStop(0.5, 'rgba(255,204,140,0.52)');
  g.addColorStop(0.76, 'rgba(255,182,110,0.24)');
  g.addColorStop(1, 'rgba(255,170,100,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const side = ctx.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, 'rgba(0,0,0,0.85)');
  side.addColorStop(0.3, 'rgba(0,0,0,0)');
  side.addColorStop(0.7, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = side;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 16; i++) {
    const y = h * (0.18 + Math.random() * 0.64);
    ctx.fillStyle = `rgba(255,224,178,${0.06 + Math.random() * 0.1})`;
    ctx.fillRect(6, y, w - 12, 1 + Math.random() * 2.4);
  }
  return tex(c, { srgb: false, repeat: [1, 1] });
}

export function shadowTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return tex(c, { srgb: false, repeat: [1, 1] });
}

export function plaqueTexture(text: string): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 96);
  ctx.fillStyle = '#3a2a1c';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = '#7d5f3a';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 84);
  ctx.fillStyle = '#d9b67a';
  ctx.font = '500 46px "Noto Serif CJK SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 50);
  return tex(c, { repeat: [1, 1] });
}

const SKY_STOPS: Record<TimeOfDay, [number, string][]> = {
  day: [
    [0.0, '#5f93b8'],
    [0.2, '#7faecb'],
    [0.36, '#a8c8d9'],
    [0.48, '#cddde3'],
    [0.58, '#e6e6d8'],
    [0.66, '#f2e8d2'],
    [0.72, '#f4ead6'],
    [0.78, '#cbbd9f'],
    [0.87, '#8e7e62'],
    [1.0, '#4f4636'],
  ],
  golden: [
    [0.0, '#4d5a6c'],
    [0.2, '#697486'],
    [0.36, '#8b8f9a'],
    [0.48, '#b0a6a5'],
    [0.58, '#cdb3a2'],
    [0.66, '#e3c5a2'],
    [0.72, '#edd0aa'],
    [0.78, '#b0927c'],
    [0.87, '#5d4c3d'],
    [1.0, '#241a13'],
  ],
  night: [
    [0.0, '#070b16'],
    [0.2, '#0d1424'],
    [0.36, '#162137'],
    [0.48, '#1f2d46'],
    [0.58, '#293850'],
    [0.66, '#34415a'],
    [0.72, '#3a4354'],
    [0.78, '#232a36'],
    [0.87, '#10141c'],
    [1.0, '#05070a'],
  ],
};

export function skyEquirect(mode: TimeOfDay = 'golden'): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of SKY_STOPS[mode]) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  let sunX = w * 0.72;
  let sunY = h * 0.69;
  let haloR = 260;
  let halo: [number, string][] = [
    [0, 'rgba(255,235,198,0.82)'],
    [0.22, 'rgba(255,205,150,0.4)'],
    [0.6, 'rgba(246,182,138,0.12)'],
    [1, 'rgba(246,182,138,0)'],
  ];
  if (mode === 'day') {
    sunX = w * 0.55;
    sunY = h * 0.3;
    haloR = 320;
    halo = [
      [0, 'rgba(255,252,238,0.85)'],
      [0.18, 'rgba(255,244,214,0.35)'],
      [0.55, 'rgba(235,242,240,0.1)'],
      [1, 'rgba(235,242,240,0)'],
    ];
  } else if (mode === 'night') {
    sunX = w * 0.3;
    sunY = h * 0.34;
    haloR = 180;
    halo = [
      [0, 'rgba(205,222,250,0.42)'],
      [0.2, 'rgba(150,180,225,0.16)'],
      [0.6, 'rgba(90,120,170,0.05)'],
      [1, 'rgba(90,120,170,0)'],
    ];
  }

  const rg = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, haloR);
  for (const [at, color] of halo) rg.addColorStop(at, color);
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  if (mode === 'night') {
    ctx.beginPath();
    ctx.arc(sunX, sunY, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,240,252,0.82)';
    ctx.fill();
  }

  let seed = mode === 'day' ? 137 : mode === 'night' ? 911 : 503;
  const rnd = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const cloud0 = mode === 'day' ? '255,252,245' : mode === 'night' ? '128,152,188' : '255,232,208';
  const cloud1 = mode === 'day' ? '238,246,250' : mode === 'night' ? '168,190,218' : '244,206,184';
  const a0 = mode === 'day' ? 0.26 : mode === 'night' ? 0.055 : 0.16;
  const a1 = mode === 'day' ? 0.11 : mode === 'night' ? 0.025 : 0.07;
  for (let i = 0; i < 46; i++) {
    const y = h * (0.1 + rnd() * 0.56);
    const x = rnd() * w;
    const rw = 90 + rnd() * 330;
    const rh = 3 + rnd() * 15;
    const cg = ctx.createRadialGradient(x, y, 0, x, y, rw / 2);
    cg.addColorStop(0, `rgba(${cloud0},${a0})`);
    cg.addColorStop(0.55, `rgba(${cloud1},${a1})`);
    cg.addColorStop(1, `rgba(${cloud1},0)`);
    ctx.fillStyle = cg;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, rh / (rw / 2));
    ctx.beginPath();
    ctx.arc(0, 0, rw / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const t = tex(c, { repeat: [1, 1] });
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
