import * as THREE from 'three';

export type Mode = 'day' | 'golden' | 'night';

export interface Palette {
  skyTop: THREE.Color;
  skyMid: THREE.Color;
  skyHorizon: THREE.Color;
  horizonBand: number;
  glowColor: THREE.Color;
  glowOpacity: number;
  fogColor: THREE.Color;
  fogDensity: number;

  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;

  sunColor: THREE.Color;
  sunIntensity: number;
  sunDir: THREE.Vector3;
  sunShadow: number;

  exposure: number;
  windowGlow: number;
  shopGlow: number;
  lampIntensity: number;
  lampGlow: number;

  wallColor: THREE.Color;
  ironColor: THREE.Color;
  roadColor: THREE.Color;
  paveColor: THREE.Color;

  glassTint: THREE.Color;
  glassReflect: number;
  groundReflect: number;
  skyHaze: number;
  treeFill: number;

  blossomColor: THREE.Color;
  blossomEmissive: THREE.Color;
  blossomEmissiveIntensity: number;

  petalColor: THREE.Color;
  starOpacity: number;
}

function p(opts: Partial<Palette>): Palette {
  const base: Palette = {
    skyTop: new THREE.Color('#3a3e64'),
    skyMid: new THREE.Color('#4a456b'),
    skyHorizon: new THREE.Color('#76617f'),
    horizonBand: 0.16,
    glowColor: new THREE.Color('#b3a3d8'),
    glowOpacity: 0.7,
    fogColor: new THREE.Color('#23243d'),
    fogDensity: 0.0034,
    hemiSky: new THREE.Color('#6a6f9e'),
    hemiGround: new THREE.Color('#2a2030'),
    hemiIntensity: 0.42,
    ambientColor: new THREE.Color('#3a3654'),
    ambientIntensity: 0.2,
    sunColor: new THREE.Color('#a9bbdf'),
    sunIntensity: 0.52,
    sunDir: new THREE.Vector3(-12, 20, 12),
    sunShadow: 1,
    exposure: 1.06,
    windowGlow: 1.1,
    shopGlow: 0.86,
    lampIntensity: 1,
    lampGlow: 0.55,
    wallColor: new THREE.Color('#eee1cb'),
    ironColor: new THREE.Color('#f1e8da'),
    roadColor: new THREE.Color('#45464d'),
    paveColor: new THREE.Color('#9a9288'),
    glassTint: new THREE.Color('#4d596d'),
    glassReflect: 0.2,
    groundReflect: 0.12,
    skyHaze: 0,
    treeFill: 0.2,
    blossomColor: new THREE.Color('#f0e6ff'),
    blossomEmissive: new THREE.Color('#8069b2'),
    blossomEmissiveIntensity: 0.45,
    petalColor: new THREE.Color('#c9b8e4'),
    starOpacity: 0.55,
  };
  return { ...base, ...opts };
}

export const PALETTES: Record<Mode, Palette> = {
  night: p({}),
  day: p({
    skyTop: new THREE.Color('#5f8db8'),
    skyMid: new THREE.Color('#9cbdd3'),
    skyHorizon: new THREE.Color('#e7e3d5'),
    horizonBand: 0.12,
    glowColor: new THREE.Color('#fff6e4'),
    glowOpacity: 0.16,
    fogColor: new THREE.Color('#c6d1d6'),
    fogDensity: 0.0017,
    hemiSky: new THREE.Color('#b0cce3'),
    hemiGround: new THREE.Color('#7a6a58'),
    hemiIntensity: 0.42,
    ambientColor: new THREE.Color('#93aabf'),
    ambientIntensity: 0.14,
    sunColor: new THREE.Color('#ffe8c4'),
    sunIntensity: 2.3,
    sunDir: new THREE.Vector3(14, 17, 28),
    sunShadow: 0.95,
    exposure: 0.84,
    windowGlow: 0.025,
    shopGlow: 0.05,
    lampIntensity: 0,
    lampGlow: 0,
    wallColor: new THREE.Color('#e3d1b8'),
    ironColor: new THREE.Color('#eee3cf'),
    roadColor: new THREE.Color('#cfc9bd'),
    paveColor: new THREE.Color('#c2b7a5'),
    glassTint: new THREE.Color('#93aec3'),
    glassReflect: 0.62,
    groundReflect: 0.5,
    skyHaze: 0.55,
    treeFill: 1.05,
    blossomColor: new THREE.Color('#e5d5f8'),
    blossomEmissive: new THREE.Color('#c9b5e6'),
    blossomEmissiveIntensity: 0.1,
    petalColor: new THREE.Color('#c3aade'),
    starOpacity: 0,
  }),
  golden: p({
    skyTop: new THREE.Color('#4d679b'),
    skyMid: new THREE.Color('#8a8fb8'),
    skyHorizon: new THREE.Color('#e8b48c'),
    horizonBand: 0.038,
    glowColor: new THREE.Color('#ffd1a1'),
    glowOpacity: 0.38,
    fogColor: new THREE.Color('#9d8b91'),
    fogDensity: 0.0024,
    hemiSky: new THREE.Color('#c2aab9'),
    hemiGround: new THREE.Color('#5b4337'),
    hemiIntensity: 0.65,
    ambientColor: new THREE.Color('#cca58f'),
    ambientIntensity: 0.24,
    sunColor: new THREE.Color('#ffc38b'),
    sunIntensity: 2.2,
    sunDir: new THREE.Vector3(-20, 10, 16),
    sunShadow: 0.72,
    exposure: 0.97,
    windowGlow: 0.6,
    shopGlow: 0.85,
    lampIntensity: 0.5,
    lampGlow: 0.33,
    wallColor: new THREE.Color('#f6e2c6'),
    ironColor: new THREE.Color('#f4e2cc'),
    roadColor: new THREE.Color('#6a6259'),
    paveColor: new THREE.Color('#a08d7a'),
    glassTint: new THREE.Color('#6f6a63'),
    glassReflect: 0.3,
    groundReflect: 0.28,
    skyHaze: 0.16,
    treeFill: 0.32,
    blossomColor: new THREE.Color('#f3d9e8'),
    blossomEmissive: new THREE.Color('#b97990'),
    blossomEmissiveIntensity: 0.08,
    petalColor: new THREE.Color('#e2c0d5'),
    starOpacity: 0,
  }),
};

