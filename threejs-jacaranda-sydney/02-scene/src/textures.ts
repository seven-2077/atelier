import * as THREE from 'three';
import { mulberry32, range, type Rng } from './rng';

function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  srgb = true,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function softBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.55, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * One blossom card contains a loose spray of many tiny five-petal flowers,
 * with transparent gaps so the canopy stays breathable.
 */
export function makeBlossomTexture(seed = 7): THREE.CanvasTexture {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const rng = mulberry32(seed);
    const palettes = [
      '#8b7dcb',
      '#a493db',
      '#b6a7e6',
      '#c6baee',
      '#7869bd',
      '#a996d9',
      '#bfaee6',
      '#9485d3',
    ];
    const cx = w / 2;
    const cy = h / 2;

    // faint cool haze behind the flowers, still broken up by transparency
    for (let i = 0; i < 60; i++) {
      const a = rng() * Math.PI * 2;
      const rad = Math.pow(rng(), 0.55) * 218;
      softBlob(
        ctx,
        cx + Math.cos(a) * rad,
        cy + Math.sin(a) * rad,
        range(rng, 20, 52),
        rng() > 0.7 ? '#bca9df' : '#9585cf',
        0.16,
      );
    }

    for (let i = 0; i < 96; i++) {
      const a = rng() * Math.PI * 2;
      const rad = Math.pow(rng(), 0.5) * 232;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      const size = range(rng, 11, 22);
      const color = palettes[Math.floor(rng() * palettes.length)];
      const rot = rng() * Math.PI * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = range(rng, 0.78, 1);
      ctx.fillStyle = color;
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + range(rng, -0.12, 0.12);
        ctx.save();
        ctx.rotate(pa);
        ctx.beginPath();
        ctx.ellipse(size * 0.55, 0, size * 0.62, size * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = rng() > 0.5 ? '#f0e3fa' : '#e3d1ef';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2);
      ctx.fill();
      // a few buds / darker crevices
      if (rng() > 0.55) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#5e4f8f';
        ctx.beginPath();
        ctx.arc(range(rng, -size, size), range(rng, -size, size), size * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });
}

/** Soft sky reflection bake for glazing: cool top, warmer street bounce below. */
export function makeGlassTintTexture(): THREE.CanvasTexture {
  return canvasTexture(128, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f3f8fc');
    g.addColorStop(0.34, '#dbe8f2');
    g.addColorStop(0.62, '#b8ccd9');
    g.addColorStop(1, '#7f8f9c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // broad diagonal sky streak, like a pane catching the upper sky
    ctx.save();
    ctx.translate(w * 0.2, h);
    ctx.rotate(-0.42);
    const streak = ctx.createLinearGradient(0, 0, w * 0.9, 0);
    streak.addColorStop(0, 'rgba(255,255,255,0)');
    streak.addColorStop(0.45, 'rgba(255,255,255,0.34)');
    streak.addColorStop(0.62, 'rgba(255,255,255,0.08)');
    streak.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = streak;
    ctx.fillRect(0, -h, w, h * 2.4);
    ctx.restore();

    // warm, muted bounce along the sill
    const sill = ctx.createLinearGradient(0, h * 0.78, 0, h);
    sill.addColorStop(0, 'rgba(232,205,170,0)');
    sill.addColorStop(1, 'rgba(226,190,148,0.3)');
    ctx.fillStyle = sill;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
  });
}

