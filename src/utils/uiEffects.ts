import * as THREE from 'three';
import * as boxRegistry from '../boxRegistry';

export default function colorizeActive(color: THREE.Color) {
  const active = boxRegistry.getActiveBox();
  if (!active) return;

  const mesh = active.children[0] as THREE.Mesh;
  const material = mesh.material as THREE.MeshBasicMaterial;
  material.color = color;
  material.needsUpdate = true;
}
