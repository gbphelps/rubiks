import * as THREE from 'three';
import { Side, getNormalCubeSpace } from './utils/types';
import {
  Rx, Ry, Rz,
} from './utils/matrix';

export const rotation = {
  mx: new THREE.Matrix4(),
  inv: new THREE.Matrix4(),
};

export function setRotation(
  { mx, inv }: {
    mx?: THREE.Matrix4,
    inv?: THREE.Matrix4
  },
) {
  if (mx) rotation.mx = mx.clone();
  if (inv) rotation.inv = inv.clone();
}

export function rotate(tx: number, ty: number, tz: number) {
  rotation.mx = Rx(tx).multiply(
    Ry(ty).multiply(
      Rz(tz).multiply(
        rotation.mx,
      ),
    ),
  );

  rotation.inv.multiply(Rz(-tz));
  rotation.inv.multiply(Ry(-ty));
  rotation.inv.multiply(Rx(-tx));
}

export function getRotation() {
  return rotation.mx;
}

export function getRotationAndInverse() {
  return {
    mx: rotation.mx.clone(),
    inv: rotation.inv.clone(),
  };
}

export function getPlane(side: Side) {
  const normalCamSpace = getNormalCubeSpace(side)
    .applyMatrix4(rotation.mx);

  const point = normalCamSpace
    .multiplyScalar(3 / 2);

  const { x: A, y: B, z: C } = normalCamSpace;
  const D = -A * point.x + -B * point.y + -C * point.z;
  return {
    A, B, C, D,
  };
}
