import * as THREE from 'three';
import { makeGlowTexture } from './textures';
import { mulberry32, range } from './rng';

export interface SkyResult {
  group: THREE.Group;
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  glowMat: THREE.SpriteMaterial;
  starMat: THREE.PointsMaterial;
  setResolution: (w: number, h: number) => void;
}

export function createSky(): SkyResult {
  const uniforms: Record<string, THREE.IUniform> = {
    topColor: { value: new THREE.Color('#171a33') },
    midColor: { value: new THREE.Color('#2e2c4b') },
    horizonColor: { value: new THREE.Color('#5a4a68') },
    horizonBand: { value: 0.16 },
    glowColor: { value: new THREE.Color('#9f93c8') },
    glowDir: { value: new THREE.Vector3(-0.42, 0.3, -1).normalize() },
    glowStrength: { value: 0.5 },
    hazeStrength: { value: 0 },
    resolution: { value: new THREE.Vector2(1920, 1080) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform vec3 glowColor;
      uniform float glowStrength;
      uniform float hazeStrength;
      uniform vec2 resolution;
      varying vec3 vDir;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        float sy = uv.y;
        float lowStart = mix(0.06, 0.0, hazeStrength);
        float lowEnd = mix(0.5, 0.62, hazeStrength);
        float topStart = mix(0.42, 0.33, hazeStrength);
        vec3 col = mix(horizonColor, midColor, smoothstep(lowStart, lowEnd, sy));
        col = mix(col, topColor, smoothstep(topStart, 0.96, sy));
        // Soft ground haze: lifts the horizon without a hard band.
        float band = (1.0 - smoothstep(0.02, 0.55, sy)) * hazeStrength;
        col = mix(col, horizonColor, band * 0.35);
        float halo = pow(max(0.0, 1.0 - distance(uv, vec2(0.19, 0.69)) / 0.62), 3.0);
        col += glowColor * halo * glowStrength * 0.55;
        float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (dither - 0.5) / 255.0;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(170, 32, 20), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;

  // A quiet circular sky-glow behind the left column, not a light shaft.
  const glowMat = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: '#9d92c4',
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    fog: false,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.position.set(-9, 13, -26);
  glow.scale.set(46, 34, 1);
  glow.renderOrder = -8;
  glow.visible = false;

  // sparse stars, only above the roofline
  const rng = mulberry32(771);
  const starCount = 260;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const a = rng() * Math.PI * 2;
    const y = range(rng, 0.1, 0.95);
    const r = Math.sqrt(1 - y * y);
    positions[i * 3] = Math.cos(a) * r * 150;
    positions[i * 3 + 1] = y * 150;
    positions[i * 3 + 2] = Math.sin(a) * r * 150;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#d4d7f2',
    size: 1.15,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;

  const group = new THREE.Group();
  group.add(glow);
  group.add(stars);
  group.add(mesh);

  return {
    group,
    mesh,
    uniforms,
    glowMat,
    starMat,
    setResolution: (w, h) => {
      (uniforms.resolution.value as THREE.Vector2).set(w, h);
    },
  };
}
