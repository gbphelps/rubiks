import './modal.scss';
import * as THREE from 'three';
import {
  getTime, start as startClock, stop as stopClock, setClock,
} from '../clock';
import { setUserEventsEnabled } from '../events';
import { easeInOut } from '../utils/animation';
import { startOver } from '../startOver';
import grab from './grab.svg';
import grabbing from './grabbing.svg';
import { Side } from '../utils/types';
import faceManager from '../faceManager';
import { Globals } from '../globals';
import { makeTwistProgressFn } from '../utils/animation/TwistProgressFunction';

const T_DURATION = 300;

const s = 150;
const ROTATE_RADIUS = s * 0.6;
const DRAG_DISTANCE = s * 0.6;

const ROTATIONS: THREE.Matrix4[] = [];
const allRotationsSet = false;
let modalVisible = true;
let solved = false;

const g = new Globals({
  getCanvas: () => getId('demo-canvas') as HTMLCanvasElement,
  getContainer: () => getId('demo-container') as HTMLDivElement,
});

let MATRIX = new THREE.Matrix4();
resetMx();

const cursor = document.createElement('div');
cursor.id = 'cursor';
cursor.style.transform = 'translateX(-50%)translateY(-50%)';

function resetMx() {
  MATRIX = new THREE.Matrix4().makeRotationY(-Math.PI / 4)
    .premultiply(new THREE.Matrix4().makeRotationX(Math.asin(1 / Math.sqrt(3))));
}

/// ///////

cursor.innerHTML = grab;

let i = 0;
const unit = 35;
const frame: number = 0;

function animate() {
  requestAnimationFrame(animate);
  g.render();
  const action = g.action.getAction();
  if (action?.type === 'twist-autocorrect') {
    action.params.progressFn();
  }
}

function shrink() {
  const c = getId('demo-container');
  c.style.transform = 'scale(0)';
  c.style.opacity = '0';
  hideInstruction(1);
  c.addEventListener('transitionend', () => {
    c.style.transform = '';
    c.style.opacity = '1';
    setInstruction2();
  }, { once: true });
}

function setInstruction2() {
  const inst2 = getId('demo-instruction2');
  inst2.style.visibility = 'visible';
  inst2.style.transform = 'scale(1)';
  inst2.style.opacity = '1';
  cancelAnimationFrame(frame);
  cursor.style.transform = 'translateX(-50%)translateY(-50%)';
  setCursor(2);
  cursor.innerHTML = grab;
  i = 0;
  animate2();
  setNextButton(2);
}

function hideInstruction(num: number) {
  const inst = getId(`demo-instruction${num}`);
  inst.style.visibility = 'hidden';
  inst.style.transform = 'translateY(60%)';
  inst.style.opacity = '0';
}

function showInstruction(num: number) {
  hideInstruction(num === 1 ? 2 : 1);
  const inst = getId(`demo-instruction${num}`);
  inst.style.visibility = 'visible';
  inst.style.transform = 'scale(1)';
  inst.style.opacity = '1';
}

function setCursor(num: number) {
  if (num === 1) {
    const a = new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX);
    const b = g.getScreenCoordsFromCameraCoords(a).multiplyScalar(g.pixPerUnit);
    cursor.style.top = `${g.canvas.height / 2 - b.y}px`;
    cursor.style.left = `${g.canvas.width / 2 + b.x}px`;
  } else if (num === 2) {
    cursor.style.top = `${s * 2 / 3}px`;
    cursor.style.left = `${s * 1 / 15}px`;
  } else {
    throw new Error('setCursor arg must be 1 or 2');
  }
}

function gotIt() {
  hideModal();
}

function showModal() {
  modalVisible = true;
  getId('hamburger').classList.add('minimize');
  return new Promise((r) => {
    const modal = getId('modal');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.transform = 'none';
    setTimeout(() => {
      setUserEventsEnabled(false);
      r();
    }, T_DURATION);
  });
}

