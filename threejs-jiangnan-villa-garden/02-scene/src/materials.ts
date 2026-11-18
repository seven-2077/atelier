import * as THREE from 'three';
import * as T from './textures';

export interface Mats {
  plaster: THREE.MeshStandardMaterial;
  plasterSoft: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  paving: THREE.MeshStandardMaterial;
  tile: THREE.MeshStandardMaterial;
  tileUnder: THREE.MeshStandardMaterial;
  ridge: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  woodDeep: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  glassCool: THREE.MeshPhysicalMaterial;
  glassWarm: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  water: THREE.MeshPhysicalMaterial;
  ground: THREE.MeshStandardMaterial;
  gravel: THREE.MeshStandardMaterial;
  moss: THREE.MeshStandardMaterial;
  pine: THREE.MeshStandardMaterial;
  blossom: THREE.MeshStandardMaterial;
  bambooLeaf: THREE.MeshStandardMaterial;
  lotus: THREE.MeshStandardMaterial;
  table: THREE.MeshStandardMaterial;
  strata: THREE.MeshStandardMaterial;
  shadow: THREE.MeshBasicMaterial;
  plaque: THREE.MeshStandardMaterial;

}

export function makeMaterials(): Mats {
  const plasterMap = T.plasterTexture();
  const stoneMap = T.stoneTexture();
  const stoneBump = T.stoneBump();
  const woodMap = T.woodTexture();
  const tileMap = T.tileTexture();
  const groundMap = T.groundTexture();
  const pavingMap = T.pavingTexture();

  return {
    plaster: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: plasterMap,
      bumpMap: plasterMap,
      bumpScale: 0.22,
      roughness: 0.94,
      metalness: 0,
    }),
    plasterSoft: new THREE.MeshStandardMaterial({
      color: 0xf3e8d2,
      roughness: 0.97,
    }),
    stone: new THREE.MeshStandardMaterial({
      color: 0xc2c4b6,
      map: stoneMap,
      bumpMap: stoneBump,
      bumpScale: 0.35,
      roughness: 0.87,
      metalness: 0.02,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: 0x5d6460,
      roughness: 0.95,
    }),
    paving: new THREE.MeshStandardMaterial({
      color: 0xd6c9ae,
      map: pavingMap,
      bumpMap: pavingMap,
      bumpScale: 0.16,
      roughness: 0.84,
    }),
    tile: new THREE.MeshStandardMaterial({
      color: 0x9aa1a8,
      map: tileMap,
      roughness: 0.55,
      metalness: 0.0,
    }),
    tileUnder: new THREE.MeshStandardMaterial({ color: 0x1a1e23, roughness: 0.9 }),
    ridge: new THREE.MeshStandardMaterial({ color: 0x2b3138, roughness: 0.44, metalness: 0.1 }),
    wood: new THREE.MeshStandardMaterial({
      color: 0xb37b4c,
      map: woodMap,
      roughness: 0.46,
      metalness: 0.04,
    }),
    woodDeep: new THREE.MeshStandardMaterial({
      color: 0x7a4a28,
      map: woodMap,
      roughness: 0.6,
    }),
    door: new THREE.MeshStandardMaterial({
      color: 0x9a6644,
      map: woodMap,
      roughness: 0.4,
      metalness: 0.05,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0xc39a58,
      roughness: 0.32,
      metalness: 0.85,
    }),
    glassCool: new THREE.MeshPhysicalMaterial({
      color: 0xb7d2de,
      roughness: 0.06,
      metalness: 0.45,
      emissive: 0x2e5360,
      emissiveIntensity: 0.5,
      envMapIntensity: 2.8,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      reflectivity: 1,
    }),
    glassWarm: new THREE.MeshStandardMaterial({
      color: 0x6b4a30,
      emissive: 0xffa257,
      emissiveIntensity: 1.35,
      roughness: 0.42,
      metalness: 0,
    }),
    paper: new THREE.MeshStandardMaterial({
      color: 0xe7b982,
      emissive: 0xffa552,
      emissiveIntensity: 1.6,
      roughness: 0.6,
    }),
    water: new THREE.MeshPhysicalMaterial({
      color: 0x163a36,
      emissive: 0x051312,
      emissiveIntensity: 0.18,
      roughness: 0.34,
      metalness: 0.0,
      envMapIntensity: 0.7,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      normalMap: T.waterNormalTexture(),
      normalScale: new THREE.Vector2(0.5, 0.5),
      transparent: false,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: groundMap,
      roughness: 0.98,
    }),
    gravel: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: T.gravelTexture(),
      roughness: 0.96,
    }),
    moss: new THREE.MeshStandardMaterial({
      color: 0x6f7a55,
      roughness: 1,
    }),
    pine: new THREE.MeshStandardMaterial({
      color: 0x2f4c3b,
      roughness: 0.9,
      metalness: 0.01,
      alphaMap: T.needleTexture(),
      alphaTest: 0.42,
      side: THREE.DoubleSide,
    }),
    blossom: new THREE.MeshStandardMaterial({
      color: 0xefb9b1,
      roughness: 0.72,
      alphaMap: T.blossomTexture(),
      alphaTest: 0.32,
      side: THREE.DoubleSide,
      emissive: 0x6a3a34,
      emissiveIntensity: 0.08,
    }),
    bambooLeaf: new THREE.MeshStandardMaterial({
      color: 0x7c9464,
      roughness: 0.85,
      alphaMap: T.bambooLeafTexture(),
      alphaTest: 0.42,
      side: THREE.DoubleSide,
    }),
    lotus: new THREE.MeshStandardMaterial({
      color: 0x5d8756,
      roughness: 0.76,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
    table: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: T.tableTexture(),
      roughness: 0.42,
      metalness: 0.12,
    }),
    strata: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: T.strataTexture(),
      bumpMap: T.strataTexture(),
      bumpScale: 0.4,
      roughness: 0.95,
    }),
    shadow: new THREE.MeshBasicMaterial({
      map: T.shadowTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
    plaque: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: T.plaqueTexture('栖 晚'),
      roughness: 0.35,
      metalness: 0.15,
    }),
  };
}
