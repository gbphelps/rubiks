import './modal.scss';
import * as THREE from 'three';
import {
  getTime, start as startClock, stop as stopClock, setClock,
} from '../clock';
import { setUserEventsEnabled } from '../events';
import { startOver } from '../startOver';
import grab from './grab.svg';
import grabbing from './grabbing.svg';
import faceManager from '../faceManager';
import { Globals } from '../globals';
import { makeTwistProgressFn } from '../utils/animation/TwistProgressFunction';
import * as timeouts from './timeouts';

import { rotateForward } from './rotateInstruction';
import { setCursorPosition } from './cursorPosition';

const T_DURATION = 300;
let modalVisible = true;
let solved = false;
let activeInstruction = 1;

const listeners: Record<string, Record<string, ()=>void>> = {};

function setListener(name: string, type: string, listener: ()=>void) {
  if (!listeners[name]) listeners[name] = {};
  if (listeners[name][type]) getId(name).removeEventListener(type, listeners[name][type]);
  listeners[name][type] = listener;
  getId(name).addEventListener(type, listener);
}

function unsetActiveInstruction() {
  const lastActive = activeInstruction;
  activeInstruction = 0;
  return lastActive ? hideInstruction(lastActive) : Promise.resolve();
}

function setActiveInstruction(i: number) {
  if (activeInstruction) hideInstruction(activeInstruction);
  activeInstruction = i;
  return showInstruction(i);
}

const g = new Globals({
  getCanvas: () => getId('demo-canvas') as HTMLCanvasElement,
  getContainer: () => getId('faux-container') as HTMLDivElement,
});

const MATRIX = new THREE.Matrix4().makeRotationY(-Math.PI / 4)
  .premultiply(
    new THREE.Matrix4().makeRotationX(Math.asin(1 / Math.sqrt(3))),
  );

const cursor = document.createElement('div');
cursor.id = 'cursor';
cursor.style.transform = 'translateX(-50%)translateY(-50%)';

/// ///////

cursor.innerHTML = grab;

let frame: number = 0;

function animate() {
  frame = requestAnimationFrame(animate);
  g.render();
  const action = g.action.getAction();
  if (action?.type === 'twist-autocorrect') {
    action.params.progressFn();
  } else if (action?.type === 'rotate-autocorrect') {
    action.params.progressFn();
  }
}

let demoContainerVisible = true;
function setDemoContainerVisible(visible: boolean) {
  if (demoContainerVisible === visible) return Promise.resolve();
  return new Promise((r) => {
    const c = getId('demo-container');
    if (!visible) {
      c.style.transform = 'scale(0)';
      c.style.opacity = '0';
    } else {
      c.style.transform = 'scale(1)';
      c.style.opacity = '1';
    }
    demoContainerVisible = visible;
    setTimeout(r, T_DURATION);
  });
}

async function shrinkThenSetInstruction(num: number) {
  cancelAnimationFrame(frame);
  unsetActiveInstruction();
  await setDemoContainerVisible(false);
  setDemoContainerVisible(true);
  instructionSetters[num - 1]();
}

function setInstruction2() {
  g.cube.respawn();
  timeouts.cancelTimeouts();
  setActiveInstruction(2);
  cancelAnimationFrame(frame);
  cursor.style.transform = 'translateX(-50%)translateY(-50%)';
  cursor.innerHTML = grab;

  const getStart = () => g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(0, 0, 1.5).applyMatrix4(MATRIX),
  );

  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: () => {
        setCursorPosition(g, getStart());
      },
    },
  });

  rotateForward(g, getStart);
  animate();
  setNextButton(2);
}

function hideInstruction(num: number) {
  return new Promise((r) => {
    const inst = getId(`demo-instruction${num}`);
    inst.style.visibility = 'hidden';
    inst.style.transform = 'translateY(60%)';
    inst.style.opacity = '0';
    setTimeout(r, T_DURATION);
  });
}