function hideModal() {
  return new Promise((r) => {
    const modal = getId('modal');
    getId('hamburger').classList.remove('minimize');
    modal.style.transform = 'scale(.5)';
    modal.style.opacity = '0';
    setTimeout(() => {
      modalVisible = false;
      modal.style.visibility = 'hidden';
      modal.style.animationName = 'none';
      cancelAnimationFrame(frame);
      startClock();
      setUserEventsEnabled(true);
      r();
    }, T_DURATION);
  });
}

function activateModal(modal: string) {
  ['instructions-modal', 'menu-modal', 'congrats-modal'].forEach((m) => {
    if (modal === m) {
      getId(m).style.display = 'flex';
    } else {
      getId(m).style.display = 'none';
    }
  });
}

function twistVertical() {
  const unitTorque = new THREE.Vector3(1, 0, 0);
  const tranche = g.cube.registry.getTranche(unitTorque);
  const toTorque = Math.PI / 2;

  g.action.setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        tranche,
        unitTorque,
        fromTorque: 0,
        toTorque,
        duration: 500,
        cube: g.cube,
        addlCleanup: twistHorizontal,
      }),
      unitTorque,
      toTorque,
      tranche,
    },
  });
}

function twistHorizontal() {
  const unitTorque = new THREE.Vector3(0, 1, 0);
  const toTorque = Math.PI / 2;
  const tranche = g.cube.registry.getTranche(unitTorque);

  g.action.setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        tranche,
        unitTorque,
        fromTorque: 0,
        toTorque,
        duration: 500,
        cube: g.cube,
        addlCleanup: twistVertical,
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}

export function setInstruction1() {
  showInstruction(1);
  setCursor(1);
  cursor.innerHTML = grab;
  resetMx();
  setNextButton(1);

  g.cube.registry.setActiveBox(
    new THREE.Vector3(0, 2, 2),
  );
  twistVertical();
  animate();
}

function animate2() {
}

export const init = () => {
  g.init();
  g.cube.rotation.setRotation({
    mx: MATRIX,
  });
  g.cube.updateRotation();
  g.render();

  initButtons();
  setTransitions();
  setInstruction1();
  showModal();
  document.getElementById('demo-container')!.appendChild(cursor);
  setCursor(1);

  getId('demo-next-button').addEventListener('click', shrink);
  getId('demo-next-button').addEventListener('transitionend', (e) => e.stopPropagation());
};

function initButtons() {
  getId('won-start-over').addEventListener('click', () => {
    hideModal().then(() => {
      startOver();
      solved = false;
    });
  });
  getId('see-instructions').addEventListener('click', () => {
    setInstruction1();
    activateModal('instructions-modal');
  });

  getId('start-over').addEventListener('click', () => {
    hideModal().then(startOver);
  });

  getId('resume').addEventListener('click', () => {
    hideModal().then(startClock);
  });

  getId('hamburger').addEventListener('click', () => {
    if (faceManager.puzzleSolved) return;
    if (modalVisible) {
      hideModal();
      return;
    }
    showModal();
    stopClock();
    activateModal('menu-modal');
  });
}

function getId(id: string) {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Element with ID ${id} was not found in the DOM tree! Did you delete anything from index.html?`);
  return result;
}

function setTransitions() {
  getId('modal').style.transition = `${T_DURATION / 1000}s`;
  getId('demo-container').style.transition = `${T_DURATION / 1000}s`;
}

function setNextButton(num: number) {
  if (num === 1) {
    getId('demo-next-button').removeEventListener('click', gotIt);
    getId('demo-next-button').addEventListener('click', shrink);
    getId('demo-next-button').innerHTML = 'Next<span>&nbsp;&#8250;</span>';
  } else if (num === 2) {
    getId('demo-next-button').removeEventListener('click', shrink);
    getId('demo-next-button').addEventListener('click', gotIt);
    getId('demo-next-button').innerHTML = 'Got it';
  } else {
    throw new Error('Argument to setNextButton must be either 1 or 2');
  }
}

export function triggerSolvedModal() {
  if (solved) return;
  solved = true;
  stopClock();
  setClock();
  showModal();
  activateModal('congrats-modal');
  getId('solved-in').innerHTML = `Solved in ${getTime()}`;
}
