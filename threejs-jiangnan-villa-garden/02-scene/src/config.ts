export type TimeOfDay = 'day' | 'golden' | 'night';

export const PALETTE = {
  skyTop: '#4e5c70',
  skyMid: '#9398a3',
  skyHorizon: '#e3c8a6',
  sun: '#ffc089',
  fog: '#d7c1a7',
  table: '#201713',
  plaster: '#e8dfcc',
  plasterShade: '#cfc3ab',
  tile: '#3a4048',
  tileDeep: '#272c33',
  ridge: '#2c3238',
  stone: '#9c9484',
  stoneCool: '#7e7d76',
  stoneWarm: '#b2a58d',
  wood: '#8a5636',
  woodDeep: '#553019',
  doorWood: '#5f3a23',
  glassCool: '#5d7c8a',
  glassWarm: '#f0a95f',
  lantern: '#ffb063',
  water: '#2f6a61',
  waterDeep: '#1d3f3c',
  leaf: '#4d6b4a',
  leafDeep: '#2e4536',
  pine: '#41604a',
  blossom: '#f2c6c1',
  blossomDeep: '#d98f8b',
  gravel: '#a89d86',
  moss: '#6f7a58',
};

export const LAYOUT = {
  base: { x0: -4.85, x1: 9.2, z0: -5.35, z1: 5.25, thickness: 1.35 },
  plateau: { x0: 0.2, x1: 8.0, z0: -5.0, z1: -0.6, top: 2.2, capTop: 2.36 },
  villa: { x0: 1.8, x1: 6.6, z0: -4.75, z1: -1.95, base: 2.36, floorH: 2.16, floors: 2 },
  terrace: { x0: 6.62, x1: 8.06, z0: -3.62, z1: -1.18, y: 2.36 },
  stairs: { x0: 2.3, x1: 3.92, zTop: -0.5, zBottom: 1.92, steps: 9 },
  pond: { x0: -2.15, x1: 2.72, z0: 0.95, z1: 4.48, waterY: 0.082, bedY: -0.92 },
  wall: { x: -2.62, thickness: 0.34, z0: -1.35, z1: 4.3, height: 2.55 },
  gate: { z: 1.62, r: 1.03 },
  window: { z: -0.55, w: 1.18, h: 1.02, y: 1.55 },
  walkY: 0.02,
};

export const CAMERA = {
  fov: 35,
  position: [8.3, 11.5, 16.6] as [number, number, number],
  target: [1.0, 2.8, 0.3] as [number, number, number],
  near: 0.1,
  far: 160,
};

export const SUN = {
  position: [13.2, 5.6, 8.2] as [number, number, number],
  target: [1.0, 1.6, 0.0] as [number, number, number],
  color: '#ffbc82',
  intensity: 3.55,
};

export const KEY_POINTS = {
  entry: [1.96, 3.6, -1.78] as [number, number, number],
  terrace: [6.65, 3.15, -1.55] as [number, number, number],
  bridge: [1.75, 0.35, 3.05] as [number, number, number],
  moonGate: [-2.62, 1.15, 1.62] as [number, number, number],
} as const;
