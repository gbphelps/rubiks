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

let manifest: MoveLog[] = [];
let manifestIndex = 0;
let eventsWereEnabled = true;
let lastDir = -1;
let undoBtn: any;
let redoBtn: any;
let history: any;
let historyPointer: any;
const LOG_HEIGHT = 40;

function setButtonsEnabled() {
  undoBtn.disabled = manifestIndex <= 0 && lastDir === -1;
  redoBtn.disabled = (manifestIndex >= manifest.length - 1 && lastDir === 1)
    || (lastDir === -1 && manifestIndex === manifest.length);
}

export function init() {
  undoBtn = document.getElementById('undo');
  redoBtn = document.getElementById('redo');
  history = document.getElementById('history-list');
  historyPointer = document.getElementById('history-pointer');
  setButtonsEnabled();

  undoBtn!.addEventListener('click', doFunc(-1));
  undoBtn!.addEventListener('mousedown', () => {
    eventsWereEnabled = getUserEventsEnabled();
    setUserEventsEnabled(false);
  });

  redoBtn!.addEventListener('click', doFunc(1));
  redoBtn!.addEventListener('mousedown', () => {
    eventsWereEnabled = getUserEventsEnabled();
    setUserEventsEnabled(false);
  });
}

export function push(moveLog: TwistMove | RotateMove): void {
  manifest = manifest.slice(0, manifestIndex + (lastDir === -1 ? 0 : 1));
  manifest.push(moveLog);
  manifestIndex++;
  setPointer();
  setButtonsEnabled();
  setHistory();
}

function doTwist(move: TwistMove, dir: number) {
  const {
    unitTorque, toTorque, tranche,
  } = move.params;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeProgressFn({
        tranche,
        unitTorque,
        toTorque: dir * toTorque,
        fromTorque: 0,
        duration: 500,
        addlCleanup: setButtonsEnabled,
      }),
      tranche,
      unitTorque,
      toTorque: dir * toTorque,
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

function doRotate(move: RotateMove, dir: number) {
  const fQ = new THREE.Quaternion().setFromRotationMatrix(move.params.endRotation.mx);
  const tQ = new THREE.Quaternion().setFromRotationMatrix(move.params.startRotation.mx);
  setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: progress(
        500,
        easeInOut,
        dir === -1 ? makeWorkerFn(fQ, tQ) : makeWorkerFn(tQ, fQ),
        () => {
          setUserEventsEnabled(true);
          setButtonsEnabled();
          setRotation({ inv: (dir === -1 ? move.params.startRotation : move.params.endRotation).inv });
          setAction(null);
        },
      ),
    },
  });
}

function doFunc(dir: number) {
  return function doing() {
    if (!eventsWereEnabled) return;

    if (lastDir === dir) {
      manifestIndex += dir;
    }
    lastDir = dir;
    setPointer();

    const move = manifest[manifestIndex];

    if (move.type === 'twist') {
      doTwist(move, dir);
    } else if (move.type === 'rotate') {
      doRotate(move, dir);
    }
  };
}

function setHistory() {
  history.innerHTML = '';
  for (let i = 0; i < manifest.length; i++) {
    const child = document.createElement('div');
    child.classList.add('history-log');
    child.style.height = `${LOG_HEIGHT}px`;
    child.innerHTML = manifest[i].type;
    history.appendChild(child);
  }
}

function setPointer() {
  historyPointer.style.top = `${(LOG_HEIGHT - 1) * (manifestIndex - (lastDir === -1 ? 1 : 0) + 1)}px`;
}

export function getManifest() {
  return manifest;
}
