import * as THREE from 'three';
import { makeAsphaltTexture, makeGlowTexture, makePavingTexture, makePetalTexture } from './textures';
import { mulberry32, range } from './rng';

export interface SiteResult {
  group: THREE.Group;
  roadMats: THREE.MeshStandardMaterial[];
  paveMats: THREE.MeshStandardMaterial[];
  lampLights: THREE.PointLight[];
  spotLights: THREE.SpotLight[];
  lampBulbs: THREE.MeshStandardMaterial[];
  glowMats: THREE.SpriteMaterial[];
  petalMat: THREE.MeshStandardMaterial;
}

const SIDEWALK_Y = 0.14;

export function createSite(): SiteResult {
  const group = new THREE.Group();
  const roadMats: THREE.MeshStandardMaterial[] = [];
  const paveMats: THREE.MeshStandardMaterial[] = [];
  const lampLights: THREE.PointLight[] = [];
  const spotLights: THREE.SpotLight[] = [];
  const lampBulbs: THREE.MeshStandardMaterial[] = [];
  const glowMats: THREE.SpriteMaterial[] = [];
  const rng = mulberry32(303);

  // ------------------------------------------------------------------ plinth
  const plinthMat = new THREE.MeshStandardMaterial({
    color: '#14151b',
    roughness: 0.62,
    metalness: 0.18,
  });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(36, 1.5, 26), plinthMat);
  plinth.position.set(6, -0.75, -5);
  plinth.receiveShadow = true;
  group.add(plinth);

  const lipMat = new THREE.MeshStandardMaterial({ color: '#20212a', roughness: 0.5, metalness: 0.25 });
  const lipFront = new THREE.Mesh(new THREE.BoxGeometry(36.3, 0.07, 0.26), lipMat);
  lipFront.position.set(6, -0.025, 7.86);
  group.add(lipFront);
  const lipRight = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 26.3), lipMat);
  lipRight.position.set(23.86, -0.025, -5);
  group.add(lipRight);

  // a subtle rim on the near and right sides
  const rimMat = new THREE.MeshStandardMaterial({ color: '#32323c', roughness: 0.4, metalness: 0.5 });
  const rimFront = new THREE.Mesh(new THREE.BoxGeometry(36.4, 0.05, 0.08), rimMat);
  rimFront.position.set(6, -0.13, 7.97);
  group.add(rimFront);
  const rimRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 26.4), rimMat);
  rimRight.position.set(23.97, -0.13, -5);
  group.add(rimRight);

  // ---------------------------------------------------------------- sidewalk
  const paveTex = makePavingTexture();
  paveTex.wrapS = paveTex.wrapT = THREE.RepeatWrapping;
  paveTex.repeat.set(10, 7);
  const paveMat = new THREE.MeshStandardMaterial({
    color: '#938b7f',
    map: paveTex,
    roughness: 0.82,
    metalness: 0.04,
  });
  paveMats.push(paveMat);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(31.55, SIDEWALK_Y, 23.2), paveMat);
  walk.position.set(3.775, SIDEWALK_Y / 2, -6.4);
  walk.receiveShadow = true;
  group.add(walk);

  // curbs
  const curbMat = new THREE.MeshStandardMaterial({ color: '#a9a194', roughness: 0.82 });
  paveMats.push(curbMat);
  const curbFront = new THREE.Mesh(new THREE.BoxGeometry(31.75, 0.18, 0.2), curbMat);
  curbFront.position.set(3.775, 0.09, 5.2);
  curbFront.receiveShadow = true;
  group.add(curbFront);
  const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 23.3), curbMat);
  curbRight.position.set(19.55, 0.09, -6.4);
  curbRight.receiveShadow = true;
  group.add(curbRight);

  // ------------------------------------------------------------------- roads
  const asphalt = makeAsphaltTexture();
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
  asphalt.repeat.set(8, 3);
  const roadMat = new THREE.MeshStandardMaterial({
    color: '#3b3c44',
    map: asphalt,
    roughness: 0.72,
    metalness: 0.14,
  });
  roadMats.push(roadMat);

  const frontRoad = new THREE.Mesh(new THREE.PlaneGeometry(32.2, 2.8), roadMat);
  frontRoad.rotation.x = -Math.PI / 2;
  frontRoad.position.set(4.1, 0.012, 6.6);
  frontRoad.receiveShadow = true;
  group.add(frontRoad);

  const asphalt2 = asphalt.clone();
  asphalt2.repeat.set(2, 10);
  const roadMat2 = roadMat.clone();
  roadMat2.map = asphalt2;
  roadMats.push(roadMat2);
  const rightRoad = new THREE.Mesh(new THREE.PlaneGeometry(4.45, 26), roadMat2);
  rightRoad.rotation.x = -Math.PI / 2;
  rightRoad.position.set(21.775, 0.012, -5);
  rightRoad.receiveShadow = true;
  group.add(rightRoad);

  // road paint
  const paintMat = new THREE.MeshStandardMaterial({
    color: '#d8d1c2',
    roughness: 0.7,
    metalness: 0.05,
  });
  const dashes: THREE.BufferGeometry[] = [];
  for (let x = -11.4; x < 19.6; x += 1.9) {
    const g = new THREE.BoxGeometry(0.78, 0.012, 0.11);
    g.translate(x, 0.024, 6.6);
    dashes.push(g);
  }
  for (let z = -17.4; z < 7.4; z += 1.9) {
    const g = new THREE.BoxGeometry(0.11, 0.012, 0.78);
    g.translate(21.0, 0.024, z);
    dashes.push(g);
  }
  // crossing bars near the corner
  for (let i = 0; i < 5; i++) {
    const g = new THREE.BoxGeometry(0.13, 0.012, 2.4);
    g.translate(18.3 + i * 0.5, 0.024, 6.6);
    dashes.push(g);
  }
  const paint = new THREE.Mesh(mergeAll(dashes), paintMat);
  paint.receiveShadow = true;
  group.add(paint);

  // ------------------------------------------------------------- ground petals
  const petalTex = makePetalTexture();
  const petalMat = new THREE.MeshStandardMaterial({
    color: '#c9b8e4',
    map: petalTex,
    alphaTest: 0.12,
    transparent: false,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0,
    emissive: new THREE.Color('#40345e'),
    emissiveIntensity: 0.2,
  });
  const petals: { x: number; y: number; z: number; rot: number; scale: number }[] = [];
  const clusters = [
    { x: -5.1, z: 3.2, r: 4.0 },
    { x: 17.3, z: 2.5, r: 4.6 },
    { x: -2.7, z: 2.4, r: 2.3 },
  ];
  for (const c of clusters) {
    for (let i = 0; i < 260; i++) {
      const a = rng() * Math.PI * 2;
      const rad = Math.pow(rng(), 0.6) * c.r;
      const x = c.x + Math.cos(a) * rad;
      const z = c.z + Math.sin(a) * rad;
      if (x < -11.8 || x > 23.7 || z < -17.8 || z > 7.8) continue;
      const onWalk = x < 19.45 && z < 5.1;
      petals.push({
        x,
        y: onWalk ? SIDEWALK_Y + 0.008 : 0.028,
        z,
        rot: rng() * Math.PI * 2,
        scale: range(rng, 0.08, 0.18),
      });
    }
  }
  // a few along the curb
  for (let i = 0; i < 90; i++) {
    petals.push({
      x: range(rng, -9, 19.6),
      y: 0.028,
      z: range(rng, 5.35, 7.0),
      rot: rng() * Math.PI * 2,
      scale: range(rng, 0.07, 0.15),
    });
  }
  const petalMesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1, 1),
    petalMat,
    petals.length,
  );
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      e.set(-Math.PI / 2 + range(rng, -0.12, 0.12), p.rot, range(rng, -0.1, 0.1));
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(p.x, p.y, p.z),
        q,
        new THREE.Vector3(p.scale, p.scale, p.scale),
      );
      petalMesh.setMatrixAt(i, m);
    }
    petalMesh.instanceMatrix.needsUpdate = true;
    petalMesh.receiveShadow = true;
    petalMesh.frustumCulled = false;
    group.add(petalMesh);
  }

  // tree pits
  const pitMat = new THREE.MeshStandardMaterial({ color: '#2c2620', roughness: 1 });
  const pitRingMat = new THREE.MeshStandardMaterial({ color: '#6d655a', roughness: 0.9 });
  for (const [x, z] of [
    [-5.1, 3.2],
    [17.3, 2.5],
  ] as const) {
    const pit = new THREE.Mesh(new THREE.CircleGeometry(1.05, 28), pitMat);
    pit.rotation.x = -Math.PI / 2;
    pit.position.set(x, SIDEWALK_Y + 0.004, z);
    group.add(pit);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.14, 30), pitRingMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, SIDEWALK_Y + 0.006, z);
    group.add(ring);
  }

  // ------------------------------------------------------------------- bench
  const bench = new THREE.Group();
  bench.position.set(-3.35, SIDEWALK_Y + 0.005, 4.25);
  bench.rotation.y = THREE.MathUtils.degToRad(136);
  bench.scale.setScalar(1.12);
  group.add(bench);

  const purpleMat = new THREE.MeshStandardMaterial({
    color: '#9670c0',
    emissive: '#3a2050',
    emissiveIntensity: 0.18,
    roughness: 0.52,
    metalness: 0.06,
  });
  const purpleDark = new THREE.MeshStandardMaterial({
    color: '#6d4d90',
    roughness: 0.6,
    metalness: 0.05,
  });
  const benchIron = new THREE.MeshStandardMaterial({
    color: '#2e2b32',
    roughness: 0.48,
    metalness: 0.55,
  });

  const seatY = 0.46;
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.055, 0.115), purpleMat);
    slat.position.set(0, seatY, -0.16 + i * 0.125);
    slat.castShadow = true;
    slat.receiveShadow = true;
    bench.add(slat);
  }
  for (let i = 0; i < 3; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.1, 0.045), purpleDark);
    slat.position.set(0, 0.62 + i * 0.125, -0.33 - i * 0.018);
    slat.rotation.x = 0.08;
    slat.castShadow = true;
    bench.add(slat);
  }
  // frame + legs
  for (const x of [-0.78, 0.78]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.46, 0.52), benchIron);
    side.position.set(x, 0.23, -0.04);
    side.castShadow = true;
    bench.add(side);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.44, 0.055), benchIron);
    leg.position.set(x, 0.22, 0.2);
    bench.add(leg);
    const backPost = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.55, 0.055), benchIron);
    backPost.position.set(x, 0.7, -0.34);
    backPost.rotation.x = 0.08;
    bench.add(backPost);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 0.55), benchIron);
    arm.position.set(x, 0.7, 0.02);
    bench.add(arm);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.045, 0.05), benchIron);
  rail.position.set(0, 0.94, -0.37);
  rail.rotation.x = 0.08;
  bench.add(rail);

  // a small lavender cushion, off-centre like someone just stood up
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.34), purpleMat);
  cushion.position.set(-0.45, seatY + 0.06, -0.02);
  cushion.rotation.y = 0.12;
  cushion.castShadow = true;
  bench.add(cushion);

  const benchGlow = new THREE.PointLight('#ffc089', 20, 5.8, 1.8);
  benchGlow.position.set(-2.9, 1.2, 4.9);
  group.add(benchGlow);
  lampLights.push(benchGlow);

  // --------------------------------------------------------------- street lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(12.35, SIDEWALK_Y + 0.01, 4.55);
  group.add(lampGroup);
  const lampMetal = new THREE.MeshStandardMaterial({
    color: '#242329',
    roughness: 0.42,
    metalness: 0.7,
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 6.2, 10), lampMetal);
  pole.position.y = 3.1;
  pole.castShadow = true;
  lampGroup.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.21, 0.4, 12), lampMetal);
  base.position.y = 0.2;
  lampGroup.add(base);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 8), lampMetal);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.4, 6.15, 0);
  lampGroup.add(arm);
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 8), lampMetal);
  drop.position.set(0.86, 6.0, 0);
  lampGroup.add(drop);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#fff0cc',
    emissive: '#ffb35f',
    emissiveIntensity: 2.4,
    roughness: 0.3,
  });
  lampBulbs.push(bulbMat);
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.5, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color: '#ffe6b6',
      emissive: '#ffb35f',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      roughness: 0.25,
    }),
  );
  lantern.position.set(0.86, 5.62, 0);
  lampGroup.add(lantern);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 6), lampMetal);
  cap.position.set(0.86, 5.94, 0);
  lampGroup.add(cap);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lampMetal);
  finial.position.set(0.86, 6.06, 0);
  lampGroup.add(finial);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: '#ffc487',
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.set(1.15, 1.15, 1);
  glow.position.set(0.86, 5.62, 0.02);
  lampGroup.add(glow);
  glowMats.push(glow.material);

  const lampPoint = new THREE.PointLight('#ffb469', 24, 13, 1.7);
  lampPoint.position.set(0.86, 5.6, 0);
  lampGroup.add(lampPoint);
  lampLights.push(lampPoint);

  const spot = new THREE.SpotLight('#ffb56e', 55, 16, 0.72, 0.65, 1.6);
  spot.position.set(0.86, 5.55, 0);
  spot.target.position.set(1.6, 0, 0.4);
  lampGroup.add(spot);
  lampGroup.add(spot.target);
  spotLights.push(spot);

  return {
    group,
    roadMats,
    paveMats,
    lampLights,
    spotLights,
    lampBulbs,
    glowMats,
    petalMat,
  };
}

function mergeAll(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // Road paint pieces are small and share one material; concatenation keeps
  // the draw calls low without pulling in the heavier merge utility.
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;
  for (const g of geos) {
    const pos = g.getAttribute('position');
    const nor = g.getAttribute('normal');
    const uv = g.getAttribute('uv');
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
      if (uv) uvs.push(uv.getX(i), uv.getY(i));
    }
    const idx = g.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset);
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(i + offset);
    }
    offset += pos.count;
    g.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);
  return merged;
}
