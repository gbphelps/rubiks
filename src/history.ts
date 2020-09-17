import * as THREE from 'three';
import { Quaternion } from 'three';
import { setAction } from './action';
import { makeProgressFn } from './actions/setAutocorrectTwist';
import { getUserEventsEnabled, setUserEventsEnabled } from './events';
import { setRotation } from './rotation';
import { easeInOut, progress } from './utils/animation';

export type TwistMove = {
    type: 'twist',
    params: {
        unitTorque: THREE.Vector3,
        toTorque: number,
        tranche: (THREE.Object3D | null)[],
    }
}

export type RotateMove = {
  type: 'rotate',
  params: {
    endRotation: {
      mx: THREE.Matrix4,
      inv: THREE.Matrix4
    },
    startRotation: {
      mx: THREE.Matrix4,
      inv: THREE.Matrix4
    },
  }
}

type MoveLog = TwistMove | RotateMove;

let moveManifest: MoveLog[] = [];
let manifestIndex = 0;
let eventsWereEnabled = true;

export function init() {
  const undoBtn = document.getElementById('undo');
  undoBtn!.addEventListener('click', undo);
  undoBtn!.addEventListener('mousedown', () => {
    eventsWereEnabled = getUserEventsEnabled();
    setUserEventsEnabled(false);
  });
}

export function push(moveLog: TwistMove | RotateMove): void {
  moveManifest = moveManifest.slice(0, manifestIndex);
  moveManifest.push(moveLog);
  manifestIndex++;
  getManifest();
}

function undoTwist(move: TwistMove) {
  const {
    unitTorque, toTorque, tranche,
  } = move.params;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeProgressFn({
        tranche,
        unitTorque,
        toTorque: -toTorque,
        fromTorque: 0,
      }),
      tranche,
      unitTorque,
      toTorque: -toTorque,
    },
  });
}

function makeWorkerFn(fromQuaternion: Quaternion, toQuaternion: Quaternion) {
  return function worker(p: number) {
    const quaternion = fromQuaternion.slerp(toQuaternion, p);
    setRotation({
      mx: new THREE.Matrix4().makeRotationFromQuaternion(quaternion),
    });
  };
}

function undoRotate(move: RotateMove) {
  const fQ = new THREE.Quaternion().setFromRotationMatrix(move.params.endRotation.mx);
  const tQ = new THREE.Quaternion().setFromRotationMatrix(move.params.startRotation.mx);
  setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: progress(
        300,
        easeInOut,
        makeWorkerFn(fQ, tQ),
        () => {
          setUserEventsEnabled(true);
          setRotation({ inv: move.params.startRotation.inv });
          setAction(null);
        },
      ),
    },
  });
}

export function undo(): void {
  if (!eventsWereEnabled) return;

  manifestIndex--;
  const move = moveManifest[manifestIndex];

  if (move.type === 'twist') {
    undoTwist(move);
  } else if (move.type === 'rotate') {
    undoRotate(move);
  }
}

export function getManifest() {
  return moveManifest;
}
