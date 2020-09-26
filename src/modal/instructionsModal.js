import './modal.scss';
import * as THREE from 'three';
import { start as startClock, stop as stopClock } from '../clock';
import { setUserEventsEnabled } from '../events';
import { easeInOut } from '../utils/animation';
import { startOver } from '../startOver';

const T_DURATION = 300;

const s = 150;
const ROTATE_RADIUS = s * 0.6;
const DRAG_DISTANCE = s * 0.6;

const ROTATIONS = [];
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

const grab = `
<svg height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.78 15.82" ><defs>
  
  <style>.cls-1{fill:#fff;}.cls-2,.cls-3{fill:none;stroke:#000;stroke-linecap:round;stroke-width:0.75px;}.cls-2{stroke-linejoin:round;}</style>
  
  <filter id="f">
    <feDropShadow dx="1" dy="1" stdDeviation=".1" flood-opacity=".5"/>
  </filter>
  </defs>
   
  <g id="Layer_2" data-name="Layer 2"><g id="Isolation_Mode" data-name="Isolation Mode"><path class="cls-1" d="M4.38,8.28c-.1-.38-.2-.85-.41-1.55s-.34-.86-.47-1.24S3.2,4.77,3,4.31a11.57,11.57,0,0,1-.46-1.44,1.41,1.41,0,0,1,.24-1.2,1.42,1.42,0,0,1,1.36-.35,2.1,2.1,0,0,1,.92.78,7.56,7.56,0,0,1,.71,1.55A10.7,10.7,0,0,1,6.4,5.88l.08.45s0-1.12,0-1.16c0-1-.06-1.83,0-2.94,0-.13.06-.59.08-.72a1.2,1.2,0,0,1,.68-1,1.7,1.7,0,0,1,1.4,0,1.16,1.16,0,0,1,.68,1c0,.11.1,1,.1,1.11,0,1,0,1.64,0,2.17,0,.23,0,1.62,0,1.47a28.74,28.74,0,0,1,.34-3.94,1.49,1.49,0,0,1,.8-.93,1.35,1.35,0,0,1,1.4.24,1.79,1.79,0,0,1,.48,1.15c0,.41,0,.9,0,1.25,0,.87,0,1.32,0,2.12,0,0,0,.3,0,.18.09-.28.19-.54.26-.74s.25-.62.36-.86a6.1,6.1,0,0,1,.42-.69,1.35,1.35,0,0,1,.67-.56,1,1,0,0,1,1.3.59,3.48,3.48,0,0,1,0,1.1A9,9,0,0,1,15,6.85c-.13.45-.28,1.24-.34,1.6s-.24,1.39-.36,1.82a6.23,6.23,0,0,1-.65,1.39,7.29,7.29,0,0,0-1.2,1.81,4.93,4.93,0,0,0-.1,1,3.73,3.73,0,0,0,.12.93,5.86,5.86,0,0,1-1.23,0c-.39-.06-.87-.84-1-1.08a.38.38,0,0,0-.68,0c-.23.38-.71,1.07-1.05,1.11-.67.09-2.06,0-3.14,0,0,0,.18-1-.23-1.35S4.3,13.28,4,13l-.83-.93c-.29-.36-.63-1.09-1.25-2C1.56,9.6.89,9,.63,8.52A1.76,1.76,0,0,1,.44,7.2,1.2,1.2,0,0,1,1.8,6.36,2,2,0,0,1,3,6.9a7.59,7.59,0,0,1,.75.75c.16.19.2.27.38.51s.3.46.21.12"/><path class="cls-2" d="M4.38,8.28c-.1-.38-.2-.85-.41-1.55s-.34-.86-.47-1.24S3.2,4.77,3,4.31a11.57,11.57,0,0,1-.46-1.44,1.41,1.41,0,0,1,.24-1.2,1.42,1.42,0,0,1,1.36-.35,2.1,2.1,0,0,1,.92.78,7.56,7.56,0,0,1,.71,1.55A10.7,10.7,0,0,1,6.4,5.88l.08.45s0-1.12,0-1.16c0-1-.06-1.83,0-2.94,0-.13.06-.59.08-.72a1.2,1.2,0,0,1,.68-1,1.7,1.7,0,0,1,1.4,0,1.16,1.16,0,0,1,.68,1c0,.11.1,1,.1,1.11,0,1,0,1.64,0,2.17,0,.23,0,1.62,0,1.47a28.74,28.74,0,0,1,.34-3.94,1.49,1.49,0,0,1,.8-.93,1.35,1.35,0,0,1,1.4.24,1.79,1.79,0,0,1,.48,1.15c0,.41,0,.9,0,1.25,0,.87,0,1.32,0,2.12,0,0,0,.3,0,.18.09-.28.19-.54.26-.74s.25-.62.36-.86a6.1,6.1,0,0,1,.42-.69,1.35,1.35,0,0,1,.67-.56,1,1,0,0,1,1.3.59,3.48,3.48,0,0,1,0,1.1A9,9,0,0,1,15,6.85c-.13.45-.28,1.24-.34,1.6s-.24,1.39-.36,1.82a6.23,6.23,0,0,1-.65,1.39,7.29,7.29,0,0,0-1.2,1.81,4.93,4.93,0,0,0-.1,1,3.73,3.73,0,0,0,.12.93,5.86,5.86,0,0,1-1.23,0c-.39-.06-.87-.84-1-1.08a.38.38,0,0,0-.68,0c-.23.38-.71,1.07-1.05,1.11-.67.09-2.06,0-3.14,0,0,0,.18-1-.23-1.35S4.3,13.28,4,13l-.83-.93c-.29-.36-.63-1.09-1.25-2C1.56,9.6.89,9,.63,8.52A1.76,1.76,0,0,1,.44,7.2,1.2,1.2,0,0,1,1.8,6.36,2,2,0,0,1,3,6.9a7.59,7.59,0,0,1,.75.75c.16.19.2.27.38.51s.3.46.21.12"/><line class="cls-3" x1="11.39" y1="12.44" x2="11.39" y2="8.98"/><line class="cls-3" x1="9.37" y1="12.45" x2="9.36" y2="8.98"/><line class="cls-3" x1="7.38" y1="9.01" x2="7.4" y2="12.43"/></g></g></svg>
`;

