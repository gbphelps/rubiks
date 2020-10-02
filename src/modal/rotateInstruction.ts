import * as THREE from 'three';
import { Vector2 } from 'three';
import { Globals } from '../globals';
import RotationManager from '../rotation';
import { easeInOut } from '../utils/animation';
import * as timeouts from './timeouts';
import grab from './grab.svg';
import grabbing from './grabbing.svg';
import { setCursorPosition } from './cursorPosition';

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

    cursorLocations.push(new THREE.Vector2(cursorX * 2, -cursorY * 2));
  }
}());

function getId(id: string) {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Element with ID ${id} was not found in the DOM tree! Did you delete anything from index.html?`);
  return result;
}

function rotate(
  g: Globals,
  callback: () => void,
  direction: number,
  getStart: () => Vector2,
) {
  let i = 0;
  return function tick() {
    const start = getStart();
    const frame = direction === 1 ? i : cursorLocations.length - 1 - i;
    const rot = rotations[frame];
    setCursorPosition(g, new THREE.Vector2().addVectors(
      cursorLocations[frame],
      start,
    ));
    g.cube.rotation.setRotation({ mx: rot });
    g.cube.updateRotation();
    if (i === cursorLocations.length - 1) callback();
    i++;
  };
}

export function rotateForward(
  g: Globals,
  getStart: () => THREE.Vector2,
) {
  getId('cursor').innerHTML = grab;
  timeouts.setTimeouts([
    setTimeout(() => {
      getId('cursor').innerHTML = grabbing;
    }, 500),
    setTimeout(() => {
      g.action.setAction({
        type: 'rotate-autocorrect',
        params: {
          progressFn: rotate(
            g, () => rotateBackward(g, getStart), 1, getStart,
          ),
        },
      });
    }, 1000),
  ]);
}

function rotateBackward(
  g: Globals,
  getStart: () => THREE.Vector2,
) {
  g.action.setAction({
    type: 'rotate-autocorrect',
    params: {
      progressFn: rotate(g, () => {
        g.action.setAction(null);
        rotateForward(g, getStart);
      }, -1, getStart),
    },
  });
}
