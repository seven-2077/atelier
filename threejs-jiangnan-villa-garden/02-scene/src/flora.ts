import * as THREE from 'three';
import { LAYOUT as L } from './config';
import type { Mats } from './materials';
import * as T from './textures';

const UP = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Object3D();
const col = new THREE.Color();

function mulberry(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function limb(
  group: THREE.Group,
  a: THREE.Vector3,
  b: THREE.Vector3,
  r0: number,
  r1: number,
  mat: THREE.Material,
  seg = 6,
): void {
  const delta = new THREE.Vector3().subVectors(b, a);
  const len = delta.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(delta, 0.5);
  m.quaternion.setFromUnitVectors(UP, delta.normalize());
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
}

function curveLimb(
  group: THREE.Group,
  pts: THREE.Vector3[],
  r0: number,
  r1: number,
  mat: THREE.Material,
  seg = 6,
): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const t0 = i / (pts.length - 1);
    const t1 = (i + 1) / (pts.length - 1);
    limb(group, pts[i], pts[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1, mat, seg);
  }
}

interface BarkMats {
  bark: THREE.MeshStandardMaterial;
  barkPale: THREE.MeshStandardMaterial;
  culm: THREE.MeshStandardMaterial;
  node: THREE.MeshStandardMaterial;
  leafGreen: THREE.MeshStandardMaterial;
}

function barkMaterials(): BarkMats {
  return {
    bark: new THREE.MeshStandardMaterial({ color: 0x4b3b2d, roughness: 0.94 }),
    barkPale: new THREE.MeshStandardMaterial({ color: 0x7d6c55, roughness: 0.92 }),
    culm: new THREE.MeshStandardMaterial({ color: 0x6a7c4b, roughness: 0.76 }),
    node: new THREE.MeshStandardMaterial({ color: 0x52633c, roughness: 0.82 }),
    leafGreen: new THREE.MeshStandardMaterial({
      color: 0x6a8554,
      roughness: 0.82,
      side: THREE.DoubleSide,
    }),
  };
}

export function buildFlora(scene: THREE.Scene, mats: Mats): void {
  const bm = barkMaterials();
  buildPine(scene, mats, bm);
  buildCrabapple(scene, mats, bm);
  buildBamboo(scene, mats, bm);
  buildBanana(scene, bm);
  buildLotus(scene, mats);
  buildGrass(scene, mats, bm);
  buildPetals(scene);
}

