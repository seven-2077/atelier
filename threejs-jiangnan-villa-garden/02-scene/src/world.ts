import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LAYOUT as L, PALETTE } from './config';
import type { Mats } from './materials';
import * as T from './textures';

const tmp = new THREE.Object3D();
const col = new THREE.Color();

function box(
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  yBottom: number,
  z: number,
  ry = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, yBottom + h / 2, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function instanced(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  count: number,
): THREE.InstancedMesh {
  const im = new THREE.InstancedMesh(geo, mat, count);
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

function shade(im: THREE.InstancedMesh, i: number, base: number, spread: number): void {
  const v = base + (Math.random() - 0.5) * spread;
  const warm = 1 + (Math.random() - 0.5) * 0.08;
  col.setRGB(v * warm, v * 0.985, v * 0.93);
  im.setColorAt(i, col);
}

export function buildWorld(scene: THREE.Scene, mats: Mats): { waterNormal: THREE.Texture } {
  const root = new THREE.Group();
  scene.add(root);

  buildTable(root, mats);
  buildBase(root, mats);
  buildGround(root, mats);
  buildRetainingWall(root, mats);
  buildPlatform(root, mats);
  buildStairs(root, mats);
  buildVilla(root, mats);
  buildPond(root, mats);
  buildBridge(root, mats);
  buildWhiteWall(root, mats);
  buildStoneLanding(root, mats);
  buildTaihu(root, mats);
  buildLowlandDressing(root, mats);

  return { waterNormal: mats.water.normalMap as THREE.Texture };
}

function buildTable(root: THREE.Group, mats: Mats): void {
  const table = new THREE.Mesh(new THREE.PlaneGeometry(130, 105), mats.table);
  table.rotation.x = -Math.PI / 2;
  table.position.set(2, -L.base.thickness - 0.16, 0);
  table.receiveShadow = true;
  root.add(table);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), mats.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(1.5, -L.base.thickness - 0.1, 0.4);
  root.add(shadow);
}

function buildBase(root: THREE.Group, mats: Mats): void {
  const w = L.base.x1 - L.base.x0;
  const d = L.base.z1 - L.base.z0;
  const cx = (L.base.x0 + L.base.x1) / 2;
  const cz = (L.base.z0 + L.base.z1) / 2;
  const core = new THREE.Mesh(new THREE.BoxGeometry(w, L.base.thickness, d), mats.strata);
  core.position.set(cx, -L.base.thickness / 2, cz);
  core.castShadow = true;
  core.receiveShadow = true;
  root.add(core);

  const lip = new THREE.Mesh(new RoundedBoxGeometry(w + 0.22, 0.16, d + 0.22, 3, 0.04), mats.stone);
  lip.position.set(cx, -0.02, cz);
  lip.castShadow = true;
  lip.receiveShadow = true;
  root.add(lip);

  const wood = new THREE.Mesh(
    new RoundedBoxGeometry(w + 0.34, 0.12, d + 0.34, 3, 0.03),
    mats.woodDeep,
  );
  wood.position.set(cx, -L.base.thickness + 0.045, cz);
  wood.castShadow = true;
  root.add(wood);
}

/** Ground slab around the pond, built as four strips so the water is never covered. */
function buildGround(root: THREE.Group, mats: Mats): void {
  const p = L.pond;
  const strips: [number, number, number, number][] = [
    [L.base.x1 - L.base.x0, p.z0 - L.base.z0 + 0.02, (L.base.x0 + L.base.x1) / 2, (L.base.z0 + p.z0) / 2],
    [L.base.x1 - L.base.x0, L.base.z1 - p.z1 + 0.02, (L.base.x0 + L.base.x1) / 2, (p.z1 + L.base.z1) / 2],
    [p.x0 - L.base.x0 + 0.02, p.z1 - p.z0, (L.base.x0 + p.x0) / 2 - 0.01, (p.z0 + p.z1) / 2],
    [L.base.x1 - p.x1 + 0.02, p.z1 - p.z0, (p.x1 + L.base.x1) / 2 + 0.01, (p.z0 + p.z1) / 2],
  ];
  for (const [w, d, cx, cz] of strips) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mats.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(cx, 0, cz);
    ground.receiveShadow = true;
    root.add(ground);
  }

  const inner = new THREE.Mesh(new THREE.PlaneGeometry(L.pond.x1 - L.pond.x0, L.pond.z1 - L.pond.z0), mats.stoneDark);
  inner.rotation.x = -Math.PI / 2;
  inner.position.set((L.pond.x0 + L.pond.x1) / 2, L.pond.bedY, (L.pond.z0 + L.pond.z1) / 2);
  root.add(inner);

  const wh = 1.06;
  const walls: [number, number, number, number, number, number][] = [
    [(L.pond.x1 - L.pond.x0) / 2, wh, 0.1, (L.pond.x0 + L.pond.x1) / 2, L.pond.bedY, L.pond.z0 + 0.05],
    [(L.pond.x1 - L.pond.x0) / 2, wh, 0.1, (L.pond.x0 + L.pond.x1) / 2, L.pond.bedY, L.pond.z1 - 0.05],
    [0.1, wh, (L.pond.z1 - L.pond.z0) / 2, L.pond.x0 + 0.05, L.pond.bedY, (L.pond.z0 + L.pond.z1) / 2],
    [0.1, wh, (L.pond.z1 - L.pond.z0) / 2, L.pond.x1 - 0.05, L.pond.bedY, (L.pond.z0 + L.pond.z1) / 2],
  ];
  for (const [w, h, d, x, y, z] of walls) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.stoneDark);
    m.position.set(x, y + h / 2, z);
    m.receiveShadow = true;
    root.add(m);
  }

  // Pond coping stones
  const cg = new RoundedBoxGeometry(1, 1, 1, 2, 0.03);
  const specs: [number, number, number, number, number][] = [];
  const step = 0.53;
  for (let x = L.pond.x0 + 0.25; x < L.pond.x1 - 0.1; x += step) {
    specs.push([x, L.pond.z0 - 0.02, 0.52, 0.3, 0], [x, L.pond.z1 + 0.02, 0.52, 0.3, 0]);
  }
  for (let z = L.pond.z0 + 0.35; z < L.pond.z1 - 0.2; z += step) {
    specs.push([L.pond.x0 - 0.02, z, 0.28, 0.5, Math.PI / 2], [L.pond.x1 + 0.02, z, 0.28, 0.5, Math.PI / 2]);
  }
  const coping = instanced(cg, mats.stone.clone(), specs.length);
  (coping.material as THREE.MeshStandardMaterial).color.set(0xffffff);
  specs.forEach(([x, z, sx, sz, ry], i) => {
    tmp.position.set(x, 0.07, z);
    tmp.rotation.set(0, ry, 0);
    tmp.scale.set(sx, 0.14, sz);
    tmp.updateMatrix();
    coping.setMatrixAt(i, tmp.matrix);
    shade(coping, i, 0.97, 0.16);
  });
  coping.instanceColor!.needsUpdate = true;
  root.add(coping);

  // Walkway paving
  const walkSlabs: [number, number, number, number][] = [];
  for (let x = -4.6; x < 2.9; x += 0.92) {
    walkSlabs.push([x + 0.42, 4.78, 0.83, 0.5 + Math.random() * 0.06]);
  }
  const wg = new RoundedBoxGeometry(1, 1, 1, 2, 0.025);
  const walk = instanced(wg, mats.paving.clone(), walkSlabs.length);
  (walk.material as THREE.MeshStandardMaterial).color.set(0xffffff);
  walkSlabs.forEach(([x, z, sx, sz], i) => {
    tmp.position.set(x, 0.035, z);
    tmp.rotation.set(0, (Math.random() - 0.5) * 0.03, 0);
    tmp.scale.set(sx, 0.07, sz);
    tmp.updateMatrix();
    walk.setMatrixAt(i, tmp.matrix);
    shade(walk, i, 0.82, 0.16);
  });
  walk.instanceColor!.needsUpdate = true;
  root.add(walk);

}

