import * as THREE from 'three';
import { setAction } from './action';
import { setUserEventsEnabled } from './events';
import rubiksSVG from './assets/rubiks.svg';
import { makeTwistProgressFn } from './utils/animation/TwistProgressFunction';
import { makeQuaternionProgressFn } from './utils/animation/QuaternionProgressFunction';

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
let lastDir = -1;
const virtual = {
  lastDir: -1,
  manifestIndex: 0,
};
let undoBtn: any;
let redoBtn: any;
let history: any;
let historyPointer: any;
const LOG_HEIGHT = 40;

function setButtonsEnabled(idx: number, dir: number) {
  undoBtn.disabled = idx <= 0 && dir === -1;
  redoBtn.disabled = (idx >= manifest.length - 1 && dir === 1)
    || (dir === -1 && idx === manifest.length);
}

export function init() {
  document.getElementById('history-bg')!.innerHTML = rubiksSVG;
  undoBtn = document.getElementById('undo');
  redoBtn = document.getElementById('redo');
  history = document.getElementById('history-list');
  historyPointer = document.getElementById('history-pointer-container');
  setButtonsEnabled(manifestIndex, lastDir);
  setPointer();
  setHistory();

  undoBtn!.addEventListener('click', () => doFunc(-1));
  redoBtn!.addEventListener('click', () => doFunc(1));
}

export function push(moveLog: TwistMove | RotateMove): void {
  manifest = manifest.slice(0, manifestIndex + (lastDir === -1 ? 0 : 1));
  manifest.push(moveLog);
  manifestIndex++;
  virtual.manifestIndex = manifestIndex;
  setPointer();
  setButtonsEnabled(manifestIndex, lastDir);
  setHistory();
}

function doTwist(move: TwistMove, dir: number, cb: () => void) {
  const {
    unitTorque, toTorque, tranche,
  } = move.params;
  setUserEventsEnabled(false);
  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        tranche,
        unitTorque,
        toTorque: dir * toTorque,
        fromTorque: 0,
        duration: 500,
        addlCleanup: () => {
          cb();
        },
      }),
      tranche,
      unitTorque,
      toTorque: dir * toTorque,
    },
  });
}

function doRotate(move: RotateMove, dir: number, cb: () => void) {
  const fromQ = new THREE.Quaternion().setFromRotationMatrix(move.params.endRotation.mx);
  const toQ = new THREE.Quaternion().setFromRotationMatrix(move.params.startRotation.mx);
  setUserEventsEnabled(false);
  setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: makeQuaternionProgressFn({
        fromQ: dir === -1 ? fromQ : toQ,
        toQ: dir === -1 ? toQ : fromQ,
        matrixData: dir === -1 ? move.params.startRotation : move.params.endRotation,
        cb,
      }),
    },
  });
}

let queue = Promise.resolve();
function doFunc(dir: number) {
  if (virtual.lastDir === dir) {
    virtual.manifestIndex += dir;
  }
  virtual.lastDir = dir;
  setButtonsEnabled(virtual.manifestIndex, virtual.lastDir);

  const makePromise: () => Promise<void> = () => new Promise((resolve) => {
    if (lastDir === dir) {
      manifestIndex += dir;
    }
    lastDir = dir;
    setPointer();

    const move = manifest[manifestIndex];

    if (move.type === 'twist') {
      doTwist(move, dir, resolve);
    } else if (move.type === 'rotate') {
      doRotate(move, dir, resolve);
    }
  });
  queue = queue.then(makePromise);
}

function setHistory() {
  const bg = document.getElementById('history-bg')!;
  history.innerHTML = '';
  if (!manifest.length) {
    bg.style.opacity = '1';
    history.innerHTML = "<div class='no-history'><div>No history...yet</div><div>Get crackin&rsquo;!</div></div>";
    return;
  }
  bg.style.opacity = '0';
  for (let i = 0; i < manifest.length; i++) {
    const child = document.createElement('div');
    child.classList.add('history-log');
    child.style.height = `${LOG_HEIGHT}px`;
    child.innerHTML = manifest[i].type;
    history.appendChild(child);
  }
}

function setPointer() {
  historyPointer.style.visibility = manifest.length ? 'visible' : 'hidden';
  historyPointer.style.opacity = manifest.length ? 1 : 0;
  historyPointer.style.top = `${(LOG_HEIGHT - 1) * (manifestIndex - (lastDir === -1 ? 1 : 0) + 1)}px`;
}

export function getManifest() {
  return manifest;
}