function buildPine(scene: THREE.Scene, mats: Mats, bm: BarkMats): void {
  const rnd = mulberry(2207);
  const g = new THREE.Group();
  scene.add(g);

  const base = new THREE.Vector3(7.55, L.plateau.capTop, -4.28);
  const trunkPts = [
    base.clone(),
    base.clone().add(new THREE.Vector3(-0.08, 1.0, 0.1)),
    base.clone().add(new THREE.Vector3(-0.34, 2.1, 0.2)),
    base.clone().add(new THREE.Vector3(-0.72, 3.2, 0.12)),
    base.clone().add(new THREE.Vector3(-1.18, 4.3, -0.02)),
    base.clone().add(new THREE.Vector3(-1.62, 5.25, -0.12)),
  ];
  curveLimb(g, trunkPts, 0.3, 0.12, bm.bark, 7);

  const branchTips: THREE.Vector3[] = [];
  const branches: { start: THREE.Vector3; dir: THREE.Vector3; len: number }[] = [
    { start: trunkPts[2].clone(), dir: new THREE.Vector3(-1.0, 0.34, 0.3), len: 1.5 },
    { start: trunkPts[3].clone(), dir: new THREE.Vector3(-0.85, 0.42, -0.55), len: 1.75 },
    { start: trunkPts[4].clone(), dir: new THREE.Vector3(-0.62, 0.5, 0.72), len: 1.9 },
    { start: trunkPts[4].clone(), dir: new THREE.Vector3(0.55, 0.36, -0.7), len: 1.6 },
    { start: trunkPts[5].clone(), dir: new THREE.Vector3(0.8, 0.28, 0.4), len: 1.5 },
    { start: trunkPts[5].clone(), dir: new THREE.Vector3(-0.45, 0.55, -0.5), len: 1.35 },
  ];

  for (const br of branches) {
    const d = br.dir.clone().normalize();
    const mid = br.start.clone().addScaledVector(d, br.len * 0.55).add(new THREE.Vector3(0, -0.12, 0));
    const end = br.start.clone().addScaledVector(d, br.len);
    end.y += 0.1;
    curveLimb(g, [br.start.clone(), mid, end.clone()], 0.075, 0.028, bm.bark, 5);
    branchTips.push(end.clone());
    // secondary twigs
    for (let i = 0; i < 4; i++) {
      const f = 0.35 + rnd() * 0.6;
      const origin = br.start.clone().addScaledVector(d, br.len * f);
      const side = new THREE.Vector3(rnd() - 0.5, 0.16 + rnd() * 0.2, rnd() - 0.5).normalize();
      const tip = origin.clone().addScaledVector(side, 0.45 + rnd() * 0.55);
      limb(g, origin, tip, 0.026, 0.012, bm.bark, 4);
      branchTips.push(tip);
    }
  }

  // Foliage pads
  const padGeo = new THREE.PlaneGeometry(1, 1);
  const padMat = mats.pine.clone();
  const tips: THREE.Vector3[] = [];
  for (const bt of branchTips) {
    tips.push(bt.clone());
    for (let i = 0; i < 4; i++) {
      tips.push(
        bt
          .clone()
          .add(new THREE.Vector3((rnd() - 0.5) * 0.66, (rnd() - 0.35) * 0.4, (rnd() - 0.5) * 0.66)),
      );
    }
  }
  const count = tips.length * 4;
  const pads = new THREE.InstancedMesh(padGeo, padMat, count);
  pads.castShadow = false;
  pads.receiveShadow = true;
  let idx = 0;

  const e = new THREE.Euler();
  e.order = 'YXZ';
  for (const p of tips) {
    for (let k = 0; k < 4; k++) {
      const s = 0.34 + rnd() * 0.34;
      tmp.position.set(p.x + (rnd() - 0.5) * 0.1, p.y + (rnd() - 0.5) * 0.09, p.z + (rnd() - 0.5) * 0.1);
      e.set(-Math.PI / 2 + (rnd() - 0.5) * 0.7, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.6, 'YXZ');
      tmp.quaternion.setFromEuler(e);
      tmp.scale.set(s * 1.7, s * 0.95, 1);
      tmp.updateMatrix();
      pads.setMatrixAt(idx, tmp.matrix);
      const r = rnd();
      if (r > 0.86) col.setRGB(1.0, 0.96, 0.72);
      else if (r < 0.26) col.setRGB(0.52, 0.64, 0.58);
      else col.setRGB(0.7 + rnd() * 0.16, 0.82 + rnd() * 0.14, 0.7 + rnd() * 0.12);
      pads.setColorAt(idx, col);
      idx++;
    }
  }
  pads.count = idx;
  pads.instanceColor!.needsUpdate = true;
  g.add(pads);

  // Small needle tufts give the pads a clustered, weighty silhouette.
  const tuftGeo = new THREE.ConeGeometry(1, 1, 7);
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x2a4535, roughness: 0.94 });
  const tufts = new THREE.InstancedMesh(tuftGeo, tuftMat, tips.length);
  tufts.castShadow = true;
  tufts.receiveShadow = true;
  let ti = 0;
  for (const p of tips) {
    if (rnd() > 0.65) continue;
    const r = 0.16 + rnd() * 0.14;
    tmp.position.set(p.x + (rnd() - 0.5) * 0.16, p.y + (rnd() - 0.5) * 0.08, p.z + (rnd() - 0.5) * 0.16);
    tmp.rotation.set((rnd() - 0.5) * 0.9, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.9);
    tmp.scale.set(r, 0.3 + rnd() * 0.3, r);
    tmp.updateMatrix();
    tufts.setMatrixAt(ti, tmp.matrix);
    const v = 0.8 + rnd() * 0.3;
    col.setRGB(v * 0.82, v, v * 0.76);
    tufts.setColorAt(ti, col);
    ti++;
  }
  tufts.count = ti;
  tufts.instanceColor!.needsUpdate = true;
  g.add(tufts);
}