function buildRetainingWall(root: THREE.Group, mats: Mats): void {
  const front = L.plateau.z1;
  const blockGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.04);
  const specs: { x: number; y: number; w: number; h: number; d: number }[] = [];

  for (let y = 0.02; y < L.plateau.top - 0.05; y += 0.265) {
    const courseH = Math.min(0.255, L.plateau.top - y);
    let x = L.plateau.x0 + 0.02;
    let offset = Math.random() * 0.3;
    while (x < L.plateau.x1 - 0.1) {
      const w = 0.42 + Math.random() * 0.36;
      if (!(x + w > L.stairs.x0 - 0.04 && x < L.stairs.x1 + 0.04)) {
        specs.push({ x: x + w / 2, y: y + courseH / 2, w: w - 0.02, h: courseH - 0.014, d: 0.24 });
      }
      x += w + 0.022;
      offset += 0.01;
    }
    if (offset > 1) break;
  }

  const wall = instanced(blockGeo, mats.stone.clone(), specs.length);
  (wall.material as THREE.MeshStandardMaterial).color.set(0xffffff);
  specs.forEach((s, i) => {
    tmp.position.set(s.x, s.y, front - 0.11 - Math.random() * 0.02);
    tmp.rotation.set(0, (Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.014);
    tmp.scale.set(s.w, s.h, s.d);
    tmp.updateMatrix();
    wall.setMatrixAt(i, tmp.matrix);
    shade(wall, i, 0.8, 0.2);
  });
  wall.instanceColor!.needsUpdate = true;
  root.add(wall);

  // Dark core behind the facing stones
  const core = box(
    mats.stoneDark,
    L.plateau.x1 - L.plateau.x0,
    L.plateau.top,
    L.plateau.z1 - L.plateau.z0,
    (L.plateau.x0 + L.plateau.x1) / 2,
    0,
    (L.plateau.z0 + L.plateau.z1) / 2 - 0.12,
  );
  root.add(core);

  // Coping along the front
  const capSpecs: [number, number, number][] = [];
  for (let x = L.plateau.x0 + 0.35; x < L.plateau.x1; x += 1.18) {
    capSpecs.push([x, Math.min(0.98, L.plateau.x1 - x + 0.05), 0]);
  }
  const cap = instanced(new RoundedBoxGeometry(1, 1, 1, 2, 0.03), mats.stone.clone(), capSpecs.length);
  (cap.material as THREE.MeshStandardMaterial).color.set(0xffffff);
  capSpecs.forEach(([x, w], i) => {
    tmp.position.set(x, L.plateau.top + 0.075, front - 0.28);
    tmp.rotation.set(0, 0, 0);
    tmp.scale.set(w, 0.15, 0.68);
    tmp.updateMatrix();
    cap.setMatrixAt(i, tmp.matrix);
    shade(cap, i, 0.76, 0.14);
  });
  cap.instanceColor!.needsUpdate = true;
  root.add(cap);

  const capL = box(mats.stone, 0.5, 0.16, L.plateau.z1 - L.plateau.z0 + 0.2, L.plateau.x0 + 0.05, L.plateau.top - 0.02, (L.plateau.z0 + L.plateau.z1) / 2);
  capL.receiveShadow = true;
  root.add(capL);
}

function buildPlatform(root: THREE.Group, mats: Mats): void {
  const p = L.plateau;
  const deck = box(
    mats.paving,
    p.x1 - p.x0,
    0.16,
    p.z1 - p.z0,
    (p.x0 + p.x1) / 2,
    p.top - 0.02,
    (p.z0 + p.z1) / 2,
  );
  deck.receiveShadow = true;
  root.add(deck);

  const slabGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.02);
  const slabs: [number, number, number, number][] = [];
  for (let x = p.x0 + 0.55; x < p.x1; x += 1.08) {
    for (let z = p.z1 - 0.5; z > p.z0 + 0.3; z -= 0.74) {
      if (x > L.villa.x0 + 0.1 && x < L.villa.x1 - 0.1 && z > L.villa.z0 + 0.1 && z < L.villa.z1 - 0.1) continue;
      if (x > L.terrace.x0 && z > L.terrace.z0 && z < L.terrace.z1) continue;
      slabs.push([x, z, 1.0, 0.68]);
    }
  }
  const deckSlabs = instanced(slabGeo, mats.paving.clone(), slabs.length);
  (deckSlabs.material as THREE.MeshStandardMaterial).color.set(0xffffff);
  slabs.forEach(([x, z, sx, sz], i) => {
    tmp.position.set(x, p.capTop + 0.02, z);
    tmp.rotation.set(0, (Math.random() - 0.5) * 0.02, 0);
    tmp.scale.set(sx, 0.06, sz);
    tmp.updateMatrix();
    deckSlabs.setMatrixAt(i, tmp.matrix);
    shade(deckSlabs, i, 0.78, 0.16);
  });
  deckSlabs.instanceColor!.needsUpdate = true;
  root.add(deckSlabs);
}

function buildStairs(root: THREE.Group, mats: Mats): void {
  const s = L.stairs;
  const n = s.steps;
  const rise = L.plateau.capTop / n;
  const run = (s.zBottom - s.zTop) / n;
  const steps = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const h = L.plateau.capTop - i * rise;
    const z = s.zTop + run * (i + 0.5);
    const m = box(
      mats.stone,
      s.x1 - s.x0,
      h,
      run + 0.08,
      (s.x0 + s.x1) / 2,
      0,
      z,
    );
    steps.add(m);
    const nosing = box(mats.stone, s.x1 - s.x0 + 0.04, 0.045, 0.1, (s.x0 + s.x1) / 2, h - 0.02, z + run / 2 + 0.02);
    steps.add(nosing);
  }
  // Side cheeks following the flight
  const cheekGeo = new THREE.BoxGeometry(1, 1, 1);
  const cheek = new THREE.Mesh(cheekGeo, mats.stone);
  const len = Math.hypot(s.zBottom - s.zTop, L.plateau.capTop);
  cheek.scale.set(0.2, 0.28, len + 0.3);
  cheek.position.set(s.x0 - 0.08, L.plateau.capTop / 2 + 0.1, (s.zTop + s.zBottom) / 2);
  cheek.rotation.x = Math.atan2(L.plateau.capTop, s.zBottom - s.zTop);
  cheek.castShadow = true;
  cheek.receiveShadow = true;
  steps.add(cheek);
  const cheek2 = cheek.clone();
  cheek2.position.x = s.x1 + 0.08;
  steps.add(cheek2);
  root.add(steps);
}

