import * as THREE from 'three';
import { makePetalTexture } from './textures';
import { mulberry32, range } from './rng';

interface Petal {
  x: number;
  y: number;
  z: number;
  vy: number;
  phase: number;
  sway: number;
  spin: number;
  size: number;
  crown: number;
}

const CROWNS = [
  { x: -5.1, z: 3.2, r: 3.4, low: 2.7, high: 7.6 },
  { x: 17.3, z: 2.5, r: 2.6, low: 5.0, high: 13.0 },
];

export class FallingPetals {
  readonly mesh: THREE.InstancedMesh;
  readonly material: THREE.MeshStandardMaterial;
  private petals: Petal[] = [];
  private dummy = new THREE.Object3D();
  private rng = mulberry32(611);

  constructor(count = 120) {
    this.material = new THREE.MeshStandardMaterial({
      color: '#cdbce6',
      map: makePetalTexture(),
      transparent: true,
      alphaTest: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0,
      emissive: new THREE.Color('#4a3d70'),
      emissiveIntensity: 0.24,
    });
    this.mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      this.material,
      count,
    );
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < count; i++) {
      const crown = i % 2;
      const p = this.spawn(crown, true);
      this.petals.push(p);
    }
    this.update(0, 0);
  }

  private spawn(crown: number, initial = false): Petal {
    const c = CROWNS[crown];
    const a = this.rng() * Math.PI * 2;
    const r = Math.sqrt(this.rng()) * c.r;
    return {
      x: c.x + Math.cos(a) * r,
      y: initial ? range(this.rng, c.low, c.high) : range(this.rng, c.high - 1.5, c.high),
      z: c.z + Math.sin(a) * r,
      vy: range(this.rng, 0.16, 0.38),
      phase: this.rng() * Math.PI * 2,
      sway: range(this.rng, 0.22, 0.55),
      spin: range(this.rng, 0.3, 1.1),
      size: range(this.rng, 0.09, 0.17),
      crown,
    };
  }

  update(dt: number, elapsed: number): void {
    const dummy = this.dummy;
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y -= p.vy * dt;
      p.x += Math.sin(elapsed * 0.55 + p.phase) * p.sway * dt;
      p.z += Math.cos(elapsed * 0.4 + p.phase * 1.3) * p.sway * dt;
      if (p.y < 0.2) {
        const np = this.spawn(p.crown);
        Object.assign(p, np);
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(
        elapsed * p.spin + p.phase,
        elapsed * 0.4 + p.phase,
        Math.sin(elapsed * 0.8 + p.phase) * 0.7,
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  setColor(color: THREE.Color): void {
    this.material.color.copy(color);
  }

  setEmissive(color: THREE.Color, intensity: number): void {
    this.material.emissive.copy(color);
    this.material.emissiveIntensity = intensity;
  }
}