function buildCrabapple(scene: THREE.Scene, mats: Mats, bm: BarkMats): void {
  const rnd = mulberry(9013);
  const g = new THREE.Group();
  scene.add(g);

  const base = new THREE.Vector3(6.15, 0, 3.05);
  const trunkPts = [
    base.clone(),
    base.clone().add(new THREE.Vector3(-0.1, 0.55, -0.14)),
    base.clone().add(new THREE.Vector3(-0.28, 1.15, -0.3)),
    base.clone().add(new THREE.Vector3(-0.5, 1.8, -0.36)),
  ];
  curveLimb(g, trunkPts, 0.16, 0.06, bm.barkPale, 7);

  const tips: THREE.Vector3[] = [];
  const mains = 4;
  for (let i = 0; i < mains; i++) {
    const ang = (i / mains) * Math.PI * 2 + 0.5;
    const start = trunkPts[2].clone().add(new THREE.Vector3(0, 0.1 * i, 0));
    const dir = new THREE.Vector3(Math.cos(ang) * 0.85, 0.55 + rnd() * 0.35, Math.sin(ang) * 0.7 - 0.25);
    const end = start.clone().addScaledVector(dir.normalize(), 1.0 + rnd() * 0.45);
    const mid = start.clone().add(new THREE.Vector3(dir.x * 0.4, 0.5, dir.z * 0.3));
    curveLimb(g, [start, mid, end], 0.05, 0.018, bm.barkPale, 5);

    for (let j = 0; j < 5; j++) {
      const f = 0.45 + rnd() * 0.6;
      const origin = start.clone().addScaledVector(dir, (end.distanceTo(start)) * f);
      const d2 = new THREE.Vector3(
        Math.cos(ang + (rnd() - 0.5) * 2.2),
        0.25 + rnd() * 0.5,
        Math.sin(ang + (rnd() - 0.5) * 2.2),
      ).normalize();
      const tip = origin.clone().addScaledVector(d2, 0.5 + rnd() * 0.6);
      limb(g, origin, tip, 0.014, 0.006, bm.barkPale, 4);
      tips.push(tip.clone());
      for (let k = 0; k < 4; k++) {
        tips.push(
          tip
            .clone()
            .add(new THREE.Vector3((rnd() - 0.5) * 0.55, (rnd() - 0.3) * 0.4, (rnd() - 0.5) * 0.55)),
        );
      }
    }
  }

  // Blossom cards
  const blossomGeo = new THREE.PlaneGeometry(1, 1);
  const blossomMat = mats.blossom.clone();
  const count = tips.length * 3;
  const blossoms = new THREE.InstancedMesh(blossomGeo, blossomMat, count);
  blossoms.castShadow = false;
  blossoms.receiveShadow = true;
  let idx = 0;
  const e = new THREE.Euler();
  e.order = 'YXZ';
  for (const p of tips) {
    for (let k = 0; k < 3; k++) {
      const s = 0.14 + rnd() * 0.16;
      tmp.position.set(p.x + (rnd() - 0.5) * 0.24, p.y + (rnd() - 0.5) * 0.22, p.z + (rnd() - 0.5) * 0.24);
      e.set((rnd() - 0.5) * 1.4, rnd() * Math.PI * 2, (rnd() - 0.5) * 1.4, 'YXZ');
      tmp.quaternion.setFromEuler(e);
      tmp.scale.set(s, s, 1);
      tmp.updateMatrix();
      blossoms.setMatrixAt(idx, tmp.matrix);
      const w = rnd();
      if (w > 0.42) {
        col.setRGB(1, 0.82 + rnd() * 0.12, 0.78 + rnd() * 0.12);
        if (w > 0.8) col.setRGB(0.86, 0.76, 0.83);
      } else {
        col.setRGB(0.9, 0.74, 0.73);
      }
      blossoms.setColorAt(idx, col);
      idx++;
    }
  }
  blossoms.count = idx;
  blossoms.instanceColor!.needsUpdate = true;
  g.add(blossoms);

  // Sparse spring leaves as small geometry ovals
  const leafGeo = new THREE.CircleGeometry(0.07, 7);
  leafGeo.scale(1, 1.5, 1);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x647f4c, roughness: 0.85, side: THREE.DoubleSide });
  const leafCount = tips.length * 2;
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leaves.castShadow = false;
  let li = 0;
  for (const p of tips) {
    for (let k = 0; k < 2; k++) {
      tmp.position.set(p.x + (rnd() - 0.5) * 0.3, p.y + (rnd() - 0.5) * 0.25, p.z + (rnd() - 0.5) * 0.3);
      e.set((rnd() - 0.5) * 2.2, rnd() * Math.PI * 2, (rnd() - 0.5) * 2.2, 'YXZ');
      tmp.quaternion.setFromEuler(e);
      tmp.scale.set(0.7 + rnd() * 0.5, 0.7 + rnd() * 0.5, 1);
      tmp.updateMatrix();
      leaves.setMatrixAt(li++, tmp.matrix);
    }
  }
  leaves.count = li;
  g.add(leaves);
}