function buildVilla(root: THREE.Group, mats: Mats): void {
  const v = L.villa;
  const g = new THREE.Group();
  g.position.x = -0.9;
  root.add(g);

  const baseY = v.base;
  const bodyTop = baseY + v.floorH * v.floors;
  const depthFront = 0.32;

  const body = box(
    mats.plaster,
    v.x1 - v.x0 - 0.3,
    bodyTop - baseY,
    v.z1 - v.z0 - depthFront,
    (v.x0 + v.x1 - 0.3) / 2,
    baseY,
    (v.z0 + v.z1 - depthFront) / 2,
  );
  g.add(body);

  const plinth = box(mats.stone, v.x1 - v.x0 + 0.02, 0.2, v.z1 - v.z0 + 0.02, (v.x0 + v.x1) / 2, baseY, (v.z0 + v.z1) / 2);
  g.add(plinth);

  // Front facade slab with a real recessed doorway and window holes
  const shape = new THREE.Shape();
  shape.moveTo(v.x0, baseY);
  shape.lineTo(v.x1, baseY);
  shape.lineTo(v.x1, bodyTop);
  shape.lineTo(v.x0, bodyTop);
  shape.closePath();

  const doorW = 1.08;
  const doorH = 1.98;
  const doorX = 2.9;
  const holeRect = (cx: number, cy: number, w: number, h: number): THREE.Path => {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, cy - h / 2);
    p.lineTo(cx + w / 2, cy - h / 2);
    p.lineTo(cx + w / 2, cy + h / 2);
    p.lineTo(cx - w / 2, cy + h / 2);
    p.closePath();
    return p;
  };
  shape.holes.push(holeRect(doorX, baseY + doorH / 2 + 0.02, doorW, doorH));

  const winW = 0.74;
  const winH = 1.14;
  const f1y = baseY + 1.44;
  const f2y = baseY + v.floorH + 1.2;
  const winXs1 = [4.2, 5.36];
  const winXs2 = [2.98, 4.2, 5.44];
  for (const x of winXs1) shape.holes.push(holeRect(x, f1y, winW, winH));
  for (const x of winXs2) shape.holes.push(holeRect(x, f2y, winW, winH));

  const facadeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: depthFront,
    bevelEnabled: false,
    curveSegments: 20,
  });
  const facade = new THREE.Mesh(facadeGeo, mats.plaster);
  facade.position.z = v.z1 - depthFront;
  facade.castShadow = true;
  facade.receiveShadow = true;
  g.add(facade);

  // Side facade (x = v.x1) with two windows per floor
  const sideShape = new THREE.Shape();
  sideShape.moveTo(v.z0, baseY);
  sideShape.lineTo(v.z1, baseY);
  sideShape.lineTo(v.z1, bodyTop);
  sideShape.lineTo(v.z0, bodyTop);
  sideShape.closePath();
  const sideW = 0.74;
  const sideH = 1.1;
  for (const z of [-4.02, -3.0]) {
    sideShape.holes.push(holeRect(z, f1y, sideW, sideH));
    sideShape.holes.push(holeRect(z, f2y, sideW, sideH));
  }
  const sideGeo = new THREE.ExtrudeGeometry(sideShape, {
    depth: 0.28,
    bevelEnabled: false,
    curveSegments: 20,
  });
  sideGeo.rotateY(-Math.PI / 2);
  const side = new THREE.Mesh(sideGeo, mats.plaster);
  side.position.x = v.x1;
  side.castShadow = true;
  side.receiveShadow = true;
  g.add(side);

  // Windows: glass, frames, lattice
  const frontGlassZ = v.z1 - 0.055;
  winXs1.forEach((x, i) => {
    addWindow(g, mats, x, f1y, frontGlassZ, winW, winH, i === 0 ? 1 : 0);
  });
  winXs2.forEach((x, i) => {
    addWindow(g, mats, x, f2y, frontGlassZ, winW, winH, i === 1 ? 1 : 0);
  });

  const sideGlassX = v.x1 - 0.06;
  for (const z of [-4.02, -3.0]) {
    addSideWindow(g, mats, sideGlassX, z, f1y, winW, sideH, z === -4.02 ? 1 : 0);
    addSideWindow(g, mats, sideGlassX, z, f2y, winW, sideH, z === -3.0 ? 1 : 0);
  }

  // Door leaves, threshold, frame
  const doorZ = v.z1 - depthFront - 0.03;
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.08, doorH - 0.06, 0.055), mats.door);
  leaf.position.set(doorX, baseY + doorH / 2 + 0.01, doorZ);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  g.add(leaf);
  for (const s of [-1, 1]) {
    const stile = box(mats.woodDeep, 0.035, doorH - 0.08, 0.012, doorX + s * (doorW / 2 - 0.13), baseY + 0.015, doorZ + 0.032);
    g.add(stile);
  }
  for (let i = 0; i < 4; i++) {
    const panel = box(mats.woodDeep, doorW - 0.3, 0.28, 0.012, doorX, baseY + 0.35 + i * 0.44, doorZ + 0.032);
    g.add(panel);
  }
  const grill = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 10, 22), mats.metal);
  grill.position.set(doorX + 0.22, baseY + 1.0, doorZ + 0.06);
  g.add(grill);
  const threshold = box(mats.stone, doorW + 0.26, 0.09, 0.24, doorX, L.plateau.capTop - 0.005, v.z1 + 0.02);
  g.add(threshold);

  const doorFrameL = box(mats.woodDeep, 0.075, doorH + 0.1, 0.1, doorX - doorW / 2 - 0.02, baseY + 0.03, v.z1 - 0.015);
  const doorFrameR = box(mats.woodDeep, 0.075, doorH + 0.1, 0.1, doorX + doorW / 2 + 0.02, baseY + 0.03, v.z1 - 0.015);
  const doorFrameT = box(mats.woodDeep, doorW + 0.2, 0.08, 0.12, doorX, baseY + doorH + 0.02, v.z1 - 0.015);
  g.add(doorFrameL, doorFrameR, doorFrameT);

  // Plaque above the door
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.4, 0.05), mats.plaque);
  plaque.position.set(doorX, baseY + doorH + 0.3, v.z1 + 0.02);
  g.add(plaque);
  const plaqueFrame = box(mats.woodDeep, 1.46, 0.46, 0.03, doorX, baseY + doorH + 0.04, v.z1 + 0.002);
  g.add(plaqueFrame);

  // Floor band and cornice
  const band = box(mats.woodDeep, v.x1 - v.x0 + 0.06, 0.07, v.z1 - v.z0 + 0.06, (v.x0 + v.x1) / 2, baseY + v.floorH - 0.04, (v.z0 + v.z1) / 2);
  g.add(band);
  const cornice = box(mats.plasterSoft, v.x1 - v.x0 + 0.34, 0.16, v.z1 - v.z0 + 0.34, (v.x0 + v.x1) / 2, bodyTop - 0.16, (v.z0 + v.z1) / 2);
  g.add(cornice);
  const fascia = box(mats.woodDeep, v.x1 - v.x0 + 0.3, 0.08, v.z1 - v.z0 + 0.3, (v.x0 + v.x1) / 2, bodyTop - 0.3, (v.z0 + v.z1) / 2);
  g.add(fascia);

  // Corner pilasters
  const pil = 0.14;
  for (const [x, z] of [
    [v.x0 + pil / 2, v.z1 - pil / 2],
    [v.x1 - pil / 2, v.z1 - pil / 2],
    [v.x0 + pil / 2, v.z0 + pil / 2],
    [v.x1 - pil / 2, v.z0 + pil / 2],
  ] as const) {
    const m = box(mats.plasterSoft, pil, bodyTop - baseY, pil, x, baseY, z);
    g.add(m);
  }

  buildRoof(g, mats);
  buildTerrace(g, mats);
  buildVillaLanterns(g, mats);
}

function windowGlassMat(mats: Mats, warm: number): THREE.Material {
  if (!warm) return mats.glassCool;
  const m = mats.glassWarm.clone();
  m.emissiveIntensity = 1.1 + Math.random() * 0.5;
  m.userData.glowRole = 'window';
  return m;
}

function addWindow(
  g: THREE.Group,
  mats: Mats,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  warm: number,
): void {
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), windowGlassMat(mats, warm));
  glass.position.set(x, y, z);
  g.add(glass);

  const bar = 0.026;
  const frame = new THREE.Group();
  const top = box(mats.woodDeep, w + 0.1, 0.06, 0.06, x, y + h / 2, z + 0.06);
  const bottom = box(mats.woodDeep, w + 0.12, 0.075, 0.1, x, y - h / 2 - 0.02, z + 0.06);
  const left = box(mats.woodDeep, 0.06, h + 0.04, 0.06, x - w / 2, y - h / 2, z + 0.06);
  const right = box(mats.woodDeep, 0.06, h + 0.04, 0.06, x + w / 2, y - h / 2, z + 0.06);
  frame.add(top, bottom, left, right);
  for (let i = 1; i <= 2; i++) {
    frame.add(box(mats.wood, bar, h - 0.02, 0.04, x - w / 2 + (w * i) / 3, y - h / 2, z + 0.05));
  }
  for (let i = 1; i <= 3; i++) {
    frame.add(box(mats.wood, w - 0.02, bar, 0.04, x, y - h / 2 + (h * i) / 4, z + 0.05));
  }
  g.add(frame);
}

function addSideWindow(
  g: THREE.Group,
  mats: Mats,
  x: number,
  z: number,
  y: number,
  w: number,
  h: number,
  warm: number,
): void {
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), windowGlassMat(mats, warm));
  glass.rotation.y = Math.PI / 2;
  glass.position.set(x, y, z);
  g.add(glass);

  const bar = 0.026;
  const f = new THREE.Group();
  const top = box(mats.woodDeep, 0.06, 0.06, w + 0.1, x + 0.06, y + h / 2, z);
  const bottom = box(mats.woodDeep, 0.1, 0.075, w + 0.12, x + 0.06, y - h / 2 - 0.02, z);
  const front = box(mats.woodDeep, 0.06, h + 0.04, 0.06, x + 0.06, y - h / 2, z - w / 2);
  const back = box(mats.woodDeep, 0.06, h + 0.04, 0.06, x + 0.06, y - h / 2, z + w / 2);
  f.add(top, bottom, front, back);
  for (let i = 1; i <= 2; i++) {
    f.add(box(mats.wood, 0.04, h - 0.02, bar, x + 0.05, y - h / 2, z - w / 2 + (w * i) / 3));
  }
  for (let i = 1; i <= 3; i++) {
    f.add(box(mats.wood, 0.04, bar, w - 0.02, x + 0.05, y - h / 2 + (h * i) / 4, z));
  }
  g.add(f);
}

