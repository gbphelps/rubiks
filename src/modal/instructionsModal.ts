import './modal.scss';
import * as THREE from 'three';
import { start as startClock, stop as stopClock } from '../clock';
import { setUserEventsEnabled } from '../events';
import { easeInOut } from '../utils/animation';
import { startOver } from '../startOver';
import grab from './grab.svg';
import grabbing from './grabbing.svg';
import { Side } from '../utils/types';

const T_DURATION = 300;

const s = 150;
const ROTATE_RADIUS = s * 0.6;
const DRAG_DISTANCE = s * 0.6;

const ROTATIONS: THREE.Matrix4[] = [];
let allRotationsSet = false;
let modalVisible = true;

let MATRIX = new THREE.Matrix4();
resetMx();

const cursor = document.createElement('div');
cursor.id = 'cursor';

function resetMx() {
  MATRIX = new THREE.Matrix4().makeRotationY(-Math.PI / 4)
    .premultiply(new THREE.Matrix4().makeRotationX(-Math.asin(1 / Math.sqrt(3))));
}

/// ///////

cursor.innerHTML = grab;

type Pips = Record<Side, HTMLDivElement[][]>
const pips: Pips = {
  front: makePips(),
  back: makePips(),
  left: makePips(),
  right: makePips(),
  top: makePips(),
  bottom: makePips(),
};

function makePips(): HTMLDivElement[][] {
  return [[], [], []];
}

const tform = {
  front: '',
  right: 'rotateY(90deg)',
  top: 'rotateX(90deg)',
  back: 'rotateY(180deg)',
  left: 'rotateY(-90deg)',
  bottom: 'rotateX(-90deg)',
};

let i = 0;
const unit = 35;
let frame: number = 0;

function animate() {
  frame = requestAnimationFrame(animate);
  i++;
  if (i === unit * 8) {
    i = 0;
    cursor.style.transform = '';
  }

  if (i === 0) {
    cursor.innerHTML = grab;
    return;
  }
  if (i === unit) {
    cursor.innerHTML = grabbing;
    return;
  }
  if (i >= unit * 2 && i < unit * 3) {
    const progress = easeInOut((i - unit * 2) / unit);

    cursor.style.transform = `translateX(${progress * DRAG_DISTANCE}px)translateY(${progress * DRAG_DISTANCE * Math.tan(Math.PI / 6)}px)`;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        pips.top[i][j].style.transform = `rotateY(${progress * 90}deg)${tform.top}`;
      }
    }

    const sides: Side[] = ['front', 'left', 'right', 'back'];
    sides.forEach((face) => {
      for (let i = 0; i < 3; i++) pips[face][0][i].style.transform = `rotateY(${progress * 90}deg)${tform[face]}`;
    });
  }

  if (i >= unit * 3 && i < unit * 4) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const sides: Side[] = ['front', 'left', 'right', 'back', 'top'];
        sides.forEach((sideName) => {
          pips[sideName][i][j].style.transform = tform[sideName];
        });
      }
    }
  }
  if (i >= unit * 4 && i < unit * 5) {
    cursor.style.transform = '';
    cursor.innerHTML = grab;
    return;
  }
  if (i >= unit * 5 && i < unit * 6) {
    cursor.innerHTML = grabbing;
  }
  if (i >= unit * 6 && i < unit * 7) {
    const progress = easeInOut((i - unit * 6) / unit);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) pips.left[i][j].style.transform = `rotateX(${-progress * 90}deg)${tform.left}`;
      pips.front[i][0].style.transform = `rotateX(${-progress * 90}deg)${tform.front}`;
      pips.top[i][0].style.transform = `rotateX(${-progress * 90}deg)${tform.top}`;
      pips.back[i][2].style.transform = `rotateX(${-progress * 90}deg)${tform.back}`;
    }
    cursor.style.transform = `translateY(${progress * DRAG_DISTANCE}px)`;
  }
  if (i >= unit * 7) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const sides: Side[] = ['front', 'left', 'right', 'back', 'top'];
        sides.forEach((sideName) => {
          pips[sideName][i][j].style.transform = tform[sideName];
        });
      }
    }
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