function buildBamboo(scene: THREE.Scene, mats: Mats, bm: BarkMats): void {
  const rnd = mulberry(4411);
  const g = new THREE.Group();
  scene.add(g);

  const clusters: [number, number, number][] = [
    [-4.62, 1.1, 0],
    [-5.15, 2.2, 0.4],
    [-4.2, 3.0, -0.3],
  ];
  const leafTips: THREE.Vector3[] = [];
  const culmGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
  const culms = new THREE.InstancedMesh(culmGeo, bm.culm, 13);
  culms.castShadow = true;
  let ci = 0;
  for (const [cxp, czp, lean] of clusters) {
    for (let i = 0; i < 5; i++) {
      const h = 2.6 + rnd() * 1.9;
      const r = 0.03 + rnd() * 0.016;
      const ox = cxp + (rnd() - 0.5) * 0.55;
      const oz = czp + (rnd() - 0.5) * 0.55;
      tmp.position.set(ox, h / 2, oz);
      tmp.rotation.set((rnd() - 0.5) * 0.06 + lean * 0.02, 0, (rnd() - 0.5) * 0.11 + 0.03);
      tmp.scale.set(r, h, r);
      tmp.updateMatrix();
      culms.setMatrixAt(ci++, tmp.matrix);

      const top = new THREE.Vector3(ox + (rnd() - 0.5) * 0.3, h, oz + (rnd() - 0.5) * 0.3);
      for (let k = 0; k < 9; k++) {
        leafTips.push(
          top.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.0, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 1.0)),
        );
      }
      // node rings
      for (let ny = 0.4; ny < h - 0.2; ny += 0.42 + rnd() * 0.12) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.006, 0.012, 5, 10), bm.node);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(ox + Math.sin(tmp.rotation.z) * -ny, ny, oz);
        g.add(ring);
      }
    }
  }
  culms.count = ci;
  g.add(culms);

  const leafGeo = new THREE.PlaneGeometry(0.5, 0.2);
  const leaves = new THREE.InstancedMesh(leafGeo, mats.bambooLeaf, leafTips.length);
  leaves.castShadow = false;
  leaves.receiveShadow = true;
  let li = 0;
  for (const p of leafTips) {
    tmp.position.copy(p);
    tmp.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    const s = 0.7 + rnd() * 0.8;
    tmp.scale.set(s, s, 1);
    tmp.updateMatrix();
    leaves.setMatrixAt(li++, tmp.matrix);
  }
  leaves.count = li;
  g.add(leaves);
}