function buildRoof(g: THREE.Group, mats: Mats): void {
  const v = L.villa;
  const eaveY = v.base + v.floorH * v.floors;
  const ridgeZ = (v.z0 + v.z1) / 2;
  const eaveOut = 0.76;
  const xOut = 0.5;
  const ridgeY = eaveY + 1.18;
  const roof = new THREE.Group();
  g.add(roof);

  const halfDepth = (v.z1 - v.z0) / 2 + eaveOut;
  const slope = Math.hypot(halfDepth, ridgeY - eaveY - 0.02);
  const tileR = 0.052;

  const tileGeo = new THREE.CylinderGeometry(tileR, tileR, slope + 0.12, 7, 1, true, 0, Math.PI);
  const stripMat = mats.tile.clone();
  (stripMat as THREE.MeshStandardMaterial).color.set(0xffffff);

  const count = (Math.floor((v.x1 - v.x0 + xOut * 2) / 0.133) + 3) * 2;
  const tiles = instanced(tileGeo, stripMat, count);
  let idx = 0;

  const rise = ridgeY - eaveY;
  const upFront = new THREE.Vector3(0, halfDepth, rise).normalize();
  const dirFront = new THREE.Vector3(0, -rise, halfDepth).normalize();
  const upBack = new THREE.Vector3(0, -halfDepth, rise).normalize();
  const dirBack = new THREE.Vector3(0, -rise, -halfDepth).normalize();
  const qFront = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(upFront, dirFront, new THREE.Vector3().crossVectors(upFront, dirFront)),
  );
  const qBack = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(upBack, dirBack, new THREE.Vector3().crossVectors(upBack, dirBack)),
  );

  const sides = [
    { dir: dirFront, q: qFront },
    { dir: dirBack, q: qBack },
  ];

  for (let x = v.x0 - xOut + 0.07; x < v.x1 + xOut - 0.03; x += 0.133) {
    for (const side of sides) {
      const run = slope / 2 + 0.02;
      tmp.position.set(x, ridgeY + side.dir.y * run, ridgeZ + side.dir.z * run);
      tmp.quaternion.copy(side.q);
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      tiles.setMatrixAt(idx, tmp.matrix);
      shade(tiles, idx, 0.82 - Math.random() * 0.14, 0.1);
      idx++;
    }
  }
  tiles.count = idx;
  tiles.instanceColor!.needsUpdate = true;
  roof.add(tiles);

  // Roof slabs underneath
  const slabGeo = new THREE.BoxGeometry(v.x1 - v.x0 + xOut * 2, 0.07, slope + 0.04);
  for (const dir of [1, -1] as const) {
    const slab = new THREE.Mesh(slabGeo, mats.tileUnder);
    slab.position.set(
      (v.x0 + v.x1) / 2,
      (ridgeY + eaveY) / 2 - 0.03,
      ridgeZ + dir * halfDepth / 2,
    );
    slab.rotation.x = dir * Math.atan2(ridgeY - eaveY, halfDepth);
    slab.castShadow = true;
    slab.receiveShadow = true;
    roof.add(slab);
  }

  // Ridge roll and ornaments
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, v.x1 - v.x0 + xOut * 2 + 0.1, 12), mats.ridge);
  ridge.rotation.z = Math.PI / 2;
  ridge.position.set((v.x0 + v.x1) / 2, ridgeY + 0.04, ridgeZ);
  ridge.castShadow = true;
  roof.add(ridge);

  for (const side of [-1, 1]) {
    const tip = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.3, 0.34, 2, 0.04), mats.ridge);
    tip.position.set((side === -1 ? v.x0 - xOut : v.x1 + xOut), ridgeY + 0.19, ridgeZ);
    tip.rotation.z = side === -1 ? 0.16 : -0.16;
    roof.add(tip);
  }

  // Eave fascia and tile-end caps
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(v.x1 - v.x0 + xOut * 2, 0.12, 0.1), mats.woodDeep);
  fascia.position.set((v.x0 + v.x1) / 2, eaveY - 0.06, v.z1 + eaveOut);
  roof.add(fascia);
  const fascia2 = fascia.clone();
  fascia2.position.z = v.z0 - eaveOut;
  roof.add(fascia2);

  const capGeo = new THREE.CylinderGeometry(tileR + 0.005, tileR + 0.005, 0.026, 8, 1);
  const capCount = (Math.floor((v.x1 - v.x0 + xOut * 2) / 0.133) + 3) * 2;
  const caps = instanced(capGeo, mats.tile, capCount);
  let ci = 0;
  const up = new THREE.Vector3(0, 1, 0);
  for (let x = v.x0 - xOut + 0.07; x < v.x1 + xOut - 0.03; x += 0.133) {
    for (const dir of [dirFront, dirBack]) {
      tmp.position.set(x, eaveY + 0.01, ridgeZ + Math.sign(dir.z) * halfDepth);
      tmp.quaternion.setFromUnitVectors(up, dir);
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      caps.setMatrixAt(ci++, tmp.matrix);
    }
  }
  caps.count = ci;
  roof.add(caps);

  // Gable walls at the ends
  // Gable walls at the ends
  for (const side of [-1, 1] as const) {
    const tri = new THREE.Shape();
    tri.moveTo(v.z0, eaveY - 0.02);
    tri.lineTo(v.z1, eaveY - 0.02);
    tri.lineTo(ridgeZ, ridgeY - 0.03);
    tri.closePath();
    const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    triGeo.rotateY(-Math.PI / 2);
    const gable = new THREE.Mesh(triGeo, mats.plaster);
    gable.position.x = side === -1 ? v.x0 - 0.1 : v.x1;
    gable.castShadow = true;
    gable.receiveShadow = true;
    roof.add(gable);
  }
}

function buildTerrace(g: THREE.Group, mats: Mats): void {
  const t = L.terrace;
  const deck = box(mats.paving, t.x1 - t.x0, 0.16, t.z1 - t.z0, (t.x0 + t.x1) / 2, t.y - 0.1, (t.z0 + t.z1) / 2);
  g.add(deck);

  const rail = new THREE.Group();
  g.add(rail);
  const railY = t.y + 0.0;
  const balusterGeo = makeBaluster();
  const balMat = mats.woodDeep;

  const edges: { x0: number; z0: number; x1: number; z1: number }[] = [
    { x0: t.x1, z0: t.z0, x1: t.x1, z1: t.z1 },
    { x0: t.x0 + 0.2, z0: t.z1, x1: t.x1, z1: t.z1 },
  ];

  for (const e of edges) {
    const len = Math.hypot(e.x1 - e.x0, e.z1 - e.z0);
    const count = Math.max(3, Math.round(len / 0.31));
    const dirX = (e.x1 - e.x0) / len;
    const dirZ = (e.z1 - e.z0) / len;
    const ang = Math.atan2(-dirZ, dirX);
    const railTop = box(mats.woodDeep, len + 0.1, 0.075, 0.1, (e.x0 + e.x1) / 2, railY + 0.95, (e.z0 + e.z1) / 2, ang);
    rail.add(railTop);
    const railBot = box(mats.woodDeep, len + 0.06, 0.06, 0.08, (e.x0 + e.x1) / 2, railY + 0.16, (e.z0 + e.z1) / 2, ang);
    rail.add(railBot);
    for (let i = 0; i <= count; i++) {
      const f = i / count;
      const x = e.x0 + dirX * len * f;
      const z = e.z0 + dirZ * len * f;
      const b = new THREE.Mesh(balusterGeo, balMat);
      b.position.set(x, railY + 0.2, z);
      b.castShadow = true;
      rail.add(b);
    }
    for (const [x, z] of [
      [e.x0, e.z0],
      [e.x1, e.z1],
    ] as const) {
      const p = box(mats.woodDeep, 0.13, 1.18, 0.13, x, railY, z);
      rail.add(p);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mats.woodDeep);
      cap.position.set(x, railY + 1.23, z);
      rail.add(cap);
    }
  }

  // Small tea table on the terrace
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20), mats.wood);
  tableTop.position.set(7.36, t.y + 0.62, -2.55);
  tableTop.castShadow = true;
  g.add(tableTop);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.6, 12), mats.woodDeep);
  stem.position.set(7.36, t.y + 0.32, -2.55);
  g.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 16), mats.woodDeep);
  foot.position.set(7.36, t.y + 0.02, -2.55);
  g.add(foot);
}

function makeBaluster(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0.036, 0));
  pts.push(new THREE.Vector2(0.05, 0.05));
  pts.push(new THREE.Vector2(0.036, 0.16));
  pts.push(new THREE.Vector2(0.028, 0.3));
  pts.push(new THREE.Vector2(0.045, 0.4));
  pts.push(new THREE.Vector2(0.03, 0.52));
  pts.push(new THREE.Vector2(0.042, 0.62));
  pts.push(new THREE.Vector2(0.03, 0.7));
  return new THREE.LatheGeometry(pts, 10);
}

