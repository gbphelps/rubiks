import * as THREE from 'three';
import { clear as clearHistory } from './history';
import { shuffle } from './actions/updateRegistry';
import { setRotation } from './rotation';
import { reset as resetClock } from './clock';
import { setAction, getAction } from './action';
import { setUserEventsEnabled } from './events';
import faceManager from './faceManager';

export function startOver() {
  const action = getAction();

  if (action?.type === 'twist-autocorrect') {
    action.params.tranche.forEach((box) => {
      if (!box) return;
      box.setRotationFromMatrix(new THREE.Matrix4().identity());
      box.updateMatrix();
    });
  }

  faceManager.puzzleSolved = false;
  setUserEventsEnabled(true);
  setAction(null);
  resetClock();
  clearHistory();
  shuffle(50);
  setRotation({
    mx: new THREE.Matrix4().identity(),
    inv: new THREE.Matrix4().identity(),
  });
}
