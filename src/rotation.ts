import * as THREE from 'three';
import { Side, getNormalCubeSpace } from './utils/types';
import {
  X, Rx, Ry, Rz, Vec2Matrix, Matrix2Tuple, unitVector,
} from './utils/matrix';

export const rotation = {
  mx: unitVector(),
  inv: unitVector(),
};

export function rotate(tx: number, ty: number, tz: number) {
  const rx = X(Rx(tx), rotation.mx);
  const ry = X(Ry(ty), rx);
  const rz = X(Rz(tz), ry);
  rotation.mx = rz;

  const ix = X(rotation.inv, Rx(-tx));
  const iy = X(ix, Ry(-ty));
  const iz = X(iy, Rz(-tz));
  rotation.inv = iz;
}

export function getRotation() {
  const mx4 = new THREE.Matrix4();
  const typedValues = Matrix2Tuple(rotation.mx);
  mx4.set(...typedValues);
  return mx4;
}

export function getPlane(side: Side) {
  const normal = Vec2Matrix(getNormalCubeSpace(side));
  const normalCamSpace = X(rotation.mx, normal);

  const point = {
    x: normalCamSpace[0][0] * 3 / 2,
    y: normalCamSpace[1][0] * 3 / 2,
    z: normalCamSpace[2][0] * 3 / 2,
  };
  const [[A], [B], [C]] = normalCamSpace;
  const D = -A * point.x + -B * point.y + -C * point.z;
  return {
    A, B, C, D,
  };
}