function bananaLeaf(length: number, width: number, droop: number): THREE.BufferGeometry {
  const segU = 40;
  const segV = 12;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segU; i++) {
    const u = i / segU;
    const w = Math.sin(Math.pow(u, 0.58) * Math.PI) * width * (1 - u * 0.28) + 0.018;
    const ripple = Math.sin(u * Math.PI) * 0.026;
    const fold = (v: number): number => Math.pow(Math.abs(v), 1.35) * w * 0.26;
    for (let j = 0; j <= segV; j++) {
      const v = j / segV - 0.5;
      const x = v * 2 * w + Math.sin(v * Math.PI * 2 + u * 2.4) * 0.016 * u;
      const y = u * length;
      const z = -droop * u * u + fold(v) + ripple;
      pos.push(x, y, z);
      uv.push(v + 0.5, u);
    }
  }
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * (segV + 1) + j;
      const b = a + segV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function buildBanana(scene: THREE.Scene, bm: BarkMats): void {
  const rnd = mulberry(7331);
  const g = new THREE.Group();
  scene.add(g);

  const roots: [number, number][] = [
    [-3.02, 3.18],
    [-3.16, 3.66],
    [-2.96, 2.6],
  ];

  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x6f8f5f,
    map: T.leafVeinTexture(),
    roughness: 0.52,
    metalness: 0,
    sheen: 0.55,
    sheenColor: 0xa9c79a,
    sheenRoughness: 0.58,
    side: THREE.DoubleSide,
  });
  const leafMatDeep = new THREE.MeshPhysicalMaterial({
    color: 0x4d6b47,
    map: T.leafVeinTexture(),
    roughness: 0.6,
    metalness: 0,
    sheen: 0.35,
    sheenColor: 0x8ea983,
    sheenRoughness: 0.62,
    side: THREE.DoubleSide,
  });

  for (const [x, z] of roots) {
    const stemH = 2.72 + rnd() * 0.55;
    limb(g, new THREE.Vector3(x, 0, z), new THREE.Vector3(x, stemH, z), 0.1, 0.068, bm.culm, 8);
    for (let i = 0; i < 11; i++) {
      const ang = (i / 11) * Math.PI * 2 + rnd() * 0.5;
      const tilt = 0.42 + rnd() * 0.62;
      const len = 1.55 + rnd() * 0.9;
      const leaf = new THREE.Mesh(
        bananaLeaf(len, 0.23 + rnd() * 0.13, 0.62 + rnd() * 0.5),
        i % 3 === 0 ? leafMatDeep : leafMat,
      );
      leaf.position.set(x, stemH - 0.06 + rnd() * 0.16, z);
      leaf.rotation.set(tilt, ang, 0);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      g.add(leaf);
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, len * 0.9, 4), bm.node);
      leaf.add(rib);
      rib.position.set(0, len * 0.45, 0.004);
      rib.rotation.x = 0;
    }
  }
}

function buildLotus(scene: THREE.Scene, mats: Mats): void {
  const rnd = mulberry(5151);
  const g = new THREE.Group();
  scene.add(g);

  const spots: [number, number, number][] = [
    [1.95, 4.02, 0.36],
    [2.3, 4.18, 0.29],
    [1.62, 3.82, 0.23],
    [-0.2, 2.4, 0.25],
    [0.35, 3.62, 0.2],
    [2.44, 3.6, 0.19],
    [0.95, 4.24, 0.21],
    [-1.1, 3.0, 0.23],
    [-1.55, 3.9, 0.18],
    [-0.62, 1.42, 0.2],
    [1.28, 2.2, 0.17],
    [0.2, 2.95, 0.16],
  ];

  const shape = new THREE.Shape();
  const start = -Math.PI / 2 + 0.18;
  const end = -Math.PI / 2 - 0.18 + Math.PI * 2;
  shape.moveTo(0, 0);
  shape.absarc(0, 0, 1, start, end, false);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape, 22);
  geo.rotateX(-Math.PI / 2);

  const padMat = mats.lotus.clone();
  const pads = new THREE.InstancedMesh(geo, padMat, spots.length);
  pads.receiveShadow = true;
  spots.forEach(([x, z, r], i) => {
    tmp.position.set(x, L.pond.waterY + 0.015, z);
    tmp.rotation.set(0, rnd() * Math.PI * 2, 0);
    tmp.scale.set(r, 1, r);
    tmp.updateMatrix();
    pads.setMatrixAt(i, tmp.matrix);
    const v = 0.72 + rnd() * 0.26;
    col.setRGB(v * 0.9, v, v * 0.74);
    pads.setColorAt(i, col);
  });
  pads.instanceColor!.needsUpdate = true;
  g.add(pads);
}

