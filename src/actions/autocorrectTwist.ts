import * as THREE from 'three';
import { getAction } from '../action';
import {
  unitVector, Matrix2Tuple, X, Rx, Ry, Rz,
} from '../utils/matrix';

function lerp(p: number, from: number, to: number) {
  return from + (to - from) * p;
}

export default function autocorrectTwist() {
  const action = getAction();
  if (action && action.type === 'twist-autocorrect') {
    const p = action.params.progressFn();
    let rotation = unitVector();
    const from = action.params.fromTorque;
    const to = action.params.toTorque;

    rotation = X(Rx(lerp(p, from.x, to.x)), rotation);
    rotation = X(Ry(lerp(p, from.y, to.y)), rotation);
    rotation = X(Rz(lerp(p, from.z, to.z)), rotation);

    action.params.tranche.forEach((box) => {
      if (!box) throw new Error();
      const matrix = new THREE.Matrix4();
      matrix.set(...Matrix2Tuple(rotation));
      box.setRotationFromMatrix(matrix);
    });
  }
}
