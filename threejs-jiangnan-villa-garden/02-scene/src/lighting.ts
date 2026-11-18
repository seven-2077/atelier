import * as THREE from 'three';
import type { TimeOfDay } from './config';
import type { SkyRig } from './sky';

export interface LightingDeps {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  sky: SkyRig;
  sun: THREE.DirectionalLight;
  fill: THREE.HemisphereLight;
  rim: THREE.DirectionalLight;
  lowFill: THREE.DirectionalLight;
  warmBounce: THREE.PointLight;
  lanternLights: THREE.PointLight[];
  windowMats: THREE.MeshStandardMaterial[];
  paperMat: THREE.MeshStandardMaterial;
  glassCoolMat: THREE.MeshPhysicalMaterial;
  waterMat: THREE.MeshPhysicalMaterial;
  stoneGlowMats: THREE.MeshBasicMaterial[];
  reflectionMats: THREE.MeshBasicMaterial[];
  skyReflMats: THREE.MeshBasicMaterial[];
}

interface Preset {
  exposure: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPos: THREE.Vector3;
  shadowRadius: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  rimColor: THREE.Color;
  rimIntensity: number;
  lowFillColor: THREE.Color;
  lowFillIntensity: number;
  bounceColor: THREE.Color;
  bounceIntensity: number;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  skyTop: THREE.Color;
  skyMid: THREE.Color;
  skyHorizon: THREE.Color;
  skySunColor: THREE.Color;
  skySunDir: THREE.Vector3;
  skyCloudDark: THREE.Color;
  skyCloudLit: THREE.Color;
  skyCloudAmount: number;
  envIntensity: number;
  windowGlow: number;
  paperGlow: number;
  lanternLight: number;
  stoneGlowOpacity: number;
  waterColor: THREE.Color;
  waterEmissive: number;
  waterEnv: number;
  skyReflOpacity: number;
  skyReflColor: THREE.Color;
  streakOpacity: number;
  streakColor: THREE.Color;
  glassCoolEmissive: number;
  glassCoolEnv: number;
}

const c = (hex: string): THREE.Color => new THREE.Color(hex);
const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

