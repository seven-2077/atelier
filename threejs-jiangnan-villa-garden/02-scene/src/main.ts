import * as THREE from 'three';
import { CAMERA, KEY_POINTS, PALETTE, SUN, type TimeOfDay } from './config';
import { makeMaterials } from './materials';
import { buildWorld } from './world';
import { buildFlora } from './flora';
import { buildSky } from './sky';
import { createLightingDirector } from './lighting';
import './style.css';

declare global {
  interface Window {
    __stillReady?: boolean;
    __probe?: () => Record<string, [number, number]>;
  }
}

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const params = new URLSearchParams(window.location.search);
const capture = params.get('capture') === '1';
const noShadow = params.get('noshadow') === '1';
const timeParam = params.get('time');
const initialTime: TimeOfDay =
  timeParam === 'day' || timeParam === 'night' || timeParam === 'golden' ? timeParam : 'golden';

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: capture,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = !noShadow;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(PALETTE.fog, 26, 62);

const camera = new THREE.PerspectiveCamera(CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);
camera.position.set(...CAMERA.position);
camera.lookAt(new THREE.Vector3(...CAMERA.target));

const mats = makeMaterials();
const sky = buildSky(scene, renderer);
const { waterNormal } = buildWorld(scene, mats);
buildFlora(scene, mats);

const sun = new THREE.DirectionalLight(SUN.color, SUN.intensity);
sun.position.set(...SUN.position);
sun.target.position.set(...SUN.target);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -11.5;
sun.shadow.camera.right = 11.5;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -9;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 46;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.028;
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.HemisphereLight(0xaac6d8, 0x6b6650, 1.32);
scene.add(fill);

const rim = new THREE.DirectionalLight(0x9ec4d6, 0.9);
rim.position.set(12, 7.5, -13);
rim.target.position.set(1.2, 2.4, 0);
scene.add(rim, rim.target);

const lowFill = new THREE.DirectionalLight(0x9fbfcd, 0.46);
lowFill.position.set(4.5, 3.6, 15);
lowFill.target.position.set(0.6, 0.7, 2.6);
scene.add(lowFill, lowFill.target);

const lanternLights: THREE.PointLight[] = [];
const windowMats = new Set<THREE.MeshStandardMaterial>();
const stoneGlowMats = new Set<THREE.MeshBasicMaterial>();
const reflectionMats = new Set<THREE.MeshBasicMaterial>();
const skyReflMats = new Set<THREE.MeshBasicMaterial>();

scene.traverse((obj) => {
  if ((obj as THREE.PointLight).isPointLight) {
    lanternLights.push(obj as THREE.PointLight);
    return;
  }
  if (!(obj instanceof THREE.Mesh)) return;
  const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const material of materials) {
    if (!material) continue;
    if (material.userData?.glowRole === 'window' && (material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
      windowMats.add(material as THREE.MeshStandardMaterial);
    }
    if ((material as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
      const basic = material as THREE.MeshBasicMaterial;
      if (basic.toneMapped === false && basic.color.getHex() === 0xffc27a) stoneGlowMats.add(basic);
      if (basic.blending === THREE.AdditiveBlending) {
        if (basic.color.getHex() === 0xffb87c) reflectionMats.add(basic);
        else if (basic.map) skyReflMats.add(basic);
      }
    }
  }
});

const warmBounce = new THREE.PointLight(0xff9d66, 3.4, 9.5, 2);
warmBounce.position.set(0.6, 1.0, 3.2);
scene.add(warmBounce);

const director = createLightingDirector({
  scene,
  renderer,
  sky,
  sun,
  fill,
  rim,
  lowFill,
  warmBounce,
  lanternLights,
  windowMats: [...windowMats],
  paperMat: mats.paper,
  glassCoolMat: mats.glassCool,
  waterMat: mats.water,
  stoneGlowMats: [...stoneGlowMats],
  reflectionMats: [...reflectionMats],
  skyReflMats: [...skyReflMats],
});
director.setMode(initialTime, true);

const timeButtons = [...document.querySelectorAll<HTMLButtonElement>('.time-option')];
function syncTimeButtons(mode: TimeOfDay): void {
  for (const button of timeButtons) {
    const on = button.dataset.time === mode;
    button.classList.toggle('is-current', on);
    button.setAttribute('aria-pressed', String(on));
  }
}
syncTimeButtons(initialTime);
for (const button of timeButtons) {
  button.addEventListener('click', () => {
    const mode = button.dataset.time;
    if (mode !== 'day' && mode !== 'golden' && mode !== 'night') return;
    director.setMode(mode);
    syncTimeButtons(mode);
  });
}

window.__probe = () => {
  const out: Record<string, [number, number]> = {};
  for (const [name, p] of Object.entries(KEY_POINTS)) {
    const v = new THREE.Vector3(...(p as [number, number, number]));
    v.project(camera);
    out[name] = [Number(((v.x + 1) / 2).toFixed(3)), Number(((1 - v.y) / 2).toFixed(3))];
  }
  return out;
};

const loader = document.getElementById('loader');
function hideLoader(): void {
  if (!loader) return;
  loader.classList.add('is-gone');
  window.setTimeout(() => loader.remove(), 900);
}
if (capture) {
  loader?.remove();
} else {
  const done = (): void => {
    hideLoader();
    window.__stillReady = true;
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => window.setTimeout(done, 600));
  } else {
    window.setTimeout(done, 900);
  }
}

function resize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
let frames = 0;

function animate(): void {
  const dt = clock.getDelta();
  const t = capture ? 4.2 : clock.elapsedTime;
  director.update(dt);
  if (waterNormal) {
    waterNormal.offset.set(t * 0.006, t * 0.004);
  }
  renderer.render(scene, camera);
  frames++;
  if (capture && frames === 7) {
    window.__stillReady = true;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
