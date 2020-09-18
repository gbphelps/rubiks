import * as THREE from 'three';
import { clear as clearHistory } from './history';
import { shuffle } from './actions/updateRegistry';
import { setRotation } from './rotation';
import { reset as resetClock } from './clock';
import { setAction } from './action';

export function startOver() {
  setAction(null);
  resetClock();
  clearHistory();
  shuffle(50);
  setRotation({
    mx: new THREE.Matrix4().identity(),
    inv: new THREE.Matrix4().identity(),
  });
}