function buildPond(root: THREE.Group, mats: Mats): void {
  const p = L.pond;
  const cx = (p.x0 + p.x1) / 2;
  const cz = (p.z0 + p.z1) / 2;
  const pw = p.x1 - p.x0;
  const pd = p.z1 - p.z0;

  const water = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.04, pd - 0.04), mats.water);
  water.rotation.x = -Math.PI / 2;
  water.position.set(cx, p.waterY, cz);
  water.receiveShadow = true;
  root.add(water);

  const depthTint = new THREE.Mesh(
    new THREE.PlaneGeometry(pw - 0.06, pd - 0.06),
    new THREE.MeshBasicMaterial({
      color: 0x0a2422,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    }),
  );
  depthTint.rotation.x = -Math.PI / 2;
  depthTint.position.set(cx, p.waterY + 0.004, cz);
  root.add(depthTint);

  const skyRefl = new THREE.Mesh(
    new THREE.PlaneGeometry(pw - 0.1, pd - 0.1),
    new THREE.MeshBasicMaterial({
      map: T.waterSkyTexture(),
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: true,
    }),
  );
  skyRefl.rotation.x = -Math.PI / 2;
  skyRefl.position.set(cx, p.waterY + 0.008, cz);
  root.add(skyRefl);

  const reflTex = T.reflectionTexture();
  const reflMat = new THREE.MeshBasicMaterial({
    map: reflTex,
    color: 0xffb87c,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const streaks: [number, number, number, number, number][] = [
    [-1.32, 3.22, 0.44, 2.0, 0.46],
    [-0.92, 1.42, 0.36, 1.5, 0.38],
  ];
  for (const [x, z, w, l, rot] of streaks) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), reflMat);
    m.rotation.set(-Math.PI / 2, 0, rot);
    m.position.set(x, p.waterY + 0.013, z);
    root.add(m);
  }

  // Irregular wet stones tucked just inside the coping.
  const wetGeo = new THREE.SphereGeometry(1, 7, 5);
  wetGeo.scale(1, 0.34, 0.82);
  const wetMat = mats.stone.clone();
  (wetMat as THREE.MeshStandardMaterial).color.set(0x7f8b7a);
  (wetMat as THREE.MeshStandardMaterial).roughness = 0.62;
  const wetSpots: [number, number, number, number][] = [];
  const rnd = seeded(4703);
  for (let x = p.x0 + 0.16; x < p.x1 - 0.1; x += 0.4) {
    wetSpots.push([x, p.z0 + 0.05 + rnd() * 0.06, 0.065 + rnd() * 0.075, rnd() * Math.PI]);
    wetSpots.push([x, p.z1 - 0.05 - rnd() * 0.06, 0.065 + rnd() * 0.075, rnd() * Math.PI]);
  }
  for (let z = p.z0 + 0.32; z < p.z1 - 0.16; z += 0.42) {
    wetSpots.push([p.x0 + 0.05 + rnd() * 0.06, z, 0.065 + rnd() * 0.075, rnd() * Math.PI]);
    wetSpots.push([p.x1 - 0.05 - rnd() * 0.06, z, 0.065 + rnd() * 0.075, rnd() * Math.PI]);
  }
  const wet = new THREE.InstancedMesh(wetGeo, wetMat, wetSpots.length);
  wet.castShadow = false;
  wet.receiveShadow = true;
  wetSpots.forEach(([x, z, s, ry], i) => {
    tmp.position.set(x, p.waterY + 0.006, z);
    tmp.rotation.set(0, ry, (rnd() - 0.5) * 0.12);
    tmp.scale.set(s, s * 0.55, s * 0.8);
    tmp.updateMatrix();
    wet.setMatrixAt(i, tmp.matrix);
    const v = 0.78 + rnd() * 0.34;
    col.setRGB(v * 0.8, v * 0.9, v * 0.82);
    wet.setColorAt(i, col);
  });
  wet.instanceColor!.needsUpdate = true;
  root.add(wet);
}

function buildBridge(root: THREE.Group, mats: Mats): void {
  const a = new THREE.Vector2(0.52, 4.36);
  const b = new THREE.Vector2(2.96, 1.86);
  const dir = new THREE.Vector2(b.x - a.x, b.y - a.y);
  const len = dir.length();
  const ang = Math.atan2(dir.x, dir.y);
  const g = new THREE.Group();
  root.add(g);

  const stoneMat = mats.stone.clone();
  (stoneMat as THREE.MeshStandardMaterial).color.set(0xb7bdb5);
  (stoneMat as THREE.MeshStandardMaterial).roughness = 0.86;
  const treadMat = mats.stone.clone();
  (treadMat as THREE.MeshStandardMaterial).color.set(0xaab0a8);
  (treadMat as THREE.MeshStandardMaterial).roughness = 0.66;
  const underMat = mats.stone.clone();
  (underMat as THREE.MeshStandardMaterial).color.set(0x5b5f58);

  const n = 7;
  const seg = (len - 0.16) / n;
  const archY = (f: number): number => 0.18 + Math.sin(f * Math.PI) * 0.34;
  const deckW = 0.98;
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const x = a.x + dir.x * f;
    const z = a.y + dir.y * f;
    const y = archY(f);
    const slab = box(stoneMat, deckW, 0.2, seg + 0.025, x, y, z, ang);
    slab.receiveShadow = true;
    g.add(slab);
    const wear = box(treadMat, deckW - 0.14, 0.026, seg - 0.04, x, y + 0.19, z, ang);
    wear.receiveShadow = true;
    g.add(wear);
    const under = box(underMat, deckW - 0.24, 0.14, seg - 0.01, x, y - 0.14, z, ang);
    under.receiveShadow = true;
    g.add(under);
  }

  const parapetShape = (y0: number, y1: number, N: number): THREE.Shape => {
    const sh = new THREE.Shape();
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      const x = f * len;
      const y = archY(f) + y0;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    }
    for (let i = N; i >= 0; i--) {
      const f = i / N;
      sh.lineTo(f * len, archY(f) + y1);
    }
    sh.closePath();
    return sh;
  };

  for (const side of [-1, 1] as const) {
    const perp = new THREE.Vector2(Math.cos(ang), -Math.sin(ang));
    const off = side * (deckW / 2 - 0.04);
    const panel = new THREE.Mesh(
      new THREE.ExtrudeGeometry(parapetShape(0.18, 0.48, 36), { depth: 0.12, bevelEnabled: false }),
      stoneMat,
    );
    panel.rotation.y = ang - Math.PI / 2;
    panel.position.set(a.x + perp.x * (off + 0.06), 0, a.y + perp.y * (off + 0.06));
    panel.castShadow = true;
    panel.receiveShadow = true;
    g.add(panel);

    const coping = new THREE.Mesh(
      new THREE.ExtrudeGeometry(parapetShape(0.48, 0.535, 36), { depth: 0.17, bevelEnabled: false }),
      treadMat,
    );
    coping.rotation.y = ang - Math.PI / 2;
    coping.position.set(a.x + perp.x * (off + 0.085), 0, a.y + perp.y * (off + 0.085));
    coping.castShadow = true;
    coping.receiveShadow = true;
    g.add(coping);

    for (const f of [0.008, 0.992]) {
      const x = a.x + dir.x * f + perp.x * off;
      const z = a.y + dir.y * f + perp.y * off;
      const post = box(stoneMat, 0.22, 0.63, 0.22, x, 0.13, z, ang);
      g.add(post);
      const cap = box(treadMat, 0.26, 0.06, 0.26, x, 0.76, z, ang);
      g.add(cap);
    }
  }

  for (const f of [0.28, 0.72]) {
    const x = a.x + dir.x * f;
    const z = a.y + dir.y * f;
    const pierH = archY(f) - 0.08 - L.pond.bedY;
    const pier = box(stoneMat, 0.52, pierH, 0.52, x, L.pond.bedY, z, ang);
    g.add(pier);
    const pierCap = box(treadMat, 0.62, 0.08, 0.62, x, archY(f) - 0.1, z, ang);
    g.add(pierCap);
  }

  const shadowMat = mats.shadow.clone();
  shadowMat.opacity = 0.34;
  const bridgeShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.24, len * 0.9), shadowMat);
  bridgeShadow.rotation.set(-Math.PI / 2, 0, ang);
  bridgeShadow.position.set((a.x + b.x) / 2, L.pond.waterY + 0.016, (a.y + b.y) / 2);
  root.add(bridgeShadow);

  // Landing steps at both banks so the bridge meets the ground, not the water.
  const endA = box(stoneMat, 1.34, 0.1, 0.6, 0.42, 0.0, 4.62);
  const endA2 = box(treadMat, 1.16, 0.09, 0.52, 0.44, 0.1, 4.6);
  const endB = box(stoneMat, 1.34, 0.1, 0.62, 2.94, 0.0, 1.64);
  const endB2 = box(treadMat, 1.14, 0.09, 0.54, 2.93, 0.1, 1.66);
  root.add(endA, endA2, endB, endB2);
}

