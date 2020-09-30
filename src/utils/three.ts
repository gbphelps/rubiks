import * as THREE from 'three';
import { Geometry, Material } from 'three';
import { axes } from './types';

interface Params {
    geometry: Geometry, material: Material
}

export function makeMesh({ geometry, material }: Params) {
  return new THREE.Mesh(geometry, material);
}

export function roundPosition(obj: THREE.Object3D) {
  for (let i = 0; i < 3; i++) {
    const axis = axes[i];
    obj.position[axis] = Math.round(obj.position[axis]);
  }
}

function mod(x: number, m: number) {
  if (x % m >= 0) return Math.abs(x % m); return m + x % m;
}

export function roundRotation(obj: THREE.Object3D) {
  // note: THREEjs already takes the 2pi modulus for angles over 2pi
  for (let i = 0; i < 3; i++) {
    const axis = axes[i];
    const oneRotation = Math.PI / 2;
    const turns = Math.round(obj.rotation[axis] / oneRotation);
    obj.rotation[axis] = mod(turns, 4) * oneRotation;
  }
}