function buildGrass(scene: THREE.Scene, mats: Mats, bm: BarkMats): void {
  const rnd = mulberry(1187);
  const g = new THREE.Group();
  scene.add(g);
  const blade = new THREE.PlaneGeometry(0.055, 0.55);
  blade.translate(0, 0.275, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x7c8c5d,
    roughness: 0.9,
    side: THREE.DoubleSide,
    alphaMap: mats.bambooLeaf.alphaMap,
    alphaTest: 0.4,
  });
  const tufts: [number, number][] = [
    [-3.21, 0.55],
    [-3.18, 4.36],
    [-4.3, 0.5],
    [2.95, 3.1],
    [-2.95, 2.05],
    [2.72, 4.3],
    [-4.55, 4.55],
    [8.55, 0.4],
    [3.9, 2.6],
    [4.86, 4.46],
    [6.32, 4.38],
    [7.58, 3.92],
    [5.52, 2.18],
    [3.02, 4.52],
    [-3.48, 3.72],
    [0.72, 0.62],
    [8.3, 4.42],
    [8.56, 3.1],
    [7.92, 2.12],
    [7.08, 4.66],
  ];
  const blades: { p: THREE.Vector3; r: number; s: number }[] = [];
  for (const [x, z] of tufts) {
    const n = 6 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      blades.push({
        p: new THREE.Vector3(x + (rnd() - 0.5) * 0.35, 0, z + (rnd() - 0.5) * 0.35),
        r: rnd() * Math.PI,
        s: 0.8 + rnd() * 0.75,
      });
    }
  }
  const mesh = new THREE.InstancedMesh(blade, mat, blades.length);
  mesh.castShadow = false;
  for (let i = 0; i < blades.length; i++) {
    const b = blades[i];
    tmp.position.copy(b.p);
    tmp.rotation.set((rnd() - 0.5) * 0.28, b.r, (rnd() - 0.5) * 0.24);
    tmp.scale.set(1, b.s, 1);
    tmp.updateMatrix();
    mesh.setMatrixAt(i, tmp.matrix);
  }
  g.add(mesh);
  void bm;
}

function buildPetals(scene: THREE.Scene): void {
  const rnd = mulberry(8081);
  const g = new THREE.Group();
  scene.add(g);
  const geo = new THREE.CircleGeometry(0.055, 7);
  geo.scale(1, 1.4, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xeec8c0,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const n = 34;
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  for (let i = 0; i < n; i++) {
    const nearTree = i < 24;
    const x = nearTree ? 4.9 + rnd() * 1.9 : -2.0 + rnd() * 4.6;
    const z = nearTree ? 2.8 + rnd() * 1.6 : 1.4 + rnd() * 3.5;
    const inPond = x > -2.15 && x < 2.72 && z > 0.95 && z < 4.48;
    tmp.position.set(x, inPond ? -0.222 : 0.085, z);
    tmp.rotation.set(0, rnd() * Math.PI * 2, 0);
    tmp.scale.setScalar(0.7 + rnd() * 0.7);
    tmp.updateMatrix();
    mesh.setMatrixAt(i, tmp.matrix);
  }
  g.add(mesh);
}
