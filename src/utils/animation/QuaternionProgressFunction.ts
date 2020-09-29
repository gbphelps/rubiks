import * as THREE from 'three';
import { Quaternion } from 'three';
import { setUserEventsEnabled } from '../../events';
import { globals } from '../../globals';
import { easeInOut, progress } from '../animation';

function makeWorkerFn(fromQuaternion: Quaternion, toQuaternion: Quaternion) {
  return function worker(p: number) {
    const quaternion = fromQuaternion.slerp(toQuaternion, p);
    globals.cube.rotation.setRotation({
      mx: new THREE.Matrix4().makeRotationFromQuaternion(quaternion),
    });
  };
}

export function makeQuaternionProgressFn({
  fromQ, toQ, matrixData, cb,
}: {
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
    makeWorkerFn(fromQ, toQ),
    () => {
      setUserEventsEnabled(true);
      globals.cube.rotation.setRotation(matrixData);
      globals.action.setAction(null);
      cb();
    },
  );
}
