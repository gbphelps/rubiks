import * as THREE from 'three';
import { clear as clearHistory } from './history';
import { shuffle } from './actions/updateRegistry';
import { reset as resetClock } from './clock';
import faceManager from './faceManager';
import { Globals } from './globals';

export function startOver(g: Globals) {
  const action = g.action.getAction();

  if (action?.type === 'twist-autocorrect') {
    action.params.tranche.forEach((box) => {
      if (!box) return;
      box.setRotationFromMatrix(new THREE.Matrix4().identity());
      box.updateMatrix();
    });
  }

  faceManager.puzzleSolved = false;
  g.events.setUserEventsEnabled(true);
  g.action.setAction(null);
  resetClock();
  clearHistory();
  shuffle(50);
  g.cube.rotation.setRotation({
    mx: new THREE.Matrix4().identity(),
    inv: new THREE.Matrix4().identity(),
  });
}
