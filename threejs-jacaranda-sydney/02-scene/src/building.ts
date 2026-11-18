import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  makeGlassTintTexture,
  makeGlowTexture,
  makeIronTexture,
  makeLeafTexture,
  makeMagazineTexture,
  makePlaqueTexture,
  makeShopTexture,
  makeWindowTexture,
} from './textures';
import { mulberry32, range } from './rng';

export interface BuildingResult {
  group: THREE.Group;
  windowMats: THREE.MeshStandardMaterial[];
  shopMats: THREE.MeshStandardMaterial[];
  wallMats: THREE.MeshStandardMaterial[];
  trimMats: THREE.MeshStandardMaterial[];
  ironMats: THREE.MeshStandardMaterial[];
  lampLights: THREE.PointLight[];
  lampBulbs: THREE.MeshStandardMaterial[];
  glowMats: THREE.SpriteMaterial[];
}

const FLOOR_H = 3.05;
const WALL_H = 10.15;
const CORNER_R = 3;
const X_LEN = 16;
const Z_LEN = 13;

function wallShape(): THREE.Shape {
  // shape coords: (x, -z)
  const s = new THREE.Shape();
  s.moveTo(X_LEN, 0);
  s.lineTo(CORNER_R, 0);
  s.absarc(CORNER_R, CORNER_R, CORNER_R, -Math.PI / 2, Math.PI, true);
  s.lineTo(0, Z_LEN);
  s.lineTo(X_LEN, Z_LEN);
  s.closePath();
  return s;
}