/** Blend palette `a` toward `b` by t into `out` (mutates out). */
export function blendPalette(out: Palette, a: Palette, b: Palette, t: number): void {
  out.skyTop.lerpColors(a.skyTop, b.skyTop, t);
  out.skyMid.lerpColors(a.skyMid, b.skyMid, t);
  out.skyHorizon.lerpColors(a.skyHorizon, b.skyHorizon, t);
  out.horizonBand = THREE.MathUtils.lerp(a.horizonBand, b.horizonBand, t);
  out.glowColor.lerpColors(a.glowColor, b.glowColor, t);
  out.glowOpacity = THREE.MathUtils.lerp(a.glowOpacity, b.glowOpacity, t);
  out.fogColor.lerpColors(a.fogColor, b.fogColor, t);
  out.fogDensity = THREE.MathUtils.lerp(a.fogDensity, b.fogDensity, t);
  out.hemiSky.lerpColors(a.hemiSky, b.hemiSky, t);
  out.hemiGround.lerpColors(a.hemiGround, b.hemiGround, t);
  out.hemiIntensity = THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, t);
  out.ambientColor.lerpColors(a.ambientColor, b.ambientColor, t);
  out.ambientIntensity = THREE.MathUtils.lerp(a.ambientIntensity, b.ambientIntensity, t);
  out.sunColor.lerpColors(a.sunColor, b.sunColor, t);
  out.sunIntensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t);
  out.sunDir.lerpVectors(a.sunDir, b.sunDir, t);
  out.sunShadow = THREE.MathUtils.lerp(a.sunShadow, b.sunShadow, t);
  out.exposure = THREE.MathUtils.lerp(a.exposure, b.exposure, t);
  out.windowGlow = THREE.MathUtils.lerp(a.windowGlow, b.windowGlow, t);
  out.shopGlow = THREE.MathUtils.lerp(a.shopGlow, b.shopGlow, t);
  out.lampIntensity = THREE.MathUtils.lerp(a.lampIntensity, b.lampIntensity, t);
  out.lampGlow = THREE.MathUtils.lerp(a.lampGlow, b.lampGlow, t);
  out.wallColor.lerpColors(a.wallColor, b.wallColor, t);
  out.ironColor.lerpColors(a.ironColor, b.ironColor, t);
  out.roadColor.lerpColors(a.roadColor, b.roadColor, t);
  out.paveColor.lerpColors(a.paveColor, b.paveColor, t);
  out.glassTint.lerpColors(a.glassTint, b.glassTint, t);
  out.glassReflect = THREE.MathUtils.lerp(a.glassReflect, b.glassReflect, t);
  out.groundReflect = THREE.MathUtils.lerp(a.groundReflect, b.groundReflect, t);
  out.skyHaze = THREE.MathUtils.lerp(a.skyHaze, b.skyHaze, t);
  out.treeFill = THREE.MathUtils.lerp(a.treeFill, b.treeFill, t);
  out.blossomColor.lerpColors(a.blossomColor, b.blossomColor, t);
  out.blossomEmissive.lerpColors(a.blossomEmissive, b.blossomEmissive, t);
  out.blossomEmissiveIntensity = THREE.MathUtils.lerp(
    a.blossomEmissiveIntensity,
    b.blossomEmissiveIntensity,
    t,
  );
  out.petalColor.lerpColors(a.petalColor, b.petalColor, t);
  out.starOpacity = THREE.MathUtils.lerp(a.starOpacity, b.starOpacity, t);
}

export function clonePalette(src: Palette): Palette {
  return {
    ...src,
    skyTop: src.skyTop.clone(),
    skyMid: src.skyMid.clone(),
    skyHorizon: src.skyHorizon.clone(),
    glowColor: src.glowColor.clone(),
    fogColor: src.fogColor.clone(),
    hemiSky: src.hemiSky.clone(),
    hemiGround: src.hemiGround.clone(),
    ambientColor: src.ambientColor.clone(),
    sunColor: src.sunColor.clone(),
    sunDir: src.sunDir.clone(),
    wallColor: src.wallColor.clone(),
    ironColor: src.ironColor.clone(),
    roadColor: src.roadColor.clone(),
    paveColor: src.paveColor.clone(),
    glassTint: src.glassTint.clone(),
    blossomColor: src.blossomColor.clone(),
    blossomEmissive: src.blossomEmissive.clone(),
    petalColor: src.petalColor.clone(),
  };
}
