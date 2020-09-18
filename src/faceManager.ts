import * as THREE from 'three';
import {
  sides, Side, colors,
} from './utils/types';
import { extractSide } from './boxRegistry';
import { getRotation, getRotationAndInverse } from './rotation';
import { push as pushToHistory } from './history';
import { setUserEventsEnabled } from './events';
import { setAction } from './action';
import { makeQuaternionProgressFn } from './utils/animation/QuaternionProgressFunction';

function makeBox(faceElement: HTMLDivElement) {
  const black = document.createElement('div');
  black.classList.add('black');
  const decal = document.createElement('div');
  decal.classList.add('decal');
  black.appendChild(decal);
  faceElement.appendChild(black);
  return decal;
}

const one = () => new THREE.Matrix4().identity();

const matrix: Record<Side, THREE.Matrix4> = {
  front: one(),
  left: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(Math.PI / 2),
    one(),
  ),
  right: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(-Math.PI / 2),
    one(),
  ),
  back: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI),
    one(),
  ),
  top: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI / 2),
    one(),
  ),
  bottom: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    one(),
  ),
};

const inv: Record<Side, THREE.Matrix4> = {
  front: one(),
  left: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(-Math.PI / 2),
    one(),
  ),
  right: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationY(Math.PI / 2),
    one(),
  ),
  back: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI),
    one(),
  ),
  top: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    one(),
  ),
  bottom: new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(Math.PI / 2),
    one(),
  ),
};

function makeFace(id: Side) {
  const faceElement = document.getElementById(id) as HTMLDivElement;
  faceElement.addEventListener('click', () => {
    pushToHistory({
      type: 'rotate',
      params: {
        startRotation: getRotationAndInverse(),
        endRotation: {
          mx: matrix[id],
          inv: inv[id],
        },
      },
    });
    setUserEventsEnabled(false);
    const toQ = new THREE.Quaternion().setFromRotationMatrix(matrix[id]);
    const fromQ = new THREE.Quaternion().setFromRotationMatrix(getRotation());
    const progressFn = makeQuaternionProgressFn({
      toQ,
      fromQ,
      invMatrix: inv[id],
      cb: () => { setUserEventsEnabled(true); },
    });

    setAction({
      type: 'rotate-autocorrect',
      params: {
        progressFn,
      },
    });
  });
  const face: HTMLDivElement[][] = [];
  for (let i = 0; i < 3; i++) {
    face.push([]);
    for (let j = 0; j < 3; j++) {
      face[i][j] = makeBox(faceElement);
    }
  }
  return face;
}

function getHex(color: string | number) {
  if (typeof color === 'string') return color;
  let str = color.toString(16);
  while (str.length < 6) str = `0${str}`;
  return `#${str}`;
}

class FaceManager {
    left: HTMLDivElement[][];

    right: HTMLDivElement[][];

    top: HTMLDivElement[][];

    bottom: HTMLDivElement[][];

    front: HTMLDivElement[][];

    back: HTMLDivElement[][];

    init() {
      sides.forEach((side) => {
        this[side] = makeFace(side);
      });
    }

    set(side: Side, colorNames: string[][]) {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          const threeColor = colors[colorNames[x][y]];
          const color = getHex(threeColor);
          this[side][2 - y][x].style.background = color;
        }
      }
    }

    updateFaces() {
      sides.forEach((side) => {
        const colors = extractSide(side);
        this.set(side, colors);
      });
    }
}

export default new FaceManager();
