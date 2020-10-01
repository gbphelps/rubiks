import * as THREE from 'three';
import { Globals } from '../globals';
import RotationManager from '../rotation';
import { easeInOut } from '../utils/animation';
import * as timeouts from './timeouts';
import grab from './grab.svg';
import grabbing from './grabbing.svg';

const rotations: THREE.Matrix4[] = [];
const cursorLocations: THREE.Vector2[] = [];

const MATRIX = new THREE.Matrix4().makeRotationY(-Math.PI / 4)
  .premultiply(
    new THREE.Matrix4().makeRotationX(Math.asin(1 / Math.sqrt(3))),
  );

const R = new RotationManager();
R.setRotation({ mx: MATRIX });

(function init() {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 91; i++) {
    const xprev = x;
    const yprev = y;
    const p = easeInOut(i / 90);
    x = 1 - Math.cos(p * 2 * Math.PI);
    y = Math.sin(p * Math.PI * 2);

    const cursorX = -x;
    const cursorY = y;

    R.rotate((y - yprev), (xprev - x), 0);
    rotations.push(R.getRotation());

    cursorLocations.push(new THREE.Vector2(cursorX, cursorY));
  }
}());

function rotate(
  g: Globals,
  getStart: () => THREE.Vector2,
  cursor: HTMLDivElement,
  callback: () => void,
  direction: number,
) {
  let i = 0;
  return function tick() {
    const s = getStart();
    const frame = direction === 1 ? i : cursorLocations.length - 1 - i;
    const { x, y } = cursorLocations[frame];
    const rot = rotations[frame];
    cursor.style.left = `${s.x + g.pixPerUnit * x}px`;
    cursor.style.top = `${s.y + g.pixPerUnit * y}px`;
    g.cube.rotation.setRotation({ mx: rot });
    g.cube.updateRotation();
    if (i === cursorLocations.length - 1) callback();
    i++;
  };
}

export function rotateForward(
  g: Globals,
  getStart: () => THREE.Vector2,
  cursor: HTMLDivElement,
) {
  cursor.innerHTML = grab;
  timeouts.setTimeouts([
    setTimeout(() => {
      cursor.innerHTML = grabbing;
    }, 500),
    setTimeout(() => {
      g.action.setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn: rotate(g, getStart, cursor, () => rotateBackward(
            g, getStart, cursor,
          ), 1),
        },
      });
    }, 1000),
  ]);
}

function rotateBackward(
  g: Globals,
  getStart: () => THREE.Vector2,
  cursor: HTMLDivElement,
) {
  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: rotate(g, getStart, cursor, () => rotateForward(
        g, getStart, cursor,
      ), -1),
    },
  });
}