/** White iron lace panel, alpha-tested. Deliberately bold so it reads at 1080p. */
export function makeIronTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#f7efe2';
    ctx.fillStyle = '#f7efe2';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // top and bottom rails
    ctx.fillRect(0, 6, w, 18);
    ctx.fillRect(0, 232, w, 18);
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 30, w, 4);
    ctx.fillRect(0, 222, w, 4);
    ctx.globalAlpha = 1;

    const bays = 2;
    const bayW = w / bays;
    for (let b = 0; b < bays; b++) {
      const x0 = b * bayW;
      const mid = x0 + bayW / 2;

      // heavy uprights at the panel edges
      ctx.fillRect(x0 + 8, 24, 12, 208);
      ctx.fillRect(x0 + bayW - 20, 24, 12, 208);

      // central medallion
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(mid, 128, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(mid, 128, 27, 0, Math.PI * 2);
      ctx.stroke();

      // four petals inside the medallion
      ctx.lineWidth = 7;
      for (let p = 0; p < 4; p++) {
        const a = (p / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.arc(mid + Math.cos(a) * 17, 128 + Math.sin(a) * 17, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // generous C-scrolls above and below
      ctx.lineWidth = 10;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(mid + dir * 82, 80, 29, 0.15, Math.PI * 1.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mid + dir * 82, 176, 29, Math.PI * 1.15, Math.PI * 2.1);
        ctx.stroke();
      }

      // diagonal spokes joining medallion to the frame
      ctx.lineWidth = 7;
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(mid + sx * 46, 128 + sy * 46);
          ctx.lineTo(mid + sx * 98, 128 + sy * 84);
          ctx.stroke();
        }
      }

      // spear tips
      ctx.beginPath();
      ctx.moveTo(mid, 46);
      ctx.lineTo(mid - 12, 72);
      ctx.lineTo(mid + 12, 72);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mid, 210);
      ctx.lineTo(mid - 12, 184);
      ctx.lineTo(mid + 12, 184);
      ctx.closePath();
      ctx.fill();
    }
  });
}

