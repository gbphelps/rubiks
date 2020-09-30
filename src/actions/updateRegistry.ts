import * as THREE from 'three';
import { Axis, axes } from '../utils/types';
import faceManager from '../faceManager';
import { globals } from '../globals';
import { roundPosition, roundRotation } from '../utils/three';

function rotateChild(child: THREE.Object3D, axis: Axis, rotation: number) {
  const a = getRotationMatrix(axis, rotation);
  const m = child.matrix;
  const b = (new THREE.Matrix4()).multiplyMatrices(a, m);
  child.setRotationFromMatrix(b);
  roundRotation(child);
}

function getRotationMatrix(axis: Axis, rotation: number) {
  const rotations: Record<string, 'makeRotationX' | 'makeRotationY' | 'makeRotationZ'> = {
    x: 'makeRotationX',
    y: 'makeRotationY',
    z: 'makeRotationZ',
  };
  const mx = new THREE.Matrix4();
  mx[rotations[axis]](rotation);
  return mx;
}

export function shuffle(times: number) {
  for (let i = 0; i < times; i++) {
    const axis = Math.floor(Math.random() * 3);
    const rotation = (Math.floor(Math.random() * 3) + 1) * Math.PI / 2;
    const layer = Math.floor(Math.random() * 3);
    const tranche = globals.cube.registry.getTrancheStatic(axis, layer);
    const rotMx = getRotationMatrix(axes[axis], rotation);
    tranche.forEach((box) => {
      if (!box) throw new Error();
      const child = box.children[0];
      rotateChild(child, axes[axis], rotation);

      child.position.applyMatrix4(rotMx);
      roundPosition(child);
      child.updateMatrix();

      const { x, y, z } = child.position;
      globals.cube.registry.registerBox(new THREE.Vector3(x + 1, y + 1, z + 1), box);
    });
  }

  faceManager.updateFaces();
}
