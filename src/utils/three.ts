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