function buildWhiteWall(root: THREE.Group, mats: Mats): void {
  const w = L.wall;
  const gate = L.gate;
  const shape = new THREE.Shape();
  shape.moveTo(w.z0, 0);
  shape.lineTo(w.z1, 0);
  shape.lineTo(w.z1, w.height);
  shape.lineTo(w.z0, w.height);
  shape.closePath();

  const gateHole = new THREE.Path();
  gateHole.absarc(gate.z, 1.18, gate.r, 0, Math.PI * 2, true);
  shape.holes.push(gateHole);

  const win = L.window;
  const wp = new THREE.Path();
  wp.moveTo(win.z - win.w / 2, win.y - win.h / 2);
  wp.lineTo(win.z + win.w / 2, win.y - win.h / 2);
  wp.lineTo(win.z + win.w / 2, win.y + win.h / 2);
  wp.lineTo(win.z - win.w / 2, win.y + win.h / 2);
  wp.closePath();
  shape.holes.push(wp);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: w.thickness, bevelEnabled: false, curveSegments: 28 });
  geo.rotateY(-Math.PI / 2);
  const wall = new THREE.Mesh(geo, mats.plaster);
  wall.position.x = w.x + w.thickness;
  wall.castShadow = true;
  wall.receiveShadow = true;
  root.add(wall);

  // Gate ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(gate.r + 0.02, 0.045, 10, 44), mats.stone);
  ring.rotation.y = Math.PI / 2;
  ring.position.set(w.x + w.thickness + 0.01, 1.18, gate.z);
  ring.castShadow = true;
  root.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(gate.r + 0.02, 0.045, 10, 44), mats.stone);
  ring2.rotation.y = Math.PI / 2;
  ring2.position.set(w.x + 0.005, 1.18, gate.z);
  root.add(ring2);

  // Gate threshold
  const sill = box(mats.stone, 0.62, 0.12, gate.r * 1.4, w.x + 0.14, 0, gate.z);
  root.add(sill);

  // Lattice window frame and a dim interior
  const wf = new THREE.Group();
  const frameThick = 0.08;
  const fz = win.z;
  wf.add(box(mats.stone, 0.12, win.h + 0.16, frameThick, w.x + w.thickness + 0.02, win.y - win.h / 2 - 0.08, fz - win.w / 2));
  wf.add(box(mats.stone, 0.12, win.h + 0.16, frameThick, w.x + w.thickness + 0.02, win.y - win.h / 2 - 0.08, fz + win.w / 2));
  wf.add(box(mats.stone, 0.12, frameThick, win.w, w.x + w.thickness + 0.02, win.y + win.h / 2 + 0.05, fz));
  wf.add(box(mats.stone, 0.12, frameThick, win.w, w.x + w.thickness + 0.02, win.y - win.h / 2 - 0.08, fz));
  for (let i = 1; i < 4; i++) {
    wf.add(box(mats.woodDeep, 0.05, win.h, 0.035, w.x + w.thickness - 0.03, win.y - win.h / 2, fz - win.w / 2 + (win.w * i) / 4));
  }
  for (let i = 1; i < 4; i++) {
    wf.add(box(mats.woodDeep, 0.05, 0.035, win.w, w.x + w.thickness - 0.03, win.y - win.h / 2 + (win.h * i) / 4, fz));
  }
  root.add(wf);

  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xd9c6a3,
    emissive: 0xffb272,
    emissiveIntensity: 0.45,
    roughness: 0.94,
  });
  innerMat.userData.glowRole = 'window';
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(win.w, win.h), innerMat);
  inner.rotation.y = Math.PI / 2;
  inner.position.set(w.x + 0.1, win.y, fz);
  root.add(inner);
  const winSill = box(mats.stone, 0.2, 0.09, win.w + 0.24, w.x + w.thickness + 0.03, win.y - win.h / 2 - 0.1, fz);
  root.add(winSill);

  // Wall cap
  const cap = box(mats.stone, w.thickness + 0.14, 0.13, w.z1 - w.z0 + 0.1, w.x + w.thickness / 2, w.height, (w.z0 + w.z1) / 2);
  root.add(cap);

  // Wall-foot lanterns
  for (const lz of [3.06, 0.3]) {
    const arm = box(mats.woodDeep, 0.32, 0.055, 0.055, w.x + w.thickness + 0.1, 1.86, lz);
    root.add(arm);
    const bracket = box(mats.metal, 0.04, 0.2, 0.04, w.x + w.thickness + 0.02, 1.8, lz);
    root.add(bracket);
    const lamp = makeLantern(mats, 0.5);
    lamp.position.set(w.x + w.thickness + 0.2, 1.5, lz);
    root.add(lamp);
  }
}

function buildStoneLanding(root: THREE.Group, mats: Mats): void {
  const patioCenter = new THREE.Vector2(5.3, 3.3);
  const patioMat = mats.gravel.clone();
  (patioMat as THREE.MeshStandardMaterial).color.set(0xf3e9d6);
  (patioMat as THREE.MeshStandardMaterial).roughness = 0.96;
  const patio = new THREE.Mesh(new THREE.CircleGeometry(1.95, 44), patioMat);
  patio.rotation.x = -Math.PI / 2;
  patio.scale.set(1.15, 1, 0.9);
  patio.position.set(patioCenter.x, 0.012, patioCenter.y);
  patio.receiveShadow = true;
  root.add(patio);

  const edgeGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.025);
  const edgeMat = mats.stone.clone();
  (edgeMat as THREE.MeshStandardMaterial).color.set(0xc7c2b0);
  const edgeN = 34;
  const edge = instanced(edgeGeo, edgeMat, edgeN);
  const ernd = seeded(9331);
  for (let i = 0; i < edgeN; i++) {
    const a = (i / edgeN) * Math.PI * 2;
    const rx = 1.95 * 1.15;
    const rz = 1.95 * 0.9;
    tmp.position.set(
      patioCenter.x + Math.cos(a) * rx,
      0.045,
      patioCenter.y + Math.sin(a) * rz,
    );
    tmp.rotation.set(0, -a, (ernd() - 0.5) * 0.1);
    tmp.scale.set(0.34 + ernd() * 0.14, 0.1, 0.24 + ernd() * 0.1);
    tmp.updateMatrix();
    edge.setMatrixAt(i, tmp.matrix);
    shade(edge, i, 0.9, 0.12);
  }
  edge.instanceColor!.needsUpdate = true;
  root.add(edge);

  const table = new THREE.Group();
  root.add(table);
  const tx = 4.45;
  const tz = 4.0;
  const topMat = mats.stone.clone();
  (topMat as THREE.MeshStandardMaterial).color.set(0xefe6cf);
  (topMat as THREE.MeshStandardMaterial).roughness = 0.7;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.12, 28), topMat);
  top.position.set(tx, 0.66, tz);
  top.castShadow = true;
  top.receiveShadow = true;
  table.add(top);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.6, 14), mats.stoneDark);
  ped.position.set(tx, 0.31, tz);
  table.add(ped);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.1, 20), topMat);
  base.position.set(tx, 0.05, tz);
  base.castShadow = true;
  table.add(base);

  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 9), mats.stoneDark);
  pot.scale.set(1, 0.72, 1);
  pot.position.set(tx - 0.1, 0.77, tz + 0.04);
  pot.castShadow = true;
  table.add(pot);
  for (const [dx, dz] of [
    [0.24, 0.11],
    [0.13, -0.25],
  ] as const) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.075, 10), mats.stone);
    cup.position.set(tx + dx, 0.75, tz + dz);
    cup.castShadow = true;
    table.add(cup);
  }

  for (const [x, z, r] of [
    [tx - 0.78, tz + 0.28, 0.22],
    [tx + 0.58, tz + 0.5, 0.2],
    [tx + 0.24, tz - 0.7, 0.21],
  ] as const) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.03, 0.42, 18), topMat);
    st.position.set(x, 0.21, z);
    st.castShadow = true;
    st.receiveShadow = true;
    table.add(st);
  }

  // A small stone lantern anchors the pool-side corner.
  const lanternG = new THREE.Group();
  lanternG.position.set(6.45, 0, 2.6);
  const foot = box(mats.stone, 0.4, 0.14, 0.4, 0, 0, 0);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.7, 8), mats.stone);
  shaft.position.y = 0.45;
  shaft.castShadow = true;
  const boxHead = box(mats.stone, 0.34, 0.24, 0.34, 0, 0.86, 0);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 4), mats.stoneDark);
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 1.19;
  cap.castShadow = true;
  lanternG.add(foot, shaft, boxHead, cap);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.14),
    new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.85, toneMapped: false }),
  );
  glow.position.set(0, 0.98, 0.18);
  lanternG.add(glow);
  const light = new THREE.PointLight(0xffb063, 2.4, 5.4, 2);
  light.position.set(0, 1.0, 0.18);
  lanternG.add(light);
  table.add(lanternG);
}