function resetFaceRotation() {
  const sides: Side[] = ['front', 'right', 'top', 'back', 'left'];
  sides.forEach((face) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        pips[face][i][j].style.transform = tform[face];
      }
    }
  });
}

function setInstruction2() {
  const inst2 = getId('demo-instruction2');
  inst2.style.visibility = 'visible';
  inst2.style.transform = 'scale(1)';
  inst2.style.opacity = '1';

  Array.from(document.getElementsByClassName('corner')).forEach((pip) => {
    pip.classList.remove('active');
  });
  Array.from(document.getElementsByClassName('non-corner')).forEach((pip) => {
    pip.classList.add('active');
  });
  cancelAnimationFrame(frame);
  cursor.style.transform = '';
  setCursor(2);
  cursor.innerHTML = grab;
  resetFaceRotation();
  i = 0;
  animate2();
  getId('demo-next-button').removeEventListener('click', shrink);
  getId('demo-next-button').addEventListener('click', gotIt);
  getId('demo-next-button').innerHTML = 'Got it';
}

function hideInstruction(num: number) {
  const inst = getId(`demo-instruction${num}`);
  inst.style.visibility = 'hidden';
  inst.style.transform = 'translateY(60%)';
  inst.style.opacity = '0';
}

function showInstruction(num: number) {
  const inst = getId(`demo-instruction${num}`);
  inst.style.visibility = 'visible';
  inst.style.transform = 'scale(1)';
  inst.style.opacity = '1';
}

function setCursor(num: number) {
  if (num === 1) {
    cursor.style.top = `${s * 0.25}px`;
    cursor.style.left = `-${s * 0.2}px`;
    cursor.style.transform = '';
  } else if (num === 2) {
    cursor.style.top = `${s * 2 / 3}px`;
    cursor.style.left = `${s * 1 / 15}px`;
  } else {
    throw new Error('setCursor arg must be 1 or 2');
  }
}

function gotIt() {
  hideModal();
  hideInstruction(2);
}

function showModal() {
  modalVisible = true;
  return new Promise((r) => {
    const modal = getId('modal');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.transform = 'none';
    setTimeout(r, T_DURATION);
  });
}