const grabbing = '<svg height="75%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.56 12.27"><defs><style>.cls-1{fill:#fff;}.cls-2,.cls-3{fill:none;stroke:#000;stroke-width:0.75px;}.cls-2{stroke-linejoin:round;}.cls-3{stroke-linecap:round;}</style></defs><title>Asset 2</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M3,1.19c.48-.18,1.42-.07,1.67.47s.4,1.24.41,1.08a6.31,6.31,0,0,1,.14-1.59A1.09,1.09,0,0,1,5.91.46,2,2,0,0,1,6.83.41a1.2,1.2,0,0,1,.76.5A5.4,5.4,0,0,1,8,2.74a6.58,6.58,0,0,1,.28-1.59A1.31,1.31,0,0,1,9,.67a2.81,2.81,0,0,1,1,0,1.42,1.42,0,0,1,.68.48A5.61,5.61,0,0,1,11,2.81c0,.14.07-.39.29-.73a1,1,0,0,1,1.9.63c0,.66,0,.63,0,1.07s0,.83,0,1.2a12.3,12.3,0,0,1-.24,1.74,6.23,6.23,0,0,1-.65,1.39,7.05,7.05,0,0,0-1.19,1.81,4.37,4.37,0,0,0-.11,1,3.73,3.73,0,0,0,.12.93,5.86,5.86,0,0,1-1.23,0c-.39-.06-.87-.84-1-1.08a.38.38,0,0,0-.68,0c-.23.38-.71,1.07-1,1.11-.67.09-2.06,0-3.14,0,0,0,.18-1-.23-1.36S2.91,9.73,2.6,9.45l-.83-.92a4.39,4.39,0,0,1-1.25-2c-.21-.94-.19-1.4,0-1.77a1.54,1.54,0,0,1,.85-.63,1.74,1.74,0,0,1,.88.07,1.12,1.12,0,0,1,.49.39c.23.3.31.45.21.12s-.32-.6-.43-1a4.39,4.39,0,0,1-.38-1.53,1.13,1.13,0,0,1,.83-1"/><path class="cls-2" d="M3,1.19c.48-.18,1.42-.07,1.67.47s.4,1.24.41,1.08a6.31,6.31,0,0,1,.14-1.59A1.09,1.09,0,0,1,5.91.46,2,2,0,0,1,6.83.41a1.2,1.2,0,0,1,.76.5A5.4,5.4,0,0,1,8,2.74a6.58,6.58,0,0,1,.28-1.59A1.31,1.31,0,0,1,9,.67a2.81,2.81,0,0,1,1,0,1.42,1.42,0,0,1,.68.48A5.61,5.61,0,0,1,11,2.81c0,.14.07-.39.29-.73a1,1,0,0,1,1.9.63c0,.66,0,.63,0,1.07s0,.83,0,1.2a12.3,12.3,0,0,1-.24,1.74,6.23,6.23,0,0,1-.65,1.39,7.05,7.05,0,0,0-1.19,1.81,4.37,4.37,0,0,0-.11,1,3.73,3.73,0,0,0,.12.93,5.86,5.86,0,0,1-1.23,0c-.39-.06-.87-.84-1-1.08a.38.38,0,0,0-.68,0c-.23.38-.71,1.07-1,1.11-.67.09-2.06,0-3.14,0,0,0,.18-1-.23-1.36S2.91,9.73,2.6,9.45l-.83-.92a4.39,4.39,0,0,1-1.25-2c-.21-.94-.19-1.4,0-1.77a1.54,1.54,0,0,1,.85-.63,1.74,1.74,0,0,1,.88.07,1.12,1.12,0,0,1,.49.39c.23.3.31.45.21.12s-.32-.6-.43-1a4.39,4.39,0,0,1-.38-1.53A1.13,1.13,0,0,1,3,1.19Z"/><line class="cls-3" x1="10" y1="8.89" x2="10" y2="5.43"/><line class="cls-3" x1="7.99" y1="8.9" x2="7.97" y2="5.43"/><line class="cls-3" x1="5.99" y1="5.46" x2="6.01" y2="8.88"/></g></g></svg>';

