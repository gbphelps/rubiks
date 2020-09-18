import * as THREE from 'three';
import { Quaternion } from 'three';
import { setAction } from '../../action';
import { setUserEventsEnabled } from '../../events';
import { setRotation } from '../../rotation';
import { easeInOut, progress } from '../animation';

function makeWorkerFn(fromQuaternion: Quaternion, toQuaternion: Quaternion) {
  return function worker(p: number) {
    const quaternion = fromQuaternion.slerp(toQuaternion, p);
    setRotation({
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
      setRotation(matrixData);
      setAction(null);
      cb();
    },
  );
}
