import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeBarkTexture, makeBlossomTexture, makeLeafTexture } from './textures';
import { mulberry32, range, type Rng } from './rng';

export interface JacarandaSpec {
  seed: number;
  base: THREE.Vector3;
  /** trunk length before the first split */
  trunkLength: number;
  trunkRadius: number;
  /** 2–3 leaders makes a multi-stem look; 2 keeps a single tall trunk */
  leaders: number;
  /** 0.7 tall/upright, 1.15 wide/spreading */
  spread: number;
  lean: THREE.Vector3;
  maxDepth: number;
  childScale: number;
  cardScale: number;
  cardCount: number;
  /** keep blossoms above this height so a bench or door stays readable */
  minBlossomY: number;
  /** inward limit so the canopy does not swallow the magazine column */
  keepOutX?: number;
  /** bend the crown toward the building */
  bias?: THREE.Vector3;
  /** 0.6 = sparse and airy, 1 = normal */
  cardDensity?: number;
  /** clip the lower right of the crown so a doorway stays readable */
  lowerRightPrune?: { x: number; y: number };
  /** chance of a long sparse spray per twig tip */
  straggler?: number;
}

export interface JacarandaResult {
  group: THREE.Group;
  blossomMat: THREE.MeshStandardMaterial;
  leafMat: THREE.MeshStandardMaterial;
  cardCount: number;
}

interface Anchor {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  weight: number;
}

function orientation(from: THREE.Vector3, to: THREE.Vector3): THREE.Quaternion {
  const dir = to.clone().sub(from).normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
}

function taperedSegment(
  from: THREE.Vector3,
  to: THREE.Vector3,
  rBottom: number,
  rTop: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const len = from.distanceTo(to);
  const geo = new THREE.CylinderGeometry(rTop, rBottom, len, radialSegments, 1, false);
  geo.translate(0, len / 2, 0);
  geo.applyQuaternion(orientation(from, to));
  geo.translate(from.x, from.y, from.z);
  return geo;
}