function hideModal() {
  return new Promise((r) => {
    const modal = getId('modal');
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

function showInstructionModal() {
  getId('instructions-modal').style.display = 'flex';
  getId('menu-modal').style.display = 'none';
}

export function setInstruction1() {
  showInstruction(1);
  hideInstruction(2);
  setCursor(1);
  cursor.innerHTML = grab;
  resetMx();
  getId('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;
  getId('demo-next-button').removeEventListener('click', gotIt);
  getId('demo-next-button').addEventListener('click', shrink);
  getId('demo-next-button').innerHTML = 'Next<span>&nbsp;&#8250;</span>';

  i = 0;
  animate();
}

function animate2() {
  function progress(i: number) { return 0.5 * (1 - Math.cos(i * Math.PI / unit / 2)); }
  frame = requestAnimationFrame(animate2);
  i++;

  if (i < unit) return;
  if (i > 7.5 * unit) i = 0;
  if (i >= unit && i <= 2 * unit) {
    cursor.innerHTML = grabbing;
    return;
  }

  if (i > 2 * unit && i < 4 * unit) {
    cursor.style.transform = `translateY(${ROTATE_RADIUS * Math.sin(Math.PI * 2 * progress(i - 2 * unit))}px)translateX(${-ROTATE_RADIUS + ROTATE_RADIUS * Math.cos(Math.PI * 2 * progress(i - 2 * unit))}px)`;

    const rot1 = Math.sin(Math.PI * 2 * progress(i - 2 * unit))
      - Math.sin(Math.PI * 2 * progress(i - 1 - 2 * unit));

    const rot2 = Math.cos(Math.PI * 2 * progress(i - 2 * unit))
      - Math.cos(Math.PI * 2 * progress(i - 1 - 2 * unit));

    MATRIX
      .premultiply(new THREE.Matrix4().makeRotationY(rot2))
      .premultiply(new THREE.Matrix4().makeRotationX(-rot1));

    if (!allRotationsSet) {
      ROTATIONS.push(
        new THREE.Matrix4().makeRotationX(rot1)
          .premultiply(new THREE.Matrix4().makeRotationY(-rot2)),
      );
    }
  }

  if (i >= 4 * unit && i < 6 * unit - 1) {
    allRotationsSet = true;
    const idx = ROTATIONS.length - 1 - i + 4 * unit;
    MATRIX.premultiply(ROTATIONS[idx]);
    cursor.style.transform = `translateY(${ROTATE_RADIUS * Math.sin(Math.PI * 2 * progress(i - 2 * unit))}px)translateX(${-ROTATE_RADIUS + ROTATE_RADIUS * Math.cos(Math.PI * 2 * progress(i - 2 * unit))}px)`;
  }

  if (i >= 6 * unit - 1) {
    cursor.innerHTML = grab;
  }

  getId('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;
}

export const init = () => {
  initPips();
  initButtons();
  const modal = getId('modal');
  const dc = getId('demo-container');

  modal.style.transition = `${T_DURATION / 1000}s`;
  dc.style.transition = `${T_DURATION / 1000}s`;
  setUserEventsEnabled(false);
  animate();
  getId('demo-cube').style.transformOrigin = '50% 50% 0';
  getId('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;

  pips.front[0][0].id = 'demo';
  document.getElementById('demo-container')!.appendChild(cursor);
  setCursor(1);

  getId('demo-next-button').addEventListener('click', shrink);
  getId('demo-next-button').addEventListener('transitionend', (e) => e.stopPropagation());
};

function initButtons() {
  document.getElementById('see-instructions')!.addEventListener('click', () => {
    setInstruction1();
    showInstructionModal();
  });

  document.getElementById('start-over')!.addEventListener('click', () => {
    hideModal().then(startOver);
  });

  document.getElementById('resume')!.addEventListener('click', () => {
    hideModal().then(startClock);
  });

  getId('hamburger').addEventListener('click', () => {
    if (modalVisible) {
      hideModal();
      return;
    }
    showModal();
    stopClock();
    getId('menu-modal').style.display = 'flex';
    getId('instructions-modal').style.display = 'none';
  });
}

function initPips() {
  const sides: Side[] = ['left', 'front', 'right', 'top', 'back', 'bottom'];
  sides.forEach((sideName) => {
    const side = document.createElement('div');
    side.classList.add('demo-face');
    side.id = sideName;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const pip = document.createElement('div');
        const back = document.createElement('div');
        Object.assign(back.style, {
          height: `${s / 3}px`,
          width: `${s / 3}px`,
          transform: 'rotateY(180deg)',
          position: 'absolute',
        });

        if (i !== 1 && j !== 1) {
          pip.classList.add('corner');
          pip.classList.add('active');
        } else {
          pip.classList.add('non-corner');
        }
        pip.classList.add('demo-pip');
        pip.appendChild(back);
        pip.style.transformOrigin = `${-j * s / 3 + s / 2}px ${-i * s / 3 + s / 2}px ${-s / 2}px`;
        pip.style.transform = tform[sideName];
        pips[sideName][i][j] = pip;
        side.appendChild(pip);
      }
    }
    getId('demo-cube').appendChild(side);
  });
}

function getId(id: string) {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Element with ID ${id} was not found in the DOM tree! Did you delete anything from index.html?`);
  return result;
}