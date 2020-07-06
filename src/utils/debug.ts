import * as THREE from 'three';
import { makeMesh } from './three';

export default function makeDebugScreen() {
  const m = new THREE.Shape();
  m.moveTo(-1.5, 1.5);
  m.lineTo(1.5, 1.5);
  m.lineTo(1.5, -1.5);
  m.lineTo(-1.5, -1.5);

  const geometry = new THREE.ShapeGeometry(m);
  const material = new THREE.MeshBasicMaterial({
    color: 'black',
    transparent: true,
    opacity: 0.2,
  });

  return makeMesh({
    geometry,
    material,
  });
}