const PRESETS: Record<TimeOfDay, Preset> = {
  day: {
    exposure: 1.06,
    sunColor: c('#fff3dd'),
    sunIntensity: 2.6,
    sunPos: v(10.5, 14.0, 9.5),
    shadowRadius: 4.5,
    hemiSky: c('#d3e7f2'),
    hemiGround: c('#82866a'),
    hemiIntensity: 1.55,
    rimColor: c('#b8d6e6'),
    rimIntensity: 0.75,
    lowFillColor: c('#b9d3dd'),
    lowFillIntensity: 0.6,
    bounceColor: c('#ffd9b0'),
    bounceIntensity: 0.8,
    fogColor: c('#cfdde3'),
    fogNear: 32,
    fogFar: 72,
    skyTop: c('#6f9fbe'),
    skyMid: c('#a9c4d4'),
    skyHorizon: c('#f0e6d2'),
    skySunColor: c('#fff1d0'),
    skySunDir: v(0.53, 0.7, 0.48).normalize(),
    skyCloudDark: c('#aab8c2'),
    skyCloudLit: c('#f2efe6'),
    skyCloudAmount: 0.3,
    envIntensity: 1.3,
    windowGlow: 0.18,
    paperGlow: 0.22,
    lanternLight: 0.2,
    stoneGlowOpacity: 0.1,
    waterColor: c('#1e4d46'),
    waterEmissive: 0.08,
    waterEnv: 0.95,
    skyReflOpacity: 0.34,
    skyReflColor: c('#ffffff'),
    streakOpacity: 0.08,
    streakColor: c('#ffe0b8'),
    glassCoolEmissive: 0.35,
    glassCoolEnv: 3.4,
  },
  golden: {
    exposure: 1.18,
    sunColor: c('#ffbc82'),
    sunIntensity: 3.55,
    sunPos: v(13.2, 5.6, 8.2),
    shadowRadius: 2.2,
    hemiSky: c('#aac6d8'),
    hemiGround: c('#6b6650'),
    hemiIntensity: 1.32,
    rimColor: c('#9ec4d6'),
    rimIntensity: 0.9,
    lowFillColor: c('#9fbfcd'),
    lowFillIntensity: 0.46,
    bounceColor: c('#ff9d66'),
    bounceIntensity: 3.4,
    fogColor: c('#d7c1a7'),
    fogNear: 26,
    fogFar: 62,
    skyTop: c('#4e5c70'),
    skyMid: c('#9398a3'),
    skyHorizon: c('#e3c8a6'),
    skySunColor: c('#ffd9ab'),
    skySunDir: v(0.72, 0.19, 0.62).normalize(),
    skyCloudDark: new THREE.Color(0.74, 0.72, 0.72),
    skyCloudLit: new THREE.Color(1.0, 0.87, 0.74),
    skyCloudAmount: 0.2,
    envIntensity: 1.05,
    windowGlow: 1,
    paperGlow: 1,
    lanternLight: 1,
    stoneGlowOpacity: 0.85,
    waterColor: c('#163a36'),
    waterEmissive: 0.18,
    waterEnv: 0.7,
    skyReflOpacity: 0.26,
    skyReflColor: c('#ffffff'),
    streakOpacity: 0.55,
    streakColor: c('#ffb87c'),
    glassCoolEmissive: 0.5,
    glassCoolEnv: 2.8,
  },
  night: {
    exposure: 1.02,
    sunColor: c('#93afd6'),
    sunIntensity: 0.7,
    sunPos: v(9.0, 11.0, -9.0),
    shadowRadius: 1.4,
    hemiSky: c('#263852'),
    hemiGround: c('#0b0e13'),
    hemiIntensity: 0.6,
    rimColor: c('#6f8fb8'),
    rimIntensity: 0.35,
    lowFillColor: c('#3f5a75'),
    lowFillIntensity: 0.18,
    bounceColor: c('#ff9d66'),
    bounceIntensity: 1.4,
    fogColor: c('#0b1420'),
    fogNear: 22,
    fogFar: 58,
    skyTop: c('#070c17'),
    skyMid: c('#152036'),
    skyHorizon: c('#2e3c55'),
    skySunColor: c('#3a5173'),
    skySunDir: v(0.53, 0.64, -0.53).normalize(),
    skyCloudDark: c('#101827'),
    skyCloudLit: c('#2a3a52'),
    skyCloudAmount: 0.08,
    envIntensity: 0.62,
    windowGlow: 1.8,
    paperGlow: 1.4,
    lanternLight: 1.55,
    stoneGlowOpacity: 1,
    waterColor: c('#081a19'),
    waterEmissive: 0.07,
    waterEnv: 0.62,
    skyReflOpacity: 0.08,
    skyReflColor: c('#8fa6c4'),
    streakOpacity: 0.85,
    streakColor: c('#ff9a58'),
    glassCoolEmissive: 0.15,
    glassCoolEnv: 1.0,
  },
};

function clonePreset(p: Preset): Preset {
  const out = { ...p } as Preset;
  for (const key of Object.keys(p) as (keyof Preset)[]) {
    const value = p[key] as unknown;
    if (value instanceof THREE.Color) (out as unknown as Record<string, unknown>)[key] = value.clone();
    else if (value instanceof THREE.Vector3) (out as unknown as Record<string, unknown>)[key] = value.clone();
  }
  return out;
}

function lerpPreset(a: Preset, b: Preset, t: number): Preset {
  const out = { ...a } as Preset;
  for (const key of Object.keys(a) as (keyof Preset)[]) {
    const va = a[key] as unknown;
    const vb = b[key] as unknown;
    if (typeof va === 'number' && typeof vb === 'number') (out as unknown as Record<string, unknown>)[key] = va + (vb - va) * t;
    else if (va instanceof THREE.Color && vb instanceof THREE.Color)
      (out as unknown as Record<string, unknown>)[key] = va.clone().lerp(vb, t);
    else if (va instanceof THREE.Vector3 && vb instanceof THREE.Vector3)
      (out as unknown as Record<string, unknown>)[key] = va.clone().lerp(vb, t);
  }
  return out;
}

const ease = (t: number): number => t * t * (3 - 2 * t);

export interface LightingDirector {
  setMode: (mode: TimeOfDay, immediate?: boolean) => void;
  update: (dt: number) => void;
  mode: () => TimeOfDay;
}

