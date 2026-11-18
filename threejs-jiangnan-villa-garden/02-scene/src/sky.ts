import * as THREE from 'three';
import { PALETTE, type TimeOfDay } from './config';
import { skyEquirect } from './textures';

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = /* glsl */ `
varying vec3 vDir;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform vec3 uCloudDark;
uniform vec3 uCloudLit;
uniform float uCloudAmount;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += vnoise(p) * a;
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float h = vDir.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.26, h));
  col = mix(col, uTop, smoothstep(0.2, 0.78, h));

  float haze = exp(-max(h, 0.0) * 4.6);
  col = mix(col, uHorizon, haze * 0.4);

  float mu = max(dot(vDir, uSunDir), 0.0);
  col += uSunColor * pow(mu, 6.0) * 0.1;
  col += uSunColor * pow(mu, 90.0) * 0.32;

  vec2 p = vDir.xz / (abs(h) + 0.24);
  float n = fbm(p * 1.35 + vec2(0.7, 0.25));
  float band = smoothstep(-0.02, 0.1, h) * (1.0 - smoothstep(0.34, 0.78, h));
  float cloud = smoothstep(0.5, 0.78, n) * band;
  vec3 cloudCol = mix(uCloudDark, uCloudLit, pow(mu, 2.0));
  col = mix(col, cloudCol, cloud * uCloudAmount);

  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SkyRig {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  envMaps: Record<TimeOfDay, THREE.Texture>;
}

export function buildSky(scene: THREE.Scene, renderer: THREE.WebGLRenderer): SkyRig {
  const uniforms: Record<string, THREE.IUniform> = {
    uTop: { value: new THREE.Color(PALETTE.skyTop) },
    uMid: { value: new THREE.Color(PALETTE.skyMid) },
    uHorizon: { value: new THREE.Color(PALETTE.skyHorizon) },
    uSunColor: { value: new THREE.Color('#ffd9ab') },
    uSunDir: { value: new THREE.Vector3(0.72, 0.19, 0.62).normalize() },
    uCloudDark: { value: new THREE.Color(0.74, 0.72, 0.72) },
    uCloudLit: { value: new THREE.Color(1.0, 0.87, 0.74) },
    uCloudAmount: { value: 0.2 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: true,
    fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(120, 64, 36), mat);
  mesh.name = 'sky';
  mesh.frustumCulled = false;
  scene.add(mesh);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMaps = {} as Record<TimeOfDay, THREE.Texture>;
  for (const mode of ['golden', 'day', 'night'] as const) {
    const eq = skyEquirect(mode);
    envMaps[mode] = pmrem.fromEquirectangular(eq).texture;
    eq.dispose();
  }
  pmrem.dispose();

  scene.environment = envMaps.golden;
  scene.environmentIntensity = 1.05;

  return { mesh, uniforms, envMaps };
}
