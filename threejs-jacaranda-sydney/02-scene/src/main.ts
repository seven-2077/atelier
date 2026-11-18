import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { createBuilding } from './building';
import { createJacaranda } from './jacaranda';
import { FallingPetals } from './petals';
import { PALETTES, blendPalette, clonePalette, type Mode, type Palette } from './palettes';
import { createSite } from './site';
import { createSky } from './sky';
import { makeSkyEnvTexture } from './textures';

declare global {
  interface Window {
    __SHOT_READY?: boolean;
    __setModeInstant?: (mode: Mode) => void;
    __setAzimuth?: (deg: number) => void;
  }
}

const params = new URLSearchParams(location.search);
const isCapture = params.get('capture') === '1';
const initialMode: Mode =
  params.get('mode') === 'day'
    ? 'day'
    : params.get('mode') === 'golden'
      ? 'golden'
      : 'night';

// ------------------------------------------------------------------ renderer
const app = document.getElementById('app');
if (!app) throw new Error('#app missing');
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = PALETTES[initialMode].exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d1024');
scene.fog = new THREE.FogExp2('#191a2e', 0.0034);

// -------------------------------------------------------------------- camera
const TARGET = new THREE.Vector3(4.5, 2.75, -2.4);
const DIST = 39.5;
const PITCH = THREE.MathUtils.degToRad(22.5);
const AZ = THREE.MathUtils.degToRad(31);
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.5,
  400,
);
camera.position.set(
  TARGET.x - Math.sin(AZ) * Math.cos(PITCH) * DIST,
  TARGET.y + Math.sin(PITCH) * DIST,
  TARGET.z + Math.cos(AZ) * Math.cos(PITCH) * DIST,
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.7;
controls.minDistance = 29.5;
controls.maxDistance = 40;
controls.minPolarAngle = 1.08;
controls.maxPolarAngle = 1.33;
const baseAzimuth = controls.getAzimuthalAngle();
controls.minAzimuthAngle = baseAzimuth - 0.25;
controls.maxAzimuthAngle = baseAzimuth + 0.25;
controls.update();

// ------------------------------------------------------------------ lighting
const hemi = new THREE.HemisphereLight('#6a6f9e', '#2a2030', 0.42);
scene.add(hemi);

const ambient = new THREE.AmbientLight('#3a3654', 0.18);
scene.add(ambient);

const sun = new THREE.DirectionalLight('#a9bbdf', 0.9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 90;
sun.shadow.camera.left = -26;
sun.shadow.camera.right = 26;
sun.shadow.camera.top = 26;
sun.shadow.camera.bottom = -26;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.03;
sun.shadow.radius = 4.5;
sun.target.position.set(6, 1, -4);
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.DirectionalLight('#7d86bf', 0.22);
fill.position.set(-24, 10, 18);
scene.add(fill);

// warm street spill: the facade is lit by shopfronts and the lamp, not by daylight
const warmFill = new THREE.DirectionalLight('#ffc58d', 0.65);
warmFill.position.set(13, 9, 20);
warmFill.target.position.set(3, 3.5, -4);
scene.add(warmFill);
scene.add(warmFill.target);

// --------------------------------------------------------------------- world
const sky = createSky();
scene.add(sky.group);

const site = createSite();
site.group.position.y = 0;
scene.add(site.group);

const building = createBuilding();
building.group.position.y = 0.14;
scene.add(building.group);

// Soft procedural sky probe: glazing reflects sky instead of sitting as a
// flat cyan tile, and the day road/sidewalk pick up a little sky sheen.
const skyEnv = makeSkyEnvTexture();
for (const mat of [...building.windowMats, ...building.shopMats]) {
  mat.envMap = skyEnv;
  mat.needsUpdate = true;
}
for (const mat of [...site.roadMats, ...site.paveMats]) {
  mat.envMap = skyEnv;
  mat.needsUpdate = true;
}

const treeA = createJacaranda({
  seed: 512,
  base: new THREE.Vector3(-9.3, 0.145, 1.7),
  trunkLength: 3.5,
  trunkRadius: 0.36,
  leaders: 3,
  spread: 1.06,
  lean: new THREE.Vector3(0.34, 0, -0.18),
  bias: new THREE.Vector3(0.12, 0, -0.04),
  maxDepth: 5,
  childScale: 0.68,
  cardScale: 0.92,
  cardCount: 0,
  minBlossomY: 3.35,
  cardDensity: 0.31,
  lowerRightPrune: { x: 6.7, y: 6.6 },
  straggler: 0.4,
});
scene.add(treeA.group);

const treeB = createJacaranda({
  seed: 902,
  base: new THREE.Vector3(19.35, 0.145, 0.8),
  trunkLength: 4.6,
  trunkRadius: 0.37,
  leaders: 2,
  spread: 0.9,
  lean: new THREE.Vector3(-0.42, 0, -0.12),
  bias: new THREE.Vector3(-0.36, 0, -0.02),
  maxDepth: 5,
  childScale: 0.67,
  cardScale: 1.02,
  cardCount: 0,
  minBlossomY: 5.2,
});
scene.add(treeB.group);

const gardenLight = new THREE.PointLight('#ffbe89', 13, 6.0, 1.9);
gardenLight.position.set(-8.1, 0.7, 2.6);
gardenLight.userData.basePower = 13;
scene.add(gardenLight);

const treeKey = new THREE.DirectionalLight('#cdbdec', 0.55);
treeKey.position.set(-18, 15, 14);
treeKey.target.position.set(4, 6, -1);
scene.add(treeKey);
scene.add(treeKey.target);

const treeGlowLights: THREE.PointLight[] = [];
for (const [x, y, z, dist, power] of [
  [-7.4, 6.0, 2.2, 6.5, 24],
  [-10.6, 4.8, 1.8, 5.5, 12],
  [-8.4, 7.8, 1.6, 5.0, 14],
  [-5.8, 5.4, 6.6, 6.5, 32],
  [-4.6, 7.2, 5.4, 5.0, 18],
  [17.4, 9.4, 2.0, 8.0, 34],
  [20.4, 6.6, 1.2, 6.5, 20],
  [16.8, 11.5, 2.2, 6.5, 24],
  [16.0, 7.4, 8.0, 7.5, 30],
] as const) {
  const l = new THREE.PointLight('#9683cf', power, dist, 1.9);
  l.position.set(x, y, z);
  l.userData.basePower = power;
  scene.add(l);
  treeGlowLights.push(l);
}

const falling = new FallingPetals(110);
scene.add(falling.mesh);

// -------------------------------------------------------------- light records
const baseIntensity = new Map<THREE.Light, number>();
for (const light of [...building.lampLights, ...site.lampLights]) {
  baseIntensity.set(light, light.intensity);
}
for (const light of site.spotLights) baseIntensity.set(light, light.intensity);
const bulbBase = new Map<THREE.MeshStandardMaterial, number>();
for (const mat of [...building.lampBulbs, ...site.lampBulbs]) {
  bulbBase.set(mat, mat.emissiveIntensity);
}
const glowBase = new Map<THREE.SpriteMaterial, number>();
for (const mat of [...building.glowMats, ...site.glowMats]) {
  glowBase.set(mat, mat.opacity);
}

// -------------------------------------------------------------- palette apply
const current = clonePalette(PALETTES[initialMode]);

function applyPalette(p: Palette): void {
  renderer.toneMappingExposure = p.exposure;
  if (scene.fog instanceof THREE.FogExp2) {
    scene.fog.color.copy(p.fogColor);
    scene.fog.density = p.fogDensity;
  }

  (sky.uniforms.topColor.value as THREE.Color).copy(p.skyTop);
  (sky.uniforms.midColor.value as THREE.Color).copy(p.skyMid);
  (sky.uniforms.horizonColor.value as THREE.Color).copy(p.skyHorizon);
  sky.glowMat.color.copy(p.glowColor);
  sky.glowMat.opacity = p.glowOpacity * 0.5;
  (sky.uniforms.glowColor.value as THREE.Color).copy(p.glowColor);
  sky.uniforms.glowStrength.value = p.glowOpacity * 1.35;
  sky.uniforms.hazeStrength.value = p.skyHaze;
  sky.starMat.opacity = p.starOpacity;

  hemi.color.copy(p.hemiSky);
  hemi.groundColor.copy(p.hemiGround);
  hemi.intensity = p.hemiIntensity;
  ambient.color.copy(p.ambientColor);
  ambient.intensity = p.ambientIntensity;

  sun.color.copy(p.sunColor);
  sun.intensity = p.sunIntensity;
  const dir = p.sunDir.clone().normalize();
  sun.position.copy(TARGET).addScaledVector(dir, 48);
  sun.target.position.set(5, 0.5, -4);
  sun.shadow.intensity = p.sunShadow;
  warmFill.intensity = p.lampIntensity * 0.92 + p.shopGlow * 0.08;

  building.wallMats.forEach((m) => m.color.copy(p.wallColor));
  building.trimMats.forEach((m) => m.color.copy(p.ironColor));
  building.ironMats.forEach((m) => {
    m.color.copy(p.ironColor);
    m.emissiveIntensity = 0.1 + p.lampIntensity * 0.46;
  });
  building.windowMats.forEach((m) => {
    m.color.copy(p.glassTint);
    m.envMapIntensity = p.glassReflect;
    m.emissiveIntensity = p.windowGlow * (m.userData.factor ?? 1);
  });
  building.shopMats.forEach((m) => {
    m.color.copy(p.glassTint);
    m.envMapIntensity = p.glassReflect * 0.9;
    m.emissiveIntensity = p.shopGlow * (m.userData.factor ?? 1);
  });

  for (const light of baseIntensity.keys()) {
    light.intensity = (baseIntensity.get(light) ?? 0) * p.lampIntensity;
  }
  for (const [mat, base] of bulbBase) mat.emissiveIntensity = base * p.lampIntensity;
  for (const [mat, base] of glowBase) {
    mat.opacity = base * (p.lampGlow / 0.55);
  }

  treeA.blossomMat.color.copy(p.blossomColor);
  treeB.blossomMat.color.copy(p.blossomColor);
  treeA.blossomMat.emissive.copy(p.blossomEmissive);
  treeB.blossomMat.emissive.copy(p.blossomEmissive);
  treeA.blossomMat.emissiveIntensity = p.blossomEmissiveIntensity;
  treeB.blossomMat.emissiveIntensity = p.blossomEmissiveIntensity;
  treeGlowLights.forEach((l) => {
    l.intensity = (l.userData.basePower as number) * p.lampIntensity;
  });
  gardenLight.intensity = (gardenLight.userData.basePower as number) * p.lampIntensity;
  treeKey.intensity = p.treeFill + p.lampIntensity * 0.9;

  site.roadMats.forEach((m) => {
    m.color.copy(p.roadColor);
    m.envMapIntensity = p.groundReflect;
  });
  site.paveMats.forEach((m) => {
    m.color.copy(p.paveColor);
    m.envMapIntensity = p.groundReflect * 0.62;
  });
  site.petalMat.color.copy(p.petalColor);
  site.petalMat.emissiveIntensity = 0.06 + p.lampIntensity * 0.16;
  falling.setColor(p.petalColor);
  falling.setEmissive(p.blossomEmissive, 0.08 + p.lampIntensity * 0.18);
}

// ------------------------------------------------------------------- petal fx
let elapsed = 0;
let last = performance.now();

// ------------------------------------------------------------- mode transition
const from = clonePalette(PALETTES[initialMode]);
let to: Palette = PALETTES[initialMode];
let mixT = 1;
let mode: Mode = initialMode;
const TRANSITION = 2.4;

function syncButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function setMode(next: Mode, instant = false): void {
  if (!instant && next === mode && mixT >= 1) return;
  if (instant) {
    mode = next;
    from && Object.assign(from, clonePalette(PALETTES[next]));
    to = PALETTES[next];
    mixT = 1;
    Object.assign(current, clonePalette(PALETTES[next]));
    applyPalette(current);
  } else {
    from && Object.assign(from, clonePalette(current));
    to = PALETTES[next];
    mixT = 0;
    mode = next;
  }
  document.body.dataset.mode = next;
  syncButtons();
}

setMode(initialMode, true);
document.body.dataset.mode = initialMode;
syncButtons();

for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-mode]')) {
  btn.addEventListener('click', () => {
    const next = btn.dataset.mode as Mode | undefined;
    if (next === 'day' || next === 'golden' || next === 'night') setMode(next);
  });
}
window.__setModeInstant = (m: Mode) => setMode(m, true);
(window as unknown as Record<string, unknown>).__sceneInfo = () => ({
  pos: camera.position.toArray(),
  target: controls.target.toArray(),
  dist: camera.position.distanceTo(controls.target),
  az: controls.getAzimuthalAngle(),
});
window.__setAzimuth = (deg: number) => {
  const a = THREE.MathUtils.degToRad(deg);
  const r = camera.position.distanceTo(controls.target);
  const polar = Math.acos(
    THREE.MathUtils.clamp((camera.position.y - controls.target.y) / r, -1, 1),
  );
  camera.position.set(
    controls.target.x + Math.sin(a) * Math.sin(polar) * r,
    controls.target.y + Math.cos(polar) * r,
    controls.target.z + Math.cos(a) * Math.sin(polar) * r,
  );
  controls.update();
};

// -------------------------------------------------------------------- resize
function resize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  sky.setResolution(w, h);
}
window.addEventListener('resize', resize);

// ---------------------------------------------------------------------- loop
let frames = 0;
let readyAnnounced = false;

function frame(now: number): void {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  elapsed += dt;

  if (mixT < 1) {
    mixT = Math.min(1, mixT + dt / TRANSITION);
    const t = mixT * mixT * (3 - 2 * mixT);
    blendPalette(current, from, to, t);
    applyPalette(current);
    if (mixT >= 1) Object.assign(current, clonePalette(to));
  }

  controls.update();
  falling.update(dt, elapsed);
  renderer.render(scene, camera);

  frames++;
  if (!readyAnnounced && frames >= 6) {
    readyAnnounced = true;
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        window.__SHOT_READY = true;
      });
    });
  }
  requestAnimationFrame(frame);
}

applyPalette(PALETTES[initialMode]);
document.body.dataset.mode = initialMode;
resize();
sky.setResolution(window.innerWidth, window.innerHeight);
requestAnimationFrame(frame);

if (!isCapture) {
  document.body.classList.add('intro');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add('revealed'));
  });
} else {
  document.body.classList.add('revealed');
}