function cornerRing(inner: number, outer: number, y: number, height: number): THREE.Mesh {
  const s = new THREE.Shape();
  s.absarc(CORNER_R, CORNER_R, outer, -Math.PI / 2, Math.PI, true);
  s.absarc(CORNER_R, CORNER_R, inner, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 24 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
}

export function createBuilding(): BuildingResult {
  const group = new THREE.Group();
  const windowMats: THREE.MeshStandardMaterial[] = [];
  const shopMats: THREE.MeshStandardMaterial[] = [];
  const wallMats: THREE.MeshStandardMaterial[] = [];
  const trimMats: THREE.MeshStandardMaterial[] = [];
  const ironMats: THREE.MeshStandardMaterial[] = [];
  const lampLights: THREE.PointLight[] = [];
  const lampBulbs: THREE.MeshStandardMaterial[] = [];
  const glowMats: THREE.SpriteMaterial[] = [];
  const trimGeos: THREE.BufferGeometry[] = [];
  const ironGeos: THREE.BufferGeometry[] = [];

  const rng = mulberry32(1882);
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#f2e7d4',
    roughness: 0.86,
    metalness: 0,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: '#f8f0e2',
    roughness: 0.72,
    metalness: 0,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#ded4c2',
    roughness: 0.8,
    metalness: 0,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: '#f3eadc',
    emissive: '#5c4c37',
    emissiveIntensity: 0.28,
    roughness: 0.42,
    metalness: 0.32,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: '#2e2b2c',
    roughness: 0.48,
    metalness: 0.55,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: '#9c938c',
    emissive: '#2e2b33',
    emissiveIntensity: 0.18,
    roughness: 0.9,
    metalness: 0,
  });
  wallMats.push(wallMat);
  trimMats.push(trimMat);
  ironMats.push(ironMat);

  // ---------------------------------------------------------------- massing
  const shellGeo = new THREE.ExtrudeGeometry(wallShape(), {
    depth: WALL_H,
    bevelEnabled: false,
    curveSegments: 32,
  });
  shellGeo.rotateX(-Math.PI / 2);
  const shell = new THREE.Mesh(shellGeo, wallMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  group.add(shell);

  // protruding cornice bands at floor divisions, base and parapet
  const addBand = (y: number, h: number, protrude: number, mat: THREE.Material): void => {
    const front = new THREE.Mesh(new THREE.BoxGeometry(X_LEN - CORNER_R + 0.3, h, protrude * 2), mat);
    front.position.set((X_LEN + CORNER_R) / 2, y + h / 2, 0);
    front.castShadow = true;
    front.receiveShadow = true;
    group.add(front);

    const side = new THREE.Mesh(new THREE.BoxGeometry(protrude * 2, h, Z_LEN - CORNER_R + 0.3), mat);
    side.position.set(0, y + h / 2, -(Z_LEN + CORNER_R) / 2);
    side.castShadow = true;
    side.receiveShadow = true;
    group.add(side);

    const ring = cornerRing(CORNER_R, CORNER_R + protrude, y, h);
    ring.material = mat;
    ring.castShadow = true;
    ring.receiveShadow = true;
    group.add(ring);
  };

  addBand(0.0, 0.38, 0.24, stoneMat);
  addBand(2.96, 0.18, 0.2, trimMat);
  addBand(6.03, 0.2, 0.24, trimMat);
  addBand(9.93, 0.34, 0.3, trimMat);

  // low parapet: keeps the roof deck from reading as a big dark slab
  {
    const parapetH = 0.62;
    const parapetY = 10.26;
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(X_LEN - CORNER_R + 0.2, parapetH, 0.26),
      wallMat,
    );
    front.position.set((X_LEN + CORNER_R) / 2, parapetY + parapetH / 2, -0.13);
    front.castShadow = true;
    group.add(front);
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, parapetH, Z_LEN - CORNER_R + 0.2),
      wallMat,
    );
    side.position.set(-0.13, parapetY + parapetH / 2, -(Z_LEN + CORNER_R) / 2);
    side.castShadow = true;
    group.add(side);
    const capRing = cornerRing(CORNER_R - 0.24, CORNER_R, parapetY, parapetH);
    capRing.material = wallMat;
    group.add(capRing);
    // cap mouldings
    const capF = new THREE.Mesh(
      new THREE.BoxGeometry(X_LEN - CORNER_R + 0.36, 0.12, 0.4),
      trimMat,
    );
    capF.position.set((X_LEN + CORNER_R) / 2, parapetY + parapetH + 0.06, -0.13);
    capF.castShadow = true;
    group.add(capF);
    const capS = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, Z_LEN - CORNER_R + 0.36), trimMat);
    capS.position.set(-0.13, parapetY + parapetH + 0.06, -(Z_LEN + CORNER_R) / 2);
    group.add(capS);
    const capRingTop = cornerRing(CORNER_R - 0.26, CORNER_R + 0.14, parapetY + parapetH, 0.12);
    capRingTop.material = trimMat;
    group.add(capRingTop);
  }

  // shallow roof deck, inset and rounded so it never pokes through the corner
  const roofShape = new THREE.Shape();
  const rr = CORNER_R - 0.4;
  const inset = 0.32;
  const rx = X_LEN - inset;
  const rz = Z_LEN - inset;
  roofShape.moveTo(rx, -inset);
  roofShape.lineTo(CORNER_R, -inset);
  roofShape.absarc(CORNER_R, CORNER_R, rr, -Math.PI / 2, Math.PI, true);
  roofShape.lineTo(inset, rz);
  roofShape.lineTo(rx, rz);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 0.12,
    bevelEnabled: false,
    curveSegments: 24,
  });
  roofGeo.rotateX(-Math.PI / 2);
  roofGeo.translate(0, WALL_H + 0.01, 0);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.receiveShadow = true;
  group.add(roof);

  // ------------------------------------------------------------- window kit
  const warmTex = makeWindowTexture(3);
  const warmTex2 = makeWindowTexture(9);
  const shopTex = makeShopTexture(12);
  const shopTex2 = makeShopTexture(28);
  const glassTintTex = makeGlassTintTexture();

  const makeGlass = (
    tex: THREE.Texture,
    tint: string,
    roughness: number,
  ): THREE.MeshStandardMaterial => {
    return new THREE.MeshStandardMaterial({
      color: '#8aa4ba',
      map: glassTintTex,
      emissive: new THREE.Color(tint),
      emissiveMap: tex,
      emissiveIntensity: 1.6,
      roughness: Math.min(roughness, 0.2),
      metalness: 0.34,
    });
  };

  const upperMats = [
    makeGlass(warmTex, '#ffd9a3', 0.28),
    makeGlass(warmTex2, '#ffc98b', 0.3),
    makeGlass(warmTex, '#ffcf9a', 0.3),
    makeGlass(warmTex2, '#c9a06f', 0.34),
  ];
  const shopMatsLocal = [
    makeGlass(shopTex, '#ffd9a0', 0.24),
    makeGlass(shopTex2, '#ffcd8f', 0.26),
    makeGlass(shopTex, '#e7b780', 0.28),
    makeGlass(shopTex2, '#a9825c', 0.32),
  ];
  [1, 0.7, 0.38, 0.13].forEach((factor, i) => {
    upperMats[i].userData.factor = factor;
    windowMats.push(upperMats[i]);
  });
  [1, 0.82, 0.48, 0.2].forEach((factor, i) => {
    shopMatsLocal[i].userData.factor = factor;
    shopMats.push(shopMatsLocal[i]);
  });

  const ironTexture = makeIronTexture();
  const ironPanelMat = new THREE.MeshStandardMaterial({
    color: '#f6edde',
    emissive: '#6a573d',
    emissiveIntensity: 0.42,
    map: ironTexture,
    alphaMap: ironTexture,
    transparent: false,
    alphaTest: 0.32,
    side: THREE.DoubleSide,
    roughness: 0.44,
    metalness: 0.3,
  });
  ironMats.push(ironPanelMat);

  interface WinOpts {
    x: number;
    y: number;
    z: number;
    rotY: number;
    w: number;
    h: number;
    shop?: boolean;
    matIndex?: number;
    /** outward offset from a curved wall */
    offset?: number;
  }

  const addWindow = (o: WinOpts): void => {
    const pos = new THREE.Vector3(o.x, o.y, o.z);
    if (o.offset) {
      const nx = Math.sin(o.rotY);
      const nz = Math.cos(o.rotY);
      pos.x += nx * o.offset;
      pos.z += nz * o.offset;
    }
    const rot = new THREE.Matrix4().makeRotationY(o.rotY).setPosition(pos);
    const addTrimBox = (
      lx: number,
      ly: number,
      lz: number,
      sx: number,
      sy: number,
      sz: number,
    ): void => {
      const g = new THREE.BoxGeometry(sx, sy, sz);
      g.applyMatrix4(new THREE.Matrix4().makeTranslation(lx, ly, lz));
      g.applyMatrix4(rot);
      trimGeos.push(g);
    };
    // surround and sill, merged into the global cream trim
    addTrimBox(0, 0, 0.005, o.w + 0.58, o.h + 0.58, 0.06);
    addTrimBox(0, 0, 0.02, o.w + 0.38, o.h + 0.38, 0.1);
    addTrimBox(0, o.h / 2 + 0.22, 0.08, 0.2, 0.26, 0.12);
    addTrimBox(0, -o.h / 2 - 0.13, 0.1, o.w + 0.52, 0.13, 0.24);
    addTrimBox(0, o.h / 2 + 0.12, 0.08, o.w + 0.44, 0.1, 0.16);
    // muntins
    addTrimBox(0, 0, 0.1, 0.042, o.h, 0.032);
    addTrimBox(0, o.h * 0.22, 0.1, o.w, 0.038, 0.032);
    addTrimBox(0, -o.h * 0.22, 0.1, o.w, 0.038, 0.032);
    if (o.w > 1.6) addTrimBox(0, 0, 0.1, 0.034, o.h, 0.03);

    const pool = o.shop ? shopMatsLocal : upperMats;
    let idx = (o.matIndex ?? 0) % pool.length;
    const roll = rng();
    if (roll < (o.shop ? 0.09 : 0.16)) idx = 3;
    else if (roll < (o.shop ? 0.2 : 0.33)) idx = 2;
    const mat = pool[idx];
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), mat);
    glass.position.set(0, 0, 0.09);
    const holder = new THREE.Group();
    holder.position.copy(pos);
    holder.rotation.y = o.rotY;
    holder.add(glass);
    group.add(holder);
  };

  const arcWindow = (
    angleDeg: number,
    y: number,
    w: number,
    h: number,
    shop: boolean,
    matIndex: number,
  ): void => {
    const a = THREE.MathUtils.degToRad(angleDeg);
    const x = CORNER_R + Math.cos(a) * CORNER_R;
    const z = -CORNER_R + Math.sin(a) * CORNER_R;
    const rotY = Math.atan2(Math.cos(a), Math.sin(a));
    addWindow({ x, y, z, rotY, w, h, shop, matIndex, offset: 0.035 });
  };

  // ------------------------------------------------------------ ground floor
  const groundY = 1.68;
  addWindow({ x: 4.5, y: groundY, z: 0, rotY: 0, w: 2.2, h: 2.16, shop: true, matIndex: 0 });
  addWindow({ x: 7.55, y: groundY, z: 0, rotY: 0, w: 1.6, h: 1.98, shop: true, matIndex: 1 });
  addWindow({ x: 10.7, y: groundY, z: 0, rotY: 0, w: 2.1, h: 2.16, shop: true, matIndex: 0 });
  addWindow({ x: 13.65, y: groundY, z: 0, rotY: 0, w: 1.25, h: 1.9, shop: true, matIndex: 1 });
  addWindow({ x: 0, y: groundY, z: -5.2, rotY: -Math.PI / 2, w: 1.9, h: 2.1, shop: true, matIndex: 1 });
  addWindow({ x: 0, y: groundY, z: -8.2, rotY: -Math.PI / 2, w: 2.15, h: 2.14, shop: true, matIndex: 0 });
  addWindow({ x: 0, y: groundY, z: -11.1, rotY: -Math.PI / 2, w: 1.15, h: 1.86, shop: true, matIndex: 1 });

  // ------------------------------------------------------------- second floor
  const secondY = FLOOR_H + 1.52;
  for (const x of [4.4, 6.65, 8.9]) {
    addWindow({ x, y: secondY, z: 0, rotY: 0, w: 1.14, h: 2.32, matIndex: 0 });
  }
  addWindow({ x: 11.55, y: secondY, z: 0, rotY: 0, w: 1.24, h: 1.98, matIndex: 1 });
  addWindow({ x: 14.1, y: secondY, z: 0, rotY: 0, w: 1.24, h: 1.98, matIndex: 0 });
  for (const z of [-4.15, -5.85]) {
    addWindow({ x: 0, y: secondY, z, rotY: -Math.PI / 2, w: 1.1, h: 2.32, matIndex: 1 });
  }
  addWindow({ x: 0, y: secondY, z: -8.75, rotY: -Math.PI / 2, w: 1.24, h: 1.98, matIndex: 0 });
  addWindow({ x: 0, y: secondY, z: -11.2, rotY: -Math.PI / 2, w: 1.24, h: 1.98, matIndex: 1 });
  for (const a of [112.5, 135, 157.5]) arcWindow(a, secondY, 1.02, 2.3, false, 0);

  // -------------------------------------------------------------- third floor
  const thirdY = FLOOR_H * 2 + 1.45;
  for (const x of [2.9, 6.1, 9.3, 12.5]) {
    addWindow({ x, y: thirdY, z: 0, rotY: 0, w: 1.2, h: 1.92, matIndex: rng() > 0.45 ? 0 : 1 });
  }
  for (const z of [-3.15, -5.9, -8.55, -11.15]) {
    addWindow({ x: 0, y: thirdY, z, rotY: -Math.PI / 2, w: 1.2, h: 1.92, matIndex: rng() > 0.4 ? 0 : 1 });
  }
  for (const a of [112.5, 135, 157.5]) arcWindow(a, thirdY, 1.0, 1.86, false, rng() > 0.3 ? 0 : 1);

  // ------------------------------------------------------------------- door
  const door = new THREE.Group();
  const doorAngle = THREE.MathUtils.degToRad(135);
  door.position.set(
    CORNER_R + Math.cos(doorAngle) * (CORNER_R + 0.02),
    0.13,
    -CORNER_R + Math.sin(doorAngle) * (CORNER_R + 0.02),
  );
  door.rotation.y = Math.atan2(Math.cos(doorAngle), Math.sin(doorAngle));
  group.add(door);

  const doorGlassMat = makeGlass(warmTex, '#ffce93', 0.3);
  doorGlassMat.userData.factor = 0.8;
  shopMats.push(doorGlassMat);

  const dframe = new THREE.Mesh(new THREE.BoxGeometry(2.66, 3.02, 0.16), trimMat);
  dframe.position.set(0, 1.56, 0.02);
  dframe.castShadow = true;
  door.add(dframe);

  // dark recess behind the doors
  const recess = new THREE.Mesh(
    new THREE.PlaneGeometry(2.38, 2.86),
    new THREE.MeshBasicMaterial({ color: '#2e1b10' }),
  );
  recess.position.set(0, 1.5, 0.105);
  door.add(recess);

  const leafTrim = new THREE.MeshStandardMaterial({
    color: '#f6eee1',
    roughness: 0.55,
    metalness: 0.05,
  });
  const addDoorBox = (x: number, y: number, z: number, sx: number, sy: number, sz: number): void => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), leafTrim);
    m.position.set(x, y, z);
    m.castShadow = true;
    door.add(m);
  };

  // two leaves: solid lower panel, glazed upper half
  for (const side of [-1, 1]) {
    const cx = side * 0.59;
    addDoorBox(cx, 0.58, 0.145, 1.06, 0.92, 0.07);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 1.2), doorGlassMat);
    pane.position.set(cx, 1.7, 0.15);
    door.add(pane);
    // glazing bars
    addDoorBox(cx, 1.7, 0.175, 0.05, 1.2, 0.035);
    addDoorBox(cx, 2.27, 0.175, 0.94, 0.06, 0.035);
    addDoorBox(cx, 1.52, 0.175, 0.94, 0.045, 0.035);
  }
  // stiles and rails framing both leaves
  addDoorBox(-1.16, 1.34, 0.16, 0.12, 2.52, 0.1);
  addDoorBox(1.16, 1.34, 0.16, 0.12, 2.52, 0.1);
  addDoorBox(-0.08, 1.34, 0.16, 0.1, 2.52, 0.1);
  addDoorBox(0.08, 1.34, 0.16, 0.1, 2.52, 0.1);
  addDoorBox(0, 1.08, 0.16, 2.4, 0.09, 0.1);
  addDoorBox(0, 2.56, 0.16, 2.4, 0.11, 0.1);
  addDoorBox(0, 0.1, 0.16, 2.4, 0.15, 0.1);

  // transom above
  const transom = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 0.3), doorGlassMat);
  transom.position.set(0, 2.76, 0.15);
  door.add(transom);
  addDoorBox(0, 2.76, 0.17, 0.05, 0.3, 0.035);
  addDoorBox(0, 2.6, 0.17, 2.3, 0.06, 0.04);

  // brass handles
  const brass = new THREE.MeshStandardMaterial({ color: '#b58a4e', roughness: 0.34, metalness: 0.8 });
  for (const x of [-0.22, 0.22]) {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8), brass);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(x, 1.26, 0.205);
    door.add(handle);
  }
  // steps
  for (let i = 0; i < 2; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.06 - i * 0.22, 0.13, 0.58), stoneMat);
    step.position.set(0, -0.065, 0.46 + i * 0.3);
    step.receiveShadow = true;
    step.castShadow = true;
    door.add(step);
  }

  // plaque above the door
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.3),
    new THREE.MeshStandardMaterial({ map: makePlaqueTexture('18'), roughness: 0.7 }),
  );
  plaque.position.set(0, 3.34, 0.09);
  door.add(plaque);

  // warm light spilling from the doorway
  const doorLight = new THREE.PointLight('#ffb46a', 20, 10, 1.7);
  doorLight.position.set(0.2, 2.1, 1.3);
  door.add(doorLight);
  lampLights.push(doorLight);
  const porchLight = new THREE.PointLight('#ffbd82', 9, 6.5, 1.8);
  porchLight.position.set(0.8, 1.05, 2.1);
  group.add(porchLight);
  lampLights.push(porchLight);
  const doorGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: '#ffbd7d',
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  doorGlow.scale.set(2.6, 2.2, 1);
  doorGlow.position.set(0, 1.85, 0.42);
  door.add(doorGlow);
  glowMats.push(doorGlow.material);

  // --------------------------------------------------------------- balcony
  const balcony = new THREE.Group();
  group.add(balcony);
  const slabMat = new THREE.MeshStandardMaterial({ color: '#efe4d2', roughness: 0.78, metalness: 0 });
  const slabTop = 3.16;
  const slabH = 0.2;
  const outerR = 4.16;

  const ringShape = new THREE.Shape();
  ringShape.absarc(CORNER_R, CORNER_R, outerR, -Math.PI / 2, Math.PI, true);
  ringShape.absarc(CORNER_R, CORNER_R, CORNER_R, Math.PI, Math.PI * 1.5, false);
  ringShape.closePath();
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
    depth: slabH,
    bevelEnabled: false,
    curveSegments: 32,
  });
  ringGeo.rotateX(-Math.PI / 2);
  ringGeo.translate(0, slabTop, 0);
  const ringSlab = new THREE.Mesh(ringGeo, slabMat);
  ringSlab.castShadow = true;
  ringSlab.receiveShadow = true;
  balcony.add(ringSlab);

  const frontSlab = new THREE.Mesh(new THREE.BoxGeometry(7.25, slabH, 1.18), slabMat);
  frontSlab.position.set(6.55, slabTop + slabH / 2, 0.59);
  frontSlab.castShadow = true;
  frontSlab.receiveShadow = true;
  balcony.add(frontSlab);

  const sideSlab = new THREE.Mesh(new THREE.BoxGeometry(1.18, slabH, 3.75), slabMat);
  sideSlab.position.set(-0.59, slabTop + slabH / 2, -4.87);
  sideSlab.castShadow = true;
  sideSlab.receiveShadow = true;
  balcony.add(sideSlab);

  const railBase = slabTop + slabH;
  const railH = 1.02;
  const railY = railBase + railH / 2;
  const panelW = 0.94;
  const panelH = 0.96;

  const addPanel = (x: number, z: number, rotY: number, width = panelW): void => {
    const mat = ironPanelMat;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, panelH), mat);
    mesh.position.set(x, railY, z);
    mesh.rotation.y = rotY;
    balcony.add(mesh);
    const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.05, 0.055, 0.05), ironMat);
    top.position.set(x, railBase + railH, z);
    top.rotation.y = rotY;
    balcony.add(top);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.05, 0.05), ironMat);
    bottom.position.set(x, railBase + 0.09, z);
    bottom.rotation.y = rotY;
    balcony.add(bottom);
  };

  // curved section, seven lace panels following the arc
  const arcSegs = 7;
  for (let i = 0; i < arcSegs; i++) {
    const a0 = Math.PI / 2 + (i / arcSegs) * (Math.PI / 2);
    const a1 = Math.PI / 2 + ((i + 1) / arcSegs) * (Math.PI / 2);
    const am = (a0 + a1) / 2;
    const x = CORNER_R + Math.cos(am) * outerR;
    const z = -CORNER_R + Math.sin(am) * outerR;
    const chord = 2 * outerR * Math.sin((a1 - a0) / 2) + 0.03;
    addPanel(x, z, Math.atan2(Math.cos(am), Math.sin(am)), chord);
  }
  // front straight
  for (let i = 0; i < 7; i++) {
    const x = 3.02 + panelW / 2 + i * panelW;
    addPanel(x, 1.18, 0);
  }
  // side straight
  for (let i = 0; i < 4; i++) {
    const z = -3.02 - panelW / 2 - i * panelW;
    addPanel(-1.18, z, -Math.PI / 2);
  }

  // posts at seams
  for (let i = 0; i <= arcSegs; i++) {
    const a = Math.PI / 2 + (i / arcSegs) * (Math.PI / 2);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.055, railH + 0.08, 0.055), ironMat);
    post.position.set(
      CORNER_R + Math.cos(a) * outerR,
      railBase + railH / 2,
      -CORNER_R + Math.sin(a) * outerR,
    );
    post.castShadow = true;
    balcony.add(post);
  }
  for (const x of [3.02, 3.96, 4.9, 5.84, 6.78, 7.72, 8.66, 9.6, 10.0]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, railH + 0.08, 0.05), ironMat);
    post.position.set(x, railBase + railH / 2, 1.18);
    balcony.add(post);
  }
  for (const z of [-3.02, -3.96, -4.9, -5.84, -6.78]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, railH + 0.08, 0.05), ironMat);
    post.position.set(-1.18, railBase + railH / 2, z);
    balcony.add(post);
  }

  // continuous top rail around corner and straights
  const railPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI / 2 + (i / 18) * (Math.PI / 2);
    railPts.push(
      new THREE.Vector3(
        CORNER_R + Math.cos(a) * outerR,
        railBase + railH,
        -CORNER_R + Math.sin(a) * outerR,
      ),
    );
  }
  const arcRail = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), 40, 0.033, 6, false),
    ironMat,
  );
  balcony.add(arcRail);
  const frontRail = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.055, 0.055), ironMat);
  frontRail.position.set(6.5, railBase + railH, 1.18);
  balcony.add(frontRail);
  const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 3.7), ironMat);
  sideRail.position.set(-1.18, railBase + railH, -4.85);
  balcony.add(sideRail);

  // underside downlights washing warm plaster
  for (const [x, z] of [
    [4.8, 1.0],
    [7.8, 1.0],
    [1.1, 0.25],
    [-0.5, -4.2],
  ] as const) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 12),
      new THREE.MeshBasicMaterial({ color: '#ffd9a2' }),
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, slabTop - 0.01, z);
    balcony.add(disc);
    const light = new THREE.PointLight('#ffc27f', 6, 5.5, 1.8);
    light.position.set(x, slabTop - 0.25, z);
    balcony.add(light);
    lampLights.push(light);
  }

  // small potted greenery on the balcony floor
  const leafTex = makeLeafTexture();
  const leafMat = new THREE.MeshStandardMaterial({
    color: '#8fa77a',
    map: leafTex,
    alphaTest: 0.35,
    side: THREE.DoubleSide,
    roughness: 0.9,
  });
  const potMat = new THREE.MeshStandardMaterial({ color: '#8a5c45', roughness: 0.8 });
  for (const [x, z] of [
    [4.35, 0.78],
    [8.7, 0.78],
    [-0.45, -4.2],
  ] as const) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.19, 10), potMat);
    pot.position.set(x, railBase + 0.1, z);
    balcony.add(pot);
    for (let i = 0; i < 6; i++) {
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.2), leafMat);
      card.position.set(
        x + range(rng, -0.13, 0.13),
        railBase + range(rng, 0.18, 0.4),
        z + range(rng, -0.13, 0.13),
      );
      card.rotation.set(rng() * 3, rng() * 6, rng() * 3);
      balcony.add(card);
    }
  }

  // ----------------------------------------------------------- wall lanterns
  const makeWallLamp = (x: number, y: number, z: number, rotY: number): void => {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);
    lamp.rotation.y = rotY;
    group.add(lamp);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.5), darkMetalMat);
    arm.position.set(0, 0.12, 0.22);
    lamp.add(arm);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: '#ffe9bd',
      emissive: '#ffbf72',
      emissiveIntensity: 1.6,
      roughness: 0.4,
    });
    lampBulbs.push(bulbMat);
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.16, 0.2, 8, 1, true),
      new THREE.MeshStandardMaterial({
        color: '#f2e5ce',
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    shade.position.set(0, -0.05, 0.4);
    lamp.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bulbMat);
    bulb.position.set(0, -0.13, 0.4);
    lamp.add(bulb);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        color: '#ffbf7a',
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sprite.scale.set(1.1, 1.1, 1);
    sprite.position.set(0, -0.12, 0.42);
    lamp.add(sprite);
    glowMats.push(sprite.material);
    const light = new THREE.PointLight('#ffb972', 8, 7, 1.8);
    light.position.set(0, -0.12, 0.55);
    lamp.add(light);
    lampLights.push(light);
  };
  makeWallLamp(3.45, 2.62, 0.1, 0);
  makeWallLamp(0.1, 2.62, -3.45, -Math.PI / 2);
  makeWallLamp(11.9, 2.62, 0.1, 0);

  // interior shop lights (only visible as spill at night)
  for (const [x, z] of [
    [5.6, 1.2],
    [10.8, 1.2],
    [-0.8, -8.0],
  ] as const) {
    const l = new THREE.PointLight('#ffb877', 10, 8, 1.8);
    l.position.set(x, 2.0, z);
    group.add(l);
    lampLights.push(l);
  }

  // --------------------------------------------------------- magazine rack
  const rack = new THREE.Group();
  rack.position.set(2.55, 0.13, 1.85);
  rack.rotation.y = -0.5;
  group.add(rack);
  const rackWood = new THREE.MeshStandardMaterial({ color: '#5a4a3d', roughness: 0.8 });
  const boardA = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.08, 0.055), rackWood);
  boardA.position.set(0, 0.54, 0.14);
  boardA.rotation.x = -0.13;
  rack.add(boardA);
  const boardB = boardA.clone();
  boardB.position.z = -0.14;
  boardB.rotation.x = 0.13;
  rack.add(boardB);
  const magMat = new THREE.MeshStandardMaterial({ map: makeMagazineTexture(), roughness: 0.8 });
  for (const [x, y, z] of [
    [-0.18, 0.62, 0.18],
    [0.15, 0.7, 0.18],
    [0.02, 0.5, 0.18],
  ] as const) {
    const mag = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.34), magMat);
    mag.position.set(x, y, z);
    mag.rotation.x = -0.13;
    rack.add(mag);
  }

  // merge cream trim and iron pieces to keep draw calls sane
  if (trimGeos.length > 0) {
    const merged = mergeGeometries(trimGeos, false);
    if (merged) {
      const trimMesh = new THREE.Mesh(merged, trimMat);
      trimMesh.castShadow = true;
      trimMesh.receiveShadow = true;
      group.add(trimMesh);
    }
    trimGeos.forEach((g) => g.dispose());
  }
  if (ironGeos.length > 0) {
    const mergedIron = mergeGeometries(ironGeos, false);
    if (mergedIron) {
      const mesh = new THREE.Mesh(mergedIron, ironMat);
      mesh.castShadow = true;
      group.add(mesh);
    }
  }

  return {
    group,
    windowMats,
    shopMats,
    wallMats,
    trimMats,
    ironMats,
    lampLights,
    lampBulbs,
    glowMats,
  };
}
