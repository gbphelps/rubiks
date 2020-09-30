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
import { easeInOut, progress } from '../utils/animation';

const T_DURATION = 300;
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

let frame: number = 0;
let timeouts: ReturnType<typeof setTimeout>[] = [];

function animate() {
  frame = requestAnimationFrame(animate);
  g.render();
  const action = g.action.getAction();
  if (action?.type === 'twist-autocorrect') {
    action.params.progressFn();
  }
}

function shrink() {
  cancelAnimationFrame(frame);
  const c = getId('demo-container');
  c.style.transform = 'scale(0)';
  c.style.opacity = '0';
  hideInstruction(1);
  setTimeout(() => {
    c.style.transform = '';
    c.style.opacity = '1';
    setInstruction2();
  }, T_DURATION);
}

const ms: THREE.Matrix4[] = [];
let msSet = false;
function rotateForward(s: THREE.Vector2) {
  return progress(
    2000,
    easeInOut,
    (p: number) => {
      const x = 1 - Math.cos(p * 2 * Math.PI);
      const y = Math.sin(p * Math.PI * 2);

      const cursorX = s.x - 100 * x;
      const cursorY = s.y + 100 * y;

      const cxPrev = +cursor.style.left.slice(0, -2);
      const cyPrev = +cursor.style.top.slice(0, -2);

      g.cube.rotation.rotate((cursorY - cyPrev) * 0.01, (cursorX - cxPrev) * 0.01, 0);
      if (!msSet) ms.push(g.cube.rotation.getRotation());
      g.cube.updateRotation();

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    },
    () => {
      msSet = true;
      g.action.setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn: rotateBackward(s),
        },
      });
    },
  );
}

function rotateBackward(s: THREE.Vector2) {
  let pointer = ms.length - 1;
  return progress(
    2000,
    easeInOut,
    (p: number) => {
      const x = 1 - Math.cos(p * 2 * Math.PI);
      const y = -(Math.sin(p * Math.PI * 2));

      const cursorX = s.x - 100 * x;
      const cursorY = s.y + 100 * y;

      g.cube.rotation.setRotation({ mx: ms[pointer--] });
      g.cube.updateRotation();

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    },
    () => {
      g.action.setAction(null);
      g.action.setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn: rotateForward(s),
        },
      });
    },
  );
}

function setInstruction2() {
  timeouts.forEach((t) => clearTimeout(t));
  const inst2 = getId('demo-instruction2');
  inst2.style.visibility = 'visible';
  inst2.style.transform = 'scale(1)';
  inst2.style.opacity = '1';
  cancelAnimationFrame(frame);
  cursor.style.transform = 'translateX(-50%)translateY(-50%)';
  setCursor(2);
  cursor.innerHTML = grab;
  const startPos = g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(0, 0, 1.5).applyMatrix4(MATRIX),
  ).multiplyScalar(g.pixPerUnit);

  const s = new THREE.Vector2(
    g.canvas.width / 2 + startPos.x,
    g.canvas.height / 2 - startPos.y,
  );

  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: rotateForward(s),
    },
  });
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
    const pos = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
    ).multiplyScalar(g.pixPerUnit);
    cursor.style.top = `${g.canvas.height / 2 - pos.y}px`;
    cursor.style.left = `${g.canvas.width / 2 + pos.x}px`;
  } else if (num === 2) {
    const pos = g.getScreenCoordsFromCameraCoords(
      new THREE.Vector3(0, 0, 1.5).applyMatrix4(MATRIX),
    ).multiplyScalar(g.pixPerUnit);
    cursor.style.top = `${g.canvas.height / 2 - pos.y}px`;
    cursor.style.left = `${g.canvas.width / 2 + pos.x}px`;
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

  const cStart = g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
  ).multiplyScalar(g.pixPerUnit);
  const cEnd = g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(-1, -1, 1.5).applyMatrix4(MATRIX),
  ).multiplyScalar(g.pixPerUnit);

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
          const pos = new THREE.Vector2().lerpVectors(cStart, cEnd, p);
          cursor.style.top = `${(g.canvas.height / 2) - pos.y}px`;
          cursor.style.left = `${(g.canvas.width / 2) + pos.x}px`;
        },
        addlCleanup: () => {
          cursor.innerHTML = grab;
          g.action.setAction(null);
          timeouts = [
            setTimeout(() => {
              cursor.style.top = `${(g.canvas.height / 2) - cStart.y}px`;
              cursor.style.left = `${(g.canvas.width / 2) + cStart.x}px`;
            }, 500),
            setTimeout(() => {
              cursor.innerHTML = grabbing;
            }, 750),
            setTimeout(twistHorizontal, 1000),
          ];
        },
      }),
      unitTorque,
      toTorque,
      tranche,
    },
  });
}

function twistHorizontal() {
  const cStart = g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(-1, 1, 1.5).applyMatrix4(MATRIX),
  ).multiplyScalar(g.pixPerUnit);
  const cEnd = g.getScreenCoordsFromCameraCoords(
    new THREE.Vector3(1, 1, 1.5).applyMatrix4(MATRIX),
  ).multiplyScalar(g.pixPerUnit);

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
          const pos = new THREE.Vector2().lerpVectors(cStart, cEnd, p);
          cursor.style.top = `${g.canvas.height / 2 - pos.y}px`;
          cursor.style.left = `${g.canvas.width / 2 + pos.x}px`;
        },
        addlCleanup: () => {
          g.action.setAction(null);
          cursor.innerHTML = grab;
          timeouts = [
            setTimeout(() => {
              cursor.style.top = `${(g.canvas.height / 2) - cStart.y}px`;
              cursor.style.left = `${(g.canvas.width / 2) + cStart.x}px`;
            }, 500),
            setTimeout(() => {
              cursor.innerHTML = grabbing;
            }, 750),
            setTimeout(twistVertical, 1000),
          ];
        },
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}

export function setInstruction1() {
  timeouts.forEach((t) => clearTimeout(t));
  showInstruction(1);
  cursor.innerHTML = grab;
  resetMx();
  setCursor(1);
  setNextButton(1);

  g.cube.registry.setActiveBox(
    new THREE.Vector3(0, 2, 2),
  );
  timeouts = [
    setTimeout(() => {
      cursor.innerHTML = grabbing;
    }, 1000),
    setTimeout(() => {
      twistVertical();
      animate();
    }, 1250),
  ];
}

function animate2() {
  frame = requestAnimationFrame(animate2);
  g.render();
  const action = g.action.getAction();
  if (action?.type === 'rotate-autocorrect') {
    action.params.progressFn();
  }
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