/** Warm domestic interior seen through a tall window. */
export function makeWindowTexture(seed = 3): THREE.CanvasTexture {
  return canvasTexture(256, 512, (ctx, w, h) => {
    const rng = mulberry32(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6b4d31');
    g.addColorStop(0.25, '#c18a4e');
    g.addColorStop(0.6, '#ffd89a');
    g.addColorStop(1, '#f2b66f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.5, h * 0.62, 8, w * 0.5, h * 0.62, w * 0.72);
    glow.addColorStop(0, 'rgba(255,245,214,0.95)');
    glow.addColorStop(0.45, 'rgba(255,209,141,0.35)');
    glow.addColorStop(1, 'rgba(90,50,20,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // curtains at the edges
    ctx.fillStyle = 'rgba(96,62,36,0.62)';
    for (const side of [0, 1]) {
      const baseX = side === 0 ? 0 : w;
      const dir = side === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(baseX, 0);
      ctx.quadraticCurveTo(baseX + dir * 58, h * 0.28, baseX + dir * 34, h * 0.55);
      ctx.quadraticCurveTo(baseX + dir * 52, h * 0.8, baseX + dir * 26, h);
      ctx.lineTo(baseX, h);
      ctx.closePath();
      ctx.fill();
    }

    // soft lamp / furniture silhouettes
    ctx.fillStyle = 'rgba(72,44,25,0.4)';
    ctx.fillRect(w * 0.18, h * 0.74, w * 0.64, h * 0.04);
    ctx.fillStyle = 'rgba(60,38,22,0.32)';
    for (let i = 0; i < 12; i++) {
      const x = range(rng, 18, w - 18);
      const y = range(rng, h * 0.78, h * 0.95);
      ctx.fillRect(x, y, range(rng, 3, 9), range(rng, 10, 34));
    }
    // narrow reflections
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#fff4d6';
    ctx.fillRect(w * 0.1, 0, 4, h);
    ctx.fillRect(w * 0.88, 0, 2, h);
    ctx.globalAlpha = 1;
  });
}

/** Warmer, busier shop-window interior for the ground floor. */
export function makeShopTexture(seed = 11): THREE.CanvasTexture {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const rng = mulberry32(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5d4127');
    g.addColorStop(0.18, '#a9713e');
    g.addColorStop(0.5, '#ffd394');
    g.addColorStop(1, '#e5a55d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // pendant pools of light
    for (const x of [w * 0.25, w * 0.5, w * 0.78]) {
      ctx.strokeStyle = 'rgba(73,49,30,0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h * 0.22);
      ctx.stroke();
      softBlob(ctx, x, h * 0.28, 84, '#fff1c8', 0.75);
    }

    // shelves and small goods silhouettes
    ctx.fillStyle = 'rgba(75,46,26,0.5)';
    for (let i = 0; i < 3; i++) {
      const y = h * (0.44 + i * 0.15);
      ctx.fillRect(w * 0.08, y, w * 0.84, 6);
      for (let j = 0; j < 18; j++) {
        const bw = range(rng, 5, 15);
        const bh = range(rng, 12, 42);
        ctx.fillStyle = `rgba(${55 + rng() * 70},${35 + rng() * 40},${24 + rng() * 30},0.5)`;
        ctx.fillRect(range(rng, w * 0.1, w * 0.88), y - bh, bw, bh);
      }
    }

    // plant silhouette
    ctx.strokeStyle = 'rgba(48,44,28,0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.82, h * 0.9);
    ctx.quadraticCurveTo(w * 0.8, h * 0.68, w * 0.86, h * 0.52);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(w * 0.85 + range(rng, -35, 35), h * 0.55 + range(rng, -45, 40), 16, 7, rng() * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52,57,35,0.55)';
      ctx.fill();
    }

    // floor reflection
    const refl = ctx.createLinearGradient(0, h * 0.86, 0, h);
    refl.addColorStop(0, 'rgba(255,219,160,0)');
    refl.addColorStop(1, 'rgba(255,224,176,0.4)');
    ctx.fillStyle = refl;
    ctx.fillRect(0, h * 0.86, w, h * 0.14);

    // window edge vignette
    const vign = ctx.createLinearGradient(0, 0, w, 0);
    vign.addColorStop(0, 'rgba(33,21,14,0.55)');
    vign.addColorStop(0.12, 'rgba(33,21,14,0)');
    vign.addColorStop(0.88, 'rgba(33,21,14,0)');
    vign.addColorStop(1, 'rgba(33,21,14,0.55)');
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, w, h);
  });
}

export function makePavingTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const rng = mulberry32(19);
    ctx.fillStyle = '#6f6a63';
    ctx.fillRect(0, 0, w, h);
    const cell = 128;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        ctx.fillStyle = `rgba(${112 + rng() * 16},${106 + rng() * 14},${96 + rng() * 12},1)`;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
    ctx.strokeStyle = 'rgba(43,41,39,0.55)';
    ctx.lineWidth = 3;
    for (let y = 0; y <= h; y += cell) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x <= w; x += cell) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${40 + rng() * 40},${38 + rng() * 35},${34 + rng() * 30},${rng() * 0.18})`;
      ctx.fillRect(rng() * w, rng() * h, range(rng, 1, 3), range(rng, 1, 3));
    }
  });
}

export function makeAsphaltTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const rng = mulberry32(23);
    // Mid-grey base: the chip variation survives daylight, while the palette
    // multiplies it back down for the after-dark road.
    ctx.fillStyle = '#606168';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const v = 62 + Math.floor(rng() * 58);
      ctx.fillStyle = `rgba(${v},${v},${v + 4},${rng() * 0.5})`;
      ctx.fillRect(rng() * w, rng() * h, range(rng, 1, 2.2), range(rng, 1, 2.2));
    }
    // faint worn wheel tracks, so the daylight road is not a flat block
    for (const y of [h * 0.3, h * 0.7]) {
      const g = ctx.createLinearGradient(0, y - 18, 0, y + 18);
      g.addColorStop(0, 'rgba(150,148,146,0)');
      g.addColorStop(0.5, 'rgba(150,148,146,0.09)');
      g.addColorStop(1, 'rgba(150,148,146,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 18, w, 36);
    }
  });
}

/**
 * Tiny procedural sky cube used only as a reflection probe on glazing and wet
 * paving. It is intentionally soft: a pale zenith, a warm horizon and a broad
 * sun side. Not lighting — just reflected sky.
 */
export function makeSkyEnvTexture(): THREE.CubeTexture {
  const size = 128;
  const makeFace = (
    mode: 'side' | 'top' | 'bottom',
    sunSide = false,
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.clearRect(0, 0, size, size);
    if (mode === 'bottom') {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#9b9182');
      g.addColorStop(1, '#48443d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return canvas;
    }
    const g = ctx.createLinearGradient(0, 0, 0, size);
    if (mode === 'top') {
      g.addColorStop(0, '#b8d4ea');
      g.addColorStop(1, '#dbe4e4');
    } else {
      g.addColorStop(0, '#7ea6c8');
      g.addColorStop(0.42, '#adc8da');
      g.addColorStop(0.68, '#e2e6e1');
      g.addColorStop(0.84, '#eee6d7');
      g.addColorStop(1, '#7c766a');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    if (sunSide) {
      const sun = ctx.createRadialGradient(size * 0.62, size * 0.24, 2, size * 0.62, size * 0.24, size * 0.45);
      sun.addColorStop(0, 'rgba(255,247,224,0.85)');
      sun.addColorStop(0.4, 'rgba(255,240,208,0.28)');
      sun.addColorStop(1, 'rgba(255,238,205,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, size, size);
    }
    return canvas;
  };
  const faces = [
    makeFace('side', true), // +x, sun side
    makeFace('side'), // -x
    makeFace('top'), // +y
    makeFace('bottom'), // -y
    makeFace('side', true), // +z, sun side
    makeFace('side'), // -z
  ];
  const cube = new THREE.CubeTexture(faces);
  cube.colorSpace = THREE.SRGBColorSpace;
  cube.needsUpdate = true;
  return cube;
}

export function makePetalTexture(): THREE.CanvasTexture {
  return canvasTexture(64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.45, h * 0.5, 2, w * 0.5, h * 0.5, w * 0.48);
    g.addColorStop(0, '#e5d9f6');
    g.addColorStop(0.55, '#b9a5dd');
    g.addColorStop(1, 'rgba(130,110,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.5, w * 0.36, h * 0.48, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function makeGlowTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

export function makePlaqueTexture(text = '18'): THREE.CanvasTexture {
  return canvasTexture(256, 160, (ctx, w, h) => {
    ctx.fillStyle = '#e9dfcc';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(90,76,58,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#4c4034';
    ctx.font = '600 76px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 4);
  });
}

export function makeBarkTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 512, (ctx, w, h) => {
    const rng = mulberry32(57);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#5f534c');
    g.addColorStop(0.35, '#74645b');
    g.addColorStop(0.7, '#5b4f49');
    g.addColorStop(1, '#4d433e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 150; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const len = range(rng, 20, 150);
      ctx.strokeStyle = `rgba(${35 + rng() * 30},${28 + rng() * 24},${24 + rng() * 20},${0.18 + rng() * 0.3})`;
      ctx.lineWidth = range(rng, 1, 4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + range(rng, -8, 8), y + len * 0.4, x + range(rng, -10, 10), y + len * 0.7, x + range(rng, -6, 6), y + len);
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(${150 + rng() * 30},${136 + rng() * 26},${118 + rng() * 22},${rng() * 0.12})`;
      ctx.lineWidth = range(rng, 1, 2);
      ctx.beginPath();
      ctx.moveTo(rng() * w, rng() * h);
      ctx.lineTo(rng() * w, rng() * h);
      ctx.stroke();
    }
  });
}

