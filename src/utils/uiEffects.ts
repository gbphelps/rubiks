import * as THREE from 'three';

export default function colorizeActive(box: THREE.Object3D | null, color: THREE.Color) {
  if (!box) return;

  const mesh = box.children[0] as THREE.Mesh;
  const material = mesh.material as THREE.MeshBasicMaterial;
  material.color = color;
  material.needsUpdate = true;
}
