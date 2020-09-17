import * as THREE from 'three';

export function colorize(box: THREE.Object3D | null) {
  // if (!box) return;

  // (box.children[0].children as THREE.Object3D[]).forEach((c) => {
  //   const mat = (c.children[0].children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  //   mat.emissive = new THREE.Color('white');
  //   mat.emissiveIntensity = 0.5;
  //   mat.needsUpdate = true;
  // });
  // const mesh = box.children[0] as THREE.Mesh;
  // const material = mesh.material as THREE.MeshStandardMaterial;
  // material.emissive = new THREE.Color('white');
  // material.emissiveIntensity = 0.1;
  // material.needsUpdate = true;
}

export function decolorize(box: THREE.Object3D | null) {
  // if (!box) return;

  // (box.children[0].children as THREE.Object3D[]).forEach((c) => {
  //   const mat = (c.children[0].children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  //   mat.emissive = new THREE.Color('black');
  //   mat.needsUpdate = true;
  // });
  // const mesh = box.children[0] as THREE.Mesh;
  // const material = mesh.material as THREE.MeshStandardMaterial;
  // material.emissive = new THREE.Color('black');
  // material.needsUpdate = true;
}