export function makeLeafTexture(): THREE.CanvasTexture {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const rng = mulberry32(31);
    for (let i = 0; i < 18; i++) {
      const x = range(rng, 24, w - 24);
      const y = range(rng, 24, h - 24);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rng() * Math.PI * 2);
      ctx.fillStyle = `rgba(${44 + rng() * 26},${78 + rng() * 34},${58 + rng() * 26},${0.75 + rng() * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, range(rng, 8, 16), range(rng, 3.5, 7), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

/** Fictional magazine cover for the little rack by the door. */
export function makeMagazineTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 340, (ctx, w, h) => {
    ctx.fillStyle = '#b7a4cf';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.25)');
    g.addColorStop(0.6, 'rgba(74,56,102,0.05)');
    g.addColorStop(1, 'rgba(43,30,63,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f0e9e0';
    ctx.font = '600 34px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYDNEY', w / 2, 58);
    ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = 'rgba(244,236,228,0.8)';
    ctx.fillText('spring', w / 2, 86);
    // loose blossom silhouettes
    const rng = mulberry32(43);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${162 + rng() * 60},${140 + rng() * 50},${190 + rng() * 40},${0.25 + rng() * 0.4})`;
      ctx.beginPath();
      ctx.arc(range(rng, 24, w - 24), range(rng, 130, h - 26), range(rng, 3, 11), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(244,236,228,0.9)';
    ctx.font = '10px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('THE JACARANDA ISSUE', w / 2, h - 18);
  });
}

export type { Rng };