function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTaihu(root: THREE.Group, mats: Mats): void {
  const defs: [number, number, number, number][] = [
    [3.06, 4.18, 1.06, 0.5],
    [-1.82, 0.82, 0.9, 1.1],
    [-1.98, 3.82, 0.84, -0.55],
    [3.28, 1.3, 0.72, 0.3],
    [-2.32, 3.6, 0.66, 1.35],
    [1.02, 4.58, 0.58, -0.9],
  ];

  defs.forEach(([x, z, s, rot], di) => {
    const rnd = seeded(6101 + di * 97);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;

    const cols = 3;
    for (let c = 0; c < cols; c++) {
      const h = (0.95 + rnd() * 0.85) * s;
      const baseR = (0.19 + rnd() * 0.13) * s;
      const pts: THREE.Vector2[] = [];
      const n = 11;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const bulge = 0.72 + 0.4 * Math.sin(t * Math.PI * 2.1 + c * 1.7) + 0.12 * rnd();
        const radius = Math.max(0.025, baseR * bulge * (1 - t * 0.76));
        pts.push(new THREE.Vector2(radius, t * h));
      }
      const geo = new THREE.LatheGeometry(pts, 12);
      const pos = geo.attributes.position;
      for (let vi = 0; vi < pos.count; vi++) {
        const px = pos.getX(vi);
        const py = pos.getY(vi);
        const pz = pos.getZ(vi);
        const j = 1 + 0.16 * Math.sin(py * 7.3 + vi * 1.9 + c) + 0.08 * Math.sin(py * 17.1 + vi);
        pos.setXYZ(vi, px * j, py, pz * (j + 0.06 * Math.sin(vi * 2.3)));
      }
      geo.computeVertexNormals();
      const mat = mats.stone.clone();
      (mat as THREE.MeshStandardMaterial).color.set(c === 0 ? 0xb9c0b8 : 0xabb3ac);
      const m = new THREE.Mesh(geo, mat);
      m.position.set((rnd() - 0.5) * 0.5 * s, 0, (rnd() - 0.5) * 0.5 * s);
      m.rotation.set((rnd() - 0.5) * 0.08, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.18);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }

    for (let b = 0; b < 3; b++) {
      const bg = new THREE.IcosahedronGeometry(1, 1);
      const bp = bg.attributes.position;
      for (let vi = 0; vi < bp.count; vi++) {
        const j = 1 + 0.2 * Math.sin(vi * 2.7 + b);
        bp.setXYZ(vi, bp.getX(vi) * j, bp.getY(vi) * j, bp.getZ(vi) * j);
      }
      bg.computeVertexNormals();
      const bm = mats.stone.clone();
      (bm as THREE.MeshStandardMaterial).color.set(0xaab2a9);
      const rock = new THREE.Mesh(bg, bm);
      rock.scale.set((0.24 + rnd() * 0.16) * s, (0.16 + rnd() * 0.1) * s, (0.22 + rnd() * 0.14) * s);
      rock.position.set((rnd() - 0.5) * 0.8 * s, 0.08, (rnd() - 0.5) * 0.8 * s);
      rock.rotation.set(rnd() * 0.4, rnd() * Math.PI * 2, rnd() * 0.3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      g.add(rock);
    }

    root.add(g);
  });
}