export function createLightingDirector(deps: LightingDeps): LightingDirector {
  const { scene, renderer, sky, sun, fill, rim, lowFill, warmBounce } = deps;
  const windowMats = [...new Set(deps.windowMats)];
  const lanternLights = [...new Set(deps.lanternLights)];
  const reflectionMats = [...new Set(deps.reflectionMats)];
  const skyReflMats = [...new Set(deps.skyReflMats)];
  const stoneGlowMats = [...new Set(deps.stoneGlowMats)];

  const baseWindow = new Map<THREE.MeshStandardMaterial, number>();
  for (const m of windowMats) baseWindow.set(m, m.emissiveIntensity);
  const basePaper = deps.paperMat.emissiveIntensity;
  const baseLantern = new Map<THREE.PointLight, number>();
  for (const l of lanternLights) baseLantern.set(l, l.intensity);

  const duration = 2.2;
  let current = clonePreset(PRESETS.golden);
  let from = clonePreset(PRESETS.golden);
  let to = clonePreset(PRESETS.golden);
  let elapsed = 0;
  let transitioning = false;
  let active: TimeOfDay = 'golden';
  let envMode: TimeOfDay = 'golden';

  function apply(p: Preset): void {
    renderer.toneMappingExposure = p.exposure;

    sun.color.copy(p.sunColor);
    sun.intensity = p.sunIntensity;
    sun.position.copy(p.sunPos);
    sun.shadow.radius = p.shadowRadius;

    fill.color.copy(p.hemiSky);
    fill.groundColor.copy(p.hemiGround);
    fill.intensity = p.hemiIntensity;

    rim.color.copy(p.rimColor);
    rim.intensity = p.rimIntensity;

    lowFill.color.copy(p.lowFillColor);
    lowFill.intensity = p.lowFillIntensity;

    warmBounce.color.copy(p.bounceColor);
    warmBounce.intensity = p.bounceIntensity;

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(p.fogColor);
      scene.fog.near = p.fogNear;
      scene.fog.far = p.fogFar;
    }

    const u = sky.uniforms;
    (u.uTop.value as THREE.Color).copy(p.skyTop);
    (u.uMid.value as THREE.Color).copy(p.skyMid);
    (u.uHorizon.value as THREE.Color).copy(p.skyHorizon);
    (u.uSunColor.value as THREE.Color).copy(p.skySunColor);
    (u.uSunDir.value as THREE.Vector3).copy(p.skySunDir).normalize();
    (u.uCloudDark.value as THREE.Color).copy(p.skyCloudDark);
    (u.uCloudLit.value as THREE.Color).copy(p.skyCloudLit);
    u.uCloudAmount.value = p.skyCloudAmount;

    scene.environmentIntensity = p.envIntensity;

    for (const m of windowMats) {
      const base = baseWindow.get(m);
      if (base !== undefined) m.emissiveIntensity = base * p.windowGlow;
    }
    deps.paperMat.emissiveIntensity = basePaper * p.paperGlow;
    for (const l of lanternLights) {
      const base = baseLantern.get(l);
      if (base !== undefined) l.intensity = base * p.lanternLight;
    }
    for (const m of stoneGlowMats) m.opacity = p.stoneGlowOpacity;

    deps.waterMat.color.copy(p.waterColor);
    deps.waterMat.emissiveIntensity = p.waterEmissive;
    deps.waterMat.envMapIntensity = p.waterEnv;

    for (const m of reflectionMats) {
      m.opacity = p.streakOpacity;
      m.color.copy(p.streakColor);
    }
    for (const m of skyReflMats) {
      m.opacity = p.skyReflOpacity;
      m.color.copy(p.skyReflColor);
    }

    deps.glassCoolMat.emissiveIntensity = p.glassCoolEmissive;
    deps.glassCoolMat.envMapIntensity = p.glassCoolEnv;
  }

  function setMode(next: TimeOfDay, immediate = false): void {
    if (next === active && !immediate) return;
    from = clonePreset(current);
    to = clonePreset(PRESETS[next]);
    active = next;
    elapsed = 0;
    document.documentElement.dataset.time = next;

    if (immediate) {
      current = clonePreset(to);
      apply(current);
      scene.environment = sky.envMaps[next];
      envMode = next;
      transitioning = false;
    } else {
      transitioning = true;
    }
  }

  function update(dt: number): void {
    if (!transitioning) return;
    elapsed = Math.min(duration, elapsed + Math.max(0, dt));
    const t = ease(elapsed / duration);
    current = lerpPreset(from, to, t);
    apply(current);

    if (envMode !== active && elapsed / duration >= 0.5) {
      scene.environment = sky.envMaps[active];
      envMode = active;
    }

    if (elapsed >= duration) {
      transitioning = false;
      current = clonePreset(to);
      apply(current);
      if (envMode !== active) {
        scene.environment = sky.envMaps[active];
        envMode = active;
      }
    }
  }

  setMode('golden', true);

  return {
    setMode,
    update,
    mode: () => active,
  };
}
