import * as THREE from 'three';
import rubiksSVG from './assets/rubiks.svg';
import { makeTwistProgressFn } from './utils/animation/TwistProgressFunction';
import { makeQuaternionProgressFn } from './utils/animation/QuaternionProgressFunction';
import { Globals } from './globals';
import faceManager from './faceManager';
import cc from './assets/cc.svg';
import cw from './assets/cw.svg';

class Queue {
  list: (() => void)[] = [];

  locked: boolean = false;

  callback = () => {
    this.locked = false;
    if (this.list.length) {
      const fn = this.list.shift();
      this.locked = true;
      if (fn) fn();
    }
  }

  add(fn: (cb: ()=>void) => void) {
    if (this.locked) {
      this.list.push(() => fn(this.callback));
    } else {
      this.locked = true;
      fn(this.callback);
    }
  }

  reset() {
    this.list = [];
    this.locked = false;
  }
}

const queue = new Queue();

export type TwistMove = {
    type: 'twist',
    params: {
        unitTorque: THREE.Vector3,
        toTorque: number,
        tranche: (THREE.Object3D | null)[],
        staticLocation: THREE.Vector3,
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
// let queue = Promise.resolve();
const LOG_HEIGHT = 40;

function setButtonsEnabled(idx: number, dir: number) {
  undoBtn.disabled = idx <= 0 && dir === -1;
  redoBtn.disabled = (idx >= manifest.length - 1 && dir === 1)
    || (dir === -1 && idx === manifest.length);
}

export function clear() {
  // queue = Promise.resolve();
  queue.reset();
  manifest = [];
  manifestIndex = 0;
  lastDir = -1;
  virtual.lastDir = -1;
  virtual.manifestIndex = 0;
  setButtonsEnabled(manifestIndex, lastDir);
  setPointer();
  setHistory();
}

export function init(g: Globals) {
  document.getElementById('history-bg')!.innerHTML = rubiksSVG;
  undoBtn = document.getElementById('undo');
  redoBtn = document.getElementById('redo');
  history = document.getElementById('history-list');
  historyPointer = document.getElementById('history-pointer-container');
  setButtonsEnabled(manifestIndex, lastDir);
  setPointer();
  setHistory();

  undoBtn!.addEventListener('click', () => doFunc(g, -1));
  redoBtn!.addEventListener('click', () => doFunc(g, 1));
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

function doTwist(g: Globals, move: TwistMove, dir: number, cb: () => void) {
  const {
    unitTorque, toTorque, tranche,
  } = move.params;
  g.events.setUserEventsEnabled(false);
  g.action.setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        events: g.events,
        cube: g.cube,
        tranche,
        unitTorque,
        toTorque: dir * toTorque,
        fromTorque: 0,
        duration: 500,
        addlCleanup: () => {
          faceManager.updateFaces();
          cb();
        },
      }),
      tranche,
      unitTorque,
      toTorque: dir * toTorque,
    },
  });
}

function doRotate(g: Globals, move: RotateMove, dir: number, cb: () => void) {
  const fromQ = new THREE.Quaternion().setFromRotationMatrix(move.params.endRotation.mx);
  const toQ = new THREE.Quaternion().setFromRotationMatrix(move.params.startRotation.mx);
  g.events.setUserEventsEnabled(false);
  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: makeQuaternionProgressFn({
        g,
        fromQ: dir === -1 ? fromQ : toQ,
        toQ: dir === -1 ? toQ : fromQ,
        matrixData: dir === -1 ? move.params.startRotation : move.params.endRotation,
        cb,
      }),
    },
  });
}

function doFunc(g: Globals, dir: number) {
  if (g.modalVisible) return;
  if (virtual.lastDir === dir) {
    virtual.manifestIndex += dir;
  }
  virtual.lastDir = dir;
  setButtonsEnabled(virtual.manifestIndex, virtual.lastDir);

  type PromiseMaker = (cb: () => void) => void;
  const makePromise: PromiseMaker = (cb) => {
    if (lastDir === dir) {
      manifestIndex += dir;
    }
    lastDir = dir;
    setPointer();

    const move = manifest[manifestIndex];

    if (move.type === 'twist') {
      doTwist(g, move, dir, cb);
    } else if (move.type === 'rotate') {
      doRotate(g, move, dir, cb);
    }
  };

  queue.add(makePromise);
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
    child.innerHTML = translateLog(manifest[manifest.length - 1 - i]);
    history.appendChild(child);
  }
}

function setPointer() {
  historyPointer.style.visibility = manifest.length ? 'visible' : 'hidden';
  historyPointer.style.opacity = manifest.length ? 1 : 0;
  const i = manifest.length - manifestIndex - (lastDir === 1 ? 1 : 0);
  historyPointer.style.top = `${(LOG_HEIGHT - 1) * i}px`;
}

export function getManifest() {
  return manifest;
}

const faceNames = {
  x: ['left', 'xMid', 'right'],
  y: ['bottom', 'yMid', 'top'],
  z: ['back', 'zMid', 'front'],
};

function getRotDirection(torque: number, pos: number) {
  if (pos === 0) return (torque === 1 ? -1 : 1);
  return torque * pos === 1 ? -1 : 1;
}

function translateLog(entry: MoveLog) {
  if (entry.type === 'twist') {
    const pos = entry.params.staticLocation;
    const torque = entry.params.unitTorque;
    const turns = Math.round(Math.abs(entry.params.toTorque * 2 / Math.PI));
    const dims: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
    for (let i = 0; i < dims.length; i++) {
      if (torque[dims[i]]) {
        const faceName = faceNames[dims[i]][pos[dims[i]] + 1];
        const rot = getRotDirection(torque[dims[i]], pos[dims[i]]);
        return `
          <div class="history-log-content">
            <div class="face-name">
              <span>${faceName.toUpperCase()}</span>
            </div> 
            <div class="turns ${rot === 1 ? 'cw' : 'cc'}">
              ${rot === 1 ? cw : cc}
              <span>&nbsp;\u00d7&nbsp;${turns}</span>
            </div>
          </div>
        `;
      }
    }
  }
  return `
  <div class="history-log-content rotate">
    ROTATE
  </div>
  `;
}
