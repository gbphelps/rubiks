import * as THREE from 'three';
import { Side, sides } from './utils/types';
import { push as pushToHistory } from './history';
import { makeQuaternionProgressFn } from './utils/animation/QuaternionProgressFunction';
import { Globals, globals } from './globals';
import { Events } from './events';

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

export function init(g: Globals, events: Events) {
  sides.forEach((side) => {
    const faceElement = document.getElementById(side)!;
    faceElement.addEventListener('click', () => {
      if (!events.getUserEventsEnabled()) return;
      const currentRotationData = globals.cube.rotation.getRotationAndInverse();

      // if already rotated to side, do nothing
      if (currentRotationData.mx.equals(matrix[side])) return;

      pushToHistory({
        type: 'rotate',
        params: {
          startRotation: currentRotationData,
          endRotation: {
            mx: matrix[side],
            inv: inv[side],
          },
        },
      });
      events.setUserEventsEnabled(false);
      const toQ = new THREE.Quaternion().setFromRotationMatrix(matrix[side]);
      const fromQ = new THREE.Quaternion().setFromRotationMatrix(
        globals.cube.rotation.getRotation(),
      );
      const progressFn = makeQuaternionProgressFn({
        g,
        toQ,
        fromQ,
        matrixData: {
          mx: matrix[side],
          inv: inv[side],
        },
        cb: () => {
          events.setUserEventsEnabled(true);
        },
      });

      globals.action.setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn,
        },
      });
    });
  });
}
