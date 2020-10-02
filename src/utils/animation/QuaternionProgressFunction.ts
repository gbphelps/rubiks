import * as THREE from 'three';
import { Quaternion } from 'three';
import { Globals } from '../../globals';
import { easeInOut, progress } from '../animation';

function makeWorkerFn(g: Globals, fromQuaternion: Quaternion, toQuaternion: Quaternion) {
  return function worker(p: number) {
    const quaternion = fromQuaternion.slerp(toQuaternion, p);
    g.cube.rotation.setRotation({
      mx: new THREE.Matrix4().makeRotationFromQuaternion(quaternion),
    });
  };
}

export function makeQuaternionProgressFn({
  g, fromQ, toQ, matrixData, cb,
}: {
    g: Globals,
    fromQ: THREE.Quaternion,
    toQ: THREE.Quaternion,
    matrixData: {
      mx: THREE.Matrix4,
      inv: THREE.Matrix4,
    },
    cb: () => void,
  }) {
  return progress(
    500,
    easeInOut,
    makeWorkerFn(g, fromQ, toQ),
    () => {
      g.events.setUserEventsEnabled(true);
      g.cube.rotation.setRotation(matrixData);
      g.action.setAction(null);
      cb();
    },
  );
}