function showInstruction(num: number) {
  return new Promise((r) => {
    hideInstruction(num === 1 ? 2 : 1);
    const inst = getId(`demo-instruction${num}`);
    inst.style.visibility = 'visible';
    inst.style.transform = 'scale(1)';
    inst.style.opacity = '1';
    setTimeout(r, T_DURATION);
  });
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
      g.resize();
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

  function getStartEnd() {
    const start = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
    );
    const end = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(-1, -1, 1.5).applyMatrix4(MATRIX),
    );
    return [start, end];
  }

  setCursorPosition(g, getStartEnd()[0]);

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
        addlWork: (p: number) => {
          const [start, end] = getStartEnd();
          const pos = new THREE.Vector2().lerpVectors(start, end, p);
          setCursorPosition(g, pos);
        },
        addlCleanup: () => {
          cursor.innerHTML = grab;
          g.action.setAction(null);
          timeouts.setTimeouts([
            setTimeout(() => {
              const [start] = getStartEnd();
              setCursorPosition(g, start);
            }, 500),
            setTimeout(() => {
              cursor.innerHTML = grabbing;
            }, 750),
            setTimeout(twistHorizontal, 1000),
          ]);
        },
      }),
      unitTorque,
      toTorque,
      tranche,
    },
  });
}

function twistHorizontal() {
  function getStartEnd() {
    const start = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
    );
    const end = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(1, 1, 1.5).applyMatrix4(MATRIX),
    );
    return [start, end];
  }

  setCursorPosition(g, getStartEnd()[0]);

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
        addlWork: (p: number) => {
          const [start, end] = getStartEnd();
          const pos = new THREE.Vector2().lerpVectors(start, end, p);
          setCursorPosition(g, pos);
        },
        addlCleanup: () => {
          g.action.setAction(null);
          cursor.innerHTML = grab;
          timeouts.setTimeouts([
            setTimeout(() => {
              setCursorPosition(g, getStartEnd()[0]);
            }, 500),
            setTimeout(() => {
              cursor.innerHTML = grabbing;
            }, 750),
            setTimeout(twistVertical, 1000),
          ]);
        },
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}

const instructionSetters = [setInstruction1, setInstruction2];
export function setInstruction1() {
  g.cube.respawn();
  g.cube.rotation.setRotation({ mx: MATRIX });
  g.cube.updateRotation();
  g.render();

  function getStart() {
    return g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
    );
  }

  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: () => setCursorPosition(g, getStart()),
    },
  });

  timeouts.cancelTimeouts();
  setActiveInstruction(1);
  cursor.innerHTML = grab;
  setNextButton(1);

  g.cube.registry.setActiveBox(
    new THREE.Vector3(0, 2, 2),
  );

  animate();

  timeouts.setTimeouts([
    setTimeout(() => {
      cursor.innerHTML = grabbing;
    }, 1000),
    setTimeout(() => {
      twistVertical();
    }, 1250),
  ]);
}

// function animate2() {
//   frame = requestAnimationFrame(animate2);
//   g.render();
//   const action = g.action.getAction();
//   if (action?.type === 'rotate-autocorrect') {
//     action.params.progressFn();
//   }
// }

export const init = () => {
  document.getElementById('demo-container')!.appendChild(cursor);
  resize();
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
  setNextButton(1);
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
    setListener('demo-next-button', 'click', () => shrinkThenSetInstruction(2));
    setListener('demo-prev-button', 'click', () => {});
  } else if (num === 2) {
    setListener('demo-prev-button', 'click', () => shrinkThenSetInstruction(1));
    setListener('demo-next-button', 'click', gotIt);
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

function resize() {
  const { height, width } = getId('faux-container').getBoundingClientRect();
  getId('faux-canvas').style.height = `${Math.min(height, width)}px`;
  getId('faux-canvas').style.width = `${Math.min(height, width)}px`;
}

window.addEventListener('resize', resize);