export function createJacaranda(spec: JacarandaSpec): JacarandaResult {
  const group = new THREE.Group();
  group.position.copy(spec.base);
  const rng: Rng = mulberry32(spec.seed);
  const geos: THREE.BufferGeometry[] = [];
  const anchors: Anchor[] = [];

  const addAnchor = (pos: THREE.Vector3, dir: THREE.Vector3, weight: number): void => {
    if (pos.y < spec.minBlossomY) return;
    if (spec.keepOutX !== undefined && pos.x < spec.keepOutX) return;
    if (
      spec.lowerRightPrune &&
      pos.x > spec.lowerRightPrune.x &&
      pos.y < spec.lowerRightPrune.y
    ) {
      return;
    }
    anchors.push({ pos: pos.clone(), dir: dir.clone(), weight });
  };

  const grow = (
    start: THREE.Vector3,
    dir: THREE.Vector3,
    length: number,
    radius: number,
    depth: number,
  ): void => {
    let p = start.clone();
    let d = dir.clone().normalize();
    const segs = depth === 0 ? 5 : depth === 1 ? 3 : 2;
    for (let i = 0; i < segs; i++) {
      const wobble = depth === 0 ? 0.07 : 0.16;
      d.add(
        new THREE.Vector3(
          range(rng, -wobble, wobble),
          range(rng, -wobble * 0.4, wobble * 0.7),
          range(rng, -wobble, wobble),
        ),
      ).normalize();
      if (depth > 0 && d.y < -0.12) d.y = -0.12;
      const segLen = length / segs;
      const end = p.clone().addScaledVector(d, segLen);
      const t0 = i / segs;
      const t1 = (i + 1) / segs;
      const r0 = Math.max(0.018, radius * (1 - t0 * 0.42));
      const r1 = Math.max(0.012, radius * (1 - t1 * 0.42) * (depth === 0 ? 0.9 : 0.82));
      geos.push(taperedSegment(p, end, r0, r1, depth < 2 ? 8 : 5));
      if (depth >= spec.maxDepth - 1 && rng() > 0.3) {
        addAnchor(end, d, 0.8);
      }
      p = end;
    }

    if (depth < spec.maxDepth) {
      const childCount = depth === 0 ? spec.leaders : depth === 1 ? 2 : 2;
      for (let c = 0; c < childCount; c++) {
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(d, up);
        if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
        perp.normalize();
        const perp2 = new THREE.Vector3().crossVectors(d, perp).normalize();
        const azimuth = rng() * Math.PI * 2;
        const tilt = range(rng, 0.42, 0.86) * spec.spread;
        const nd = d
          .clone()
          .multiplyScalar(Math.cos(tilt))
          .addScaledVector(perp, Math.sin(tilt) * Math.cos(azimuth))
          .addScaledVector(perp2, Math.sin(tilt) * Math.sin(azimuth))
          .normalize();
        // gently lift the outer twigs, then let the very tips relax
        nd.y += depth === 0 ? 0.22 : 0.06;
        if (spec.bias) {
          nd.x += spec.bias.x * (depth < 2 ? 1 : 0.55);
          nd.z += spec.bias.z * (depth < 2 ? 1 : 0.55);
        }
        nd.normalize();
        grow(
          p,
          nd,
          length * spec.childScale * range(rng, 0.9, 1.12),
          radius * 0.56,
          depth + 1,
        );
      }
      // keep a leader so the silhouette is not a pure candelabra
      const leader = d.clone();
      leader.y += 0.28;
      leader.normalize();
      grow(p, leader, length * 0.7, radius * 0.5, depth + 1);
    } else {
      // final twigs: a loose spray of blossom sites, with the branch still visible
      const twigCount = 2 + (rng() > 0.55 ? 1 : 0);
      for (let i = 0; i < twigCount; i++) {
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(d, up);
        if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
        perp.normalize();
        const perp2 = new THREE.Vector3().crossVectors(d, perp).normalize();
        const azimuth = rng() * Math.PI * 2;
        const tilt = range(rng, 0.28, 0.95);
        const nd = d
          .clone()
          .multiplyScalar(Math.cos(tilt))
          .addScaledVector(perp, Math.sin(tilt) * Math.cos(azimuth))
          .addScaledVector(perp2, Math.sin(tilt) * Math.sin(azimuth))
          .normalize();
        nd.y += 0.05;
        nd.normalize();
        const twigLen = range(rng, 0.5, 1.2);
        const tip = p.clone().addScaledVector(nd, twigLen);
        geos.push(taperedSegment(p, tip, 0.026, 0.007, 4));
        const flowering = 0.3 + rng() * 1.15;
        if (flowering > 0.55) addAnchor(tip, nd, 0.55 + flowering * 0.6);
      }
      // occasional long, sparse spray keeps the silhouette from closing into a ball
      if (rng() < (spec.straggler ?? 0.24)) {
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(d, up);
        if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
        perp.normalize();
        const perp2 = new THREE.Vector3().crossVectors(d, perp).normalize();
        const a = rng() * Math.PI * 2;
        const nd = d
          .clone()
          .multiplyScalar(0.55)
          .addScaledVector(perp, Math.cos(a) * 0.8)
          .addScaledVector(perp2, Math.sin(a) * 0.8)
          .normalize();
        nd.y += 0.12;
        nd.normalize();
        const len = range(rng, 1.6, 2.8);
        const tip = p.clone().addScaledVector(nd, len);
        geos.push(taperedSegment(p, tip, 0.022, 0.005, 4));
        addAnchor(tip, nd, 0.7);
      }
      if (rng() > 0.72) addAnchor(p, d, 0.7);
    }
  };

  const trunkDir = new THREE.Vector3(spec.lean.x, 1, spec.lean.z).normalize();
  grow(new THREE.Vector3(0, 0, 0), trunkDir, spec.trunkLength, spec.trunkRadius, 0);

  // exposed roots / trunk flare
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rng() * 0.5;
    const from = new THREE.Vector3(0, 0.18, 0);
    const to = new THREE.Vector3(
      Math.cos(a) * range(rng, 0.5, 0.9),
      -0.02,
      Math.sin(a) * range(rng, 0.5, 0.9),
    );
    geos.push(taperedSegment(from, to, 0.16, 0.045, 6));
  }

  const barkTex = makeBarkTexture();
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
  barkTex.repeat.set(2, 3);
  const barkMat = new THREE.MeshStandardMaterial({
    color: '#b3a396',
    emissive: '#2a211c',
    emissiveIntensity: 0.34,
    map: barkTex,
    roughness: 0.94,
    metalness: 0,
  });
  const merged = mergeGeometries(geos, false);
  if (merged) {
    const branches = new THREE.Mesh(merged, barkMat);
    branches.castShadow = true;
    branches.receiveShadow = true;
    group.add(branches);
  }
  geos.forEach((g) => g.dispose());

  // ------------------------------------------------------------- blossom cards
  const blossomTex = makeBlossomTexture(spec.seed);
  const blossomMat = new THREE.MeshStandardMaterial({
    map: blossomTex,
    color: '#f0e7fb',
    emissive: new THREE.Color('#9a84c8'),
    emissiveIntensity: 1.0,
    alphaTest: 0.24,
    side: THREE.DoubleSide,
    roughness: 0.96,
    metalness: 0,
  });

  const cards: { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number }[] = [];
  for (const anchor of anchors) {
    const n = Math.round(range(rng, 1.0, 2.3) * anchor.weight * (spec.cardDensity ?? 1));
    for (let i = 0; i < n; i++) {
      const p = anchor.pos.clone().add(
        new THREE.Vector3(
          range(rng, -0.72, 0.72),
          range(rng, -0.52, 0.55),
          range(rng, -0.72, 0.72),
        ),
      );
      if (p.y < spec.minBlossomY) continue;
      if (spec.keepOutX !== undefined && p.x < spec.keepOutX) continue;
      if (
        spec.lowerRightPrune &&
        p.x > spec.lowerRightPrune.x &&
        p.y < spec.lowerRightPrune.y
      ) {
        continue;
      }
      const quat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI),
      );
      const scale = range(rng, 0.92, 1.95) * spec.cardScale;
      cards.push({ pos: p, quat, scale });
    }
  }

  if (cards.length > 0) {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.InstancedMesh(geo, blossomMat, cards.length);
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      m.compose(c.pos, c.quat, new THREE.Vector3(c.scale, c.scale, c.scale));
      mesh.setMatrixAt(i, m);
      const warm = rng();
      color.setHSL(
        0.715 + range(rng, -0.04, 0.05),
        0.22 + rng() * 0.18,
        0.78 + warm * 0.2,
      );
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  // a little dark green foliage so the blossoms are not a floating cloud
  const leafTex = makeLeafTexture();
  const leafMat = new THREE.MeshStandardMaterial({
    color: '#55705a',
    map: leafTex,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });
  const leafPositions: { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number }[] = [];
  for (let i = 0; i < Math.floor(cards.length * 0.04); i++) {
    const a = anchors[Math.floor(rng() * anchors.length)];
    if (!a) break;
    const pos = a.pos.clone().add(
      new THREE.Vector3(range(rng, -0.5, 0.5), range(rng, -0.4, 0.25), range(rng, -0.5, 0.5)),
    );
    if (pos.y < spec.minBlossomY) continue;
    if (spec.keepOutX !== undefined && pos.x < spec.keepOutX) continue;
    leafPositions.push({
      pos,
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(rng() * 3, rng() * 6, rng() * 3)),
      scale: range(rng, 0.4, 0.8),
    });
  }
  if (leafPositions.length > 0) {
    const leafMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), leafMat, leafPositions.length);
    const m = new THREE.Matrix4();
    for (let i = 0; i < leafPositions.length; i++) {
      const l = leafPositions[i];
      m.compose(l.pos, l.quat, new THREE.Vector3(l.scale, l.scale, l.scale));
      leafMesh.setMatrixAt(i, m);
    }
    leafMesh.instanceMatrix.needsUpdate = true;
    leafMesh.frustumCulled = false;
    group.add(leafMesh);
  }

  return { group, blossomMat, leafMat, cardCount: cards.length };
}