cursor.innerHTML = grab;

const pips = {
};

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
let frame = null;

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
    ['front', 'left', 'right', 'back'].forEach((face) => {
      for (let i = 0; i < 3; i++) pips[face][0][i].style.transform = `rotateY(${progress * 90}deg)${tform[face]}`;
    });
  }
  if (i >= unit * 3 && i < unit * 4) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ['front', 'left', 'right', 'back', 'top'].forEach((sideName) => pips[sideName][i][j].style.transform = tform[sideName]);
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
        ['front', 'left', 'right', 'back', 'top'].forEach((sideName) => pips[sideName][i][j].style.transform = tform[sideName]);
      }
    }
  }
}

function shrink() {
  const c = document.getElementById('demo-container');
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
  ['front', 'right', 'top', 'back', 'left'].forEach((face) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        pips[face][i][j].style.transform = tform[face];
      }
    }
  });
}

function setInstruction2() {
  const inst2 = document.getElementById('demo-instruction2');
  inst2.style.visibility = 'visible';
  inst2.style.transform = 'scale(1)';
  inst2.style.opacity = 1;

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
  document.getElementById('demo-next-button').removeEventListener('click', shrink);
  document.getElementById('demo-next-button').addEventListener('click', gotIt);
  document.getElementById('demo-next-button').innerHTML = 'Got it';
}

function hideInstruction(num) {
  const inst = document.getElementById(`demo-instruction${num}`);
  inst.style.visibility = 'hidden';
  inst.style.transform = 'translateY(60%)';
  inst.style.opacity = '0';
}

function showInstruction(num) {
  const inst = document.getElementById(`demo-instruction${num}`);
  inst.style.visibility = 'visible';
  inst.style.transform = 'scale(1)';
  inst.style.opacity = 1;
}

function setCursor(num) {
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
    const modal = document.getElementById('modal');
    modal.style.visibility = 'visible';
    modal.style.opacity = 1;
    modal.style.transform = 'none';
    setTimeout(r, T_DURATION);
  });
}

function hideModal() {
  return new Promise((r) => {
    const modal = document.getElementById('modal');
    modal.style.transform = 'scale(.5)';
    modal.style.opacity = 0;
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
  document.getElementById('instructions-modal').style.display = 'flex';
  document.getElementById('menu-modal').style.display = 'none';
}

export function setInstruction1() {
  showInstruction(1);
  hideInstruction(2);
  setCursor(1);
  cursor.innerHTML = grab;
  resetMx();
  document.getElementById('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;
  document.getElementById('demo-next-button').removeEventListener('click', gotIt);
  document.getElementById('demo-next-button').addEventListener('click', shrink);
  document.getElementById('demo-next-button').innerHTML = 'Next<span>&nbsp;&#8250;</span>';

  i = 0;
  animate();
}

function animate2() {
  function progress(i) { return 0.5 * (1 - Math.cos(i * Math.PI / unit / 2)); }
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

  document.getElementById('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;
}

export const init = () => {
  const modal = document.getElementById('modal');

  modal.style.transition = `${T_DURATION / 1000}s`;

  const hamburger = document.getElementById('hamburger');

  hamburger.addEventListener('click', () => {
    if (modalVisible) {
      hideModal();
      return;
    }
    showModal();
    stopClock();
    document.getElementById('menu-modal').style.display = 'flex';
    document.getElementById('instructions-modal').style.display = 'none';
  });

  document.getElementById('see-instructions').addEventListener('click', () => {
    setInstruction1();
    showInstructionModal();
  });

  document.getElementById('start-over').addEventListener('click', () => {
    hideModal().then(startOver);
  });

  document.getElementById('resume').addEventListener('click', () => {
    hideModal().then(startClock);
  });

  setUserEventsEnabled(false);
  animate();
  document.getElementById('demo-cube').style['transform-origin'] = '50% 50% 0';
  document.getElementById('demo-cube').style.transform = `matrix3D(${MATRIX.elements})translateZ(${s / 2}px)`;

  ['left', 'front', 'right', 'top', 'back', 'bottom'].forEach((sideName) => {
    const side = document.createElement('div');
    pips[sideName] = [[], [], []];
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
        pip.style['transform-origin'] = `${-j * s / 3 + s / 2}px ${-i * s / 3 + s / 2}px ${-s / 2}px`;
        pip.style.transform = tform[sideName];
        pips[sideName][i][j] = pip;
        side.appendChild(pip);
      }
    }
    document.getElementById('demo-cube').appendChild(side);
  });

  pips.front[0][0].id = 'demo';
  document.getElementById('demo-container').appendChild(cursor);
  setCursor(1);

  document.getElementById('demo-next-button').addEventListener('click', shrink);
  document.getElementById('demo-next-button').addEventListener('transitionend', (e) => e.stopPropagation());
};