function buildLowlandDressing(root: THREE.Group, mats: Mats): void {
  const rnd = seeded(88117);

  const pathPts: [number, number][] = [
    [-4.35, 4.5],
    [-3.62, 4.62],
    [-2.92, 4.55],
    [-2.2, 4.66],
    [-1.46, 4.58],
    [-0.72, 4.66],
    [0.02, 4.72],
    [0.5, 4.62],
    [3.34, 4.44],
    [3.56, 3.9],
    [3.66, 3.34],
    [3.58, 2.78],
    [3.46, 2.24],
    [3.28, 1.92],
    [0.4, 0.64],
    [1.12, 0.54],
    [1.86, 0.48],
    [2.58, 0.58],
    [3.0, 1.1],
  ];
  const pathGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.03);
  const pathMat = mats.paving.clone();
  (pathMat as THREE.MeshStandardMaterial).color.set(0xffffff);
  const path = instanced(pathGeo, pathMat, pathPts.length);
  pathPts.forEach(([x, z], i) => {
    tmp.position.set(x + (rnd() - 0.5) * 0.06, 0.055, z + (rnd() - 0.5) * 0.06);
    tmp.rotation.set(0, (rnd() - 0.5) * 0.5, 0);
    tmp.scale.set(0.52 + rnd() * 0.2, 0.1, 0.44 + rnd() * 0.18);
    tmp.updateMatrix();
    path.setMatrixAt(i, tmp.matrix);
    shade(path, i, 0.94, 0.14);
  });
  path.instanceColor!.needsUpdate = true;
  root.add(path);

  const mossMat = mats.moss.clone();
  (mossMat as THREE.MeshStandardMaterial).color.set(0x6b7954);
  const mossGeo = new THREE.CircleGeometry(1, 10);
  mossGeo.rotateX(-Math.PI / 2);
  const mossSpots: [number, number, number, number][] = [
    [-2.36, 4.02, 0.5, 0.3],
    [-2.49, 2.62, 0.62, 0.34],
    [-2.44, 0.82, 0.4, 0.26],
    [-1.62, 0.58, 0.52, 0.3],
    [0.18, 0.5, 0.7, 0.32],
    [1.92, 0.42, 0.56, 0.28],
    [3.06, 0.86, 0.44, 0.26],
    [3.28, 2.56, 0.6, 0.3],
    [3.14, 4.3, 0.42, 0.24],
    [-0.46, 4.86, 0.52, 0.26],
    [-3.66, 4.48, 0.44, 0.24],
    [3.94, 4.55, 0.56, 0.3],
    [5.5, 4.18, 0.7, 0.34],
    [4.12, 2.76, 0.5, 0.26],
    [7.62, 4.62, 0.66, 0.32],
    [8.34, 3.42, 0.54, 0.28],
    [8.02, 2.2, 0.46, 0.24],
    [6.78, 4.86, 0.52, 0.24],
    [-1.32, 1.04, 0.38, 0.2],
    [2.62, 1.12, 0.34, 0.2],
  ];
  const moss = new THREE.InstancedMesh(mossGeo, mossMat, mossSpots.length);
  moss.receiveShadow = true;
  mossSpots.forEach(([x, z, sx, sz], i) => {
    tmp.position.set(x, 0.022, z);
    tmp.rotation.set(0, rnd() * Math.PI * 2, 0);
    tmp.scale.set(sx, 1, sz);
    tmp.updateMatrix();
    moss.setMatrixAt(i, tmp.matrix);
    const v = 0.78 + rnd() * 0.3;
    col.setRGB(v * 0.88, v, v * 0.7);
    moss.setColorAt(i, col);
  });
  moss.instanceColor!.needsUpdate = true;
  root.add(moss);

  const pebGeo = new THREE.SphereGeometry(1, 6, 5);
  pebGeo.scale(1, 0.42, 0.8);
  const pebMat = mats.stone.clone();
  (pebMat as THREE.MeshStandardMaterial).color.set(0xcfc9b6);
  const pebbles: [number, number, number][] = [];
  for (let i = 0; i < 110; i++) {
    const edge = Math.floor(rnd() * 4);
    let x = 0;
    let z = 0;
    if (edge === 0) {
      x = L.pond.x0 - 0.16 + rnd() * 0.24;
      z = L.pond.z0 + rnd() * (L.pond.z1 - L.pond.z0);
    } else if (edge === 1) {
      x = L.pond.x1 + 0.04 + rnd() * 0.22;
      z = L.pond.z0 + rnd() * (L.pond.z1 - L.pond.z0);
    } else if (edge === 2) {
      x = L.pond.x0 + rnd() * (L.pond.x1 - L.pond.x0);
      z = L.pond.z0 - 0.18 + rnd() * 0.24;
    } else {
      x = L.pond.x0 + rnd() * (L.pond.x1 - L.pond.x0);
      z = L.pond.z1 + 0.04 + rnd() * 0.22;
    }
    pebbles.push([x, z, 0.035 + rnd() * 0.075]);
  }
  const peb = new THREE.InstancedMesh(pebGeo, pebMat, pebbles.length);
  peb.castShadow = false;
  peb.receiveShadow = true;
  pebbles.forEach(([x, z, r], i) => {
    tmp.position.set(x, 0.055, z);
    tmp.rotation.set(0, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.12);
    tmp.scale.set(r, r * 0.8, r);
    tmp.updateMatrix();
    peb.setMatrixAt(i, tmp.matrix);
    shade(peb, i, 0.92, 0.22);
  });
  peb.instanceColor!.needsUpdate = true;
  root.add(peb);

  const bladeGeo = new THREE.PlaneGeometry(0.055, 0.86);
  bladeGeo.translate(0, 0.43, 0);
  const reedMat = new THREE.MeshStandardMaterial({
    color: 0x6d8352,
    roughness: 0.82,
    side: THREE.DoubleSide,
    alphaMap: mats.bambooLeaf.alphaMap,
    alphaTest: 0.4,
  });
  const reedClumps: [number, number, number][] = [
    [-1.52, 4.28, 0.9],
    [2.3, 4.3, 0.8],
    [-1.9, 1.04, 0.72],
  ];
  const reeds: { x: number; z: number; ry: number; s: number }[] = [];
  for (const [cx, cz, scale] of reedClumps) {
    for (let i = 0; i < 14; i++) {
      reeds.push({
        x: cx + (rnd() - 0.5) * 0.42,
        z: cz + (rnd() - 0.5) * 0.42,
        ry: rnd() * Math.PI,
        s: scale * (0.7 + rnd() * 0.7),
      });
    }
  }
  const reed = new THREE.InstancedMesh(bladeGeo, reedMat, reeds.length);
  reed.castShadow = false;
  reed.receiveShadow = true;
  reeds.forEach((r, i) => {
    tmp.position.set(r.x, 0.03, r.z);
    tmp.rotation.set((rnd() - 0.5) * 0.2, r.ry, (rnd() - 0.5) * 0.16);
    tmp.scale.set(1, r.s, 1);
    tmp.updateMatrix();
    reed.setMatrixAt(i, tmp.matrix);
    const v = 0.74 + rnd() * 0.34;
    col.setRGB(v * 0.86, v, v * 0.68);
    reed.setColorAt(i, col);
  });
  reed.instanceColor!.needsUpdate = true;
  root.add(reed);

  // Low broad-leaf clumps around the pond feet, wall and stones.
  const fernGeo = new THREE.CircleGeometry(0.16, 7);
  fernGeo.scale(1, 2.4, 1);
  const fernMat = new THREE.MeshStandardMaterial({
    color: 0x63805a,
    roughness: 0.82,
    side: THREE.DoubleSide,
  });
  const clumps: [number, number, number][] = [
    [-2.22, 0.46, 0.9],
    [-2.16, 4.34, 0.85],
    [2.58, 4.32, 0.8],
    [0.86, 0.82, 0.74],
    [3.02, 3.92, 0.7],
    [5.0, 4.42, 0.9],
    [6.62, 4.3, 0.8],
    [7.44, 3.72, 0.7],
    [5.42, 2.3, 0.65],
    [-3.56, 3.9, 0.62],
    [8.22, 4.5, 0.72],
    [8.52, 2.64, 0.62],
    [7.86, 1.94, 0.55],
    [6.86, 4.82, 0.6],
  ];
  const fernLeaves: { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number }[] = [];
  for (const [cx, cz, scale] of clumps) {
    const n = 9 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.4;
      const lean = 0.5 + rnd() * 0.55;
      fernLeaves.push({
        x: cx + Math.cos(a) * 0.16 * scale,
        y: 0.05,
        z: cz + Math.sin(a) * 0.16 * scale,
        rx: -Math.PI / 2 + lean,
        ry: -a,
        rz: (rnd() - 0.5) * 0.25,
        s: scale * (0.6 + rnd() * 0.7),
      });
    }
  }
  const ferns = new THREE.InstancedMesh(fernGeo, fernMat, fernLeaves.length);
  ferns.castShadow = false;
  ferns.receiveShadow = true;
  fernLeaves.forEach((l, i) => {
    tmp.position.set(l.x, l.y, l.z);
    tmp.rotation.set(l.rx, l.ry, l.rz);
    tmp.scale.set(l.s, l.s, 1);
    tmp.updateMatrix();
    ferns.setMatrixAt(i, tmp.matrix);
    const v = 0.72 + rnd() * 0.5;
    col.setRGB(v * 0.82, v, v * 0.66);
    ferns.setColorAt(i, col);
  });
  ferns.instanceColor!.needsUpdate = true;
  root.add(ferns);

  // A short spur from the bridge landing to the stone table.
  const spurPts: [number, number][] = [
    [3.24, 2.28],
    [3.62, 2.72],
    [3.94, 3.16],
    [4.18, 3.5],
    [4.34, 3.78],
  ];
  const spur = instanced(pathGeo, pathMat, spurPts.length);
  spurPts.forEach(([x, z], i) => {
    tmp.position.set(x, 0.05, z + (rnd() - 0.5) * 0.04);
    tmp.rotation.set(0, (rnd() - 0.5) * 0.26, 0);
    tmp.scale.set(0.46 + rnd() * 0.12, 0.09, 0.38 + rnd() * 0.1);
    tmp.updateMatrix();
    spur.setMatrixAt(i, tmp.matrix);
    shade(spur, i, 0.92, 0.12);
  });
  spur.instanceColor!.needsUpdate = true;
  root.add(spur);
}

function buildVillaLanterns(g: THREE.Group, mats: Mats): void {
  const hanging = makeLantern(mats, 0.9);
  hanging.position.set(3.86, L.villa.base + 2.02, L.villa.z1 + 0.34);
  g.add(hanging);

  const postLantern = makeLantern(mats, 0.78);
  postLantern.position.set(7.9, L.terrace.y + 1.22, -1.32);
  g.add(postLantern);
  const post = box(mats.woodDeep, 0.09, 1.16, 0.09, 7.9, L.terrace.y, -1.32);
  g.add(post);
  const postFoot = box(mats.stone, 0.2, 0.12, 0.2, 7.9, L.terrace.y, -1.32);
  g.add(postFoot);
}

export function makeLantern(mats: Mats, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const w = 0.19 * scale;
  const h = 0.24 * scale;
  const paperGeo = new THREE.BoxGeometry(w, h, w);
  const paper = new THREE.Mesh(paperGeo, mats.paper);
  paper.position.y = h / 2;
  g.add(paper);

  const frameMat = mats.woodDeep;
  for (const [x, z] of [
    [-w / 2, -w / 2],
    [w / 2, -w / 2],
    [-w / 2, w / 2],
    [w / 2, w / 2],
  ] as const) {
    const bar = box(frameMat, 0.022 * scale, h + 0.03 * scale, 0.022 * scale, x, 0, z);
    bar.position.y = h / 2 + 0.015 * scale;
    g.add(bar);
  }
  const capTop = new THREE.Mesh(new THREE.ConeGeometry(w * 0.93, 0.09 * scale, 4), frameMat);
  capTop.rotation.y = Math.PI / 4;
  capTop.position.y = h + 0.055 * scale;
  g.add(capTop);
  const capBot = box(frameMat, w * 1.04, 0.03 * scale, w * 1.04, 0, -0.01, 0);
  g.add(capBot);

  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.028 * scale, 0.007 * scale, 6, 12), mats.metal);
  hook.position.y = h + 0.14 * scale;
  g.add(hook);

  const light = new THREE.PointLight(PALETTE.lantern, 2.6 * scale, 3.6, 2);
  light.position.y = h / 2;
  g.add(light);

  return g;
}
