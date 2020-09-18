import * as THREE from 'three';
import { Side, sides } from './utils/types';
import { push as pushToHistory } from './history';
import { getRotation, getRotationAndInverse } from './rotation';
import { setAction } from './action';
import { getUserEventsEnabled, setUserEventsEnabled } from './events';
import { makeQuaternionProgressFn } from './utils/animation/QuaternionProgressFunction';

const one = () => new THREE.Matrix4().identity();

const matrix: Record<Side, THREE.Matrix4> = {
  front: one(),
  left: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(Math.PI / 2),
    one(),
  ),
  right: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(-Math.PI / 2),
    one(),
  ),
  back: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI),
    one(),
  ),
  top: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI / 2),
    one(),
  ),
  bottom: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    one(),
  ),
};

const inv: Record<Side, THREE.Matrix4> = {
  front: one(),
  left: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(-Math.PI / 2),
    one(),
  ),
  right: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(Math.PI / 2),
    one(),
  ),
  back: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI),
    one(),
  ),
  top: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    one(),
  ),
  bottom: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI / 2),
    one(),
  ),
};

export function init() {
  sides.forEach((side) => {
    const faceElement = document.getElementById(side)!;
    faceElement.addEventListener('click', () => {
      if (!getUserEventsEnabled()) return;
      pushToHistory({
        type: 'rotate',
        params: {
          startRotation: getRotationAndInverse(),
          endRotation: {
            mx: matrix[side].clone(),
            inv: inv[side].clone(),
          },
        },
      });
      setUserEventsEnabled(false);
      const toQ = new THREE.Quaternion().setFromRotationMatrix(matrix[side]);
      const fromQ = new THREE.Quaternion().setFromRotationMatrix(getRotation());
      const progressFn = makeQuaternionProgressFn({
        toQ,
        fromQ,
        matrixData: {
          mx: matrix[side].clone(),
          inv: inv[side].clone(),
        },
        cb: () => {
          setUserEventsEnabled(true);
        },
      });

      setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn,
        },
      });
    });
  });
}
