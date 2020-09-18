import * as THREE from 'three';
import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import { getRotation } from './rotation';
import {
  init as initControls, peek,
} from './events';
import {
  init as initHistory,
} from './history';
import {
  init as initClock, setClock,
  stop as stopClock,
} from './clock';
import {
  init as initModal,
  reset as resetModal,
} from './modal/instructionsModal';

// import makeDebugScreen from './utils/debug';
import { Face } from './utils/types';
import * as boxRegistry from './boxRegistry';
import mouseup from './eventConsumers/mouseup';
import mousedown from './eventConsumers/mousedown';
import mousemove from './eventConsumers/mousemove';
import { shuffle } from './actions/updateRegistry';
import faceManager from './faceManager';
import '../index.scss';
import { getAction } from './action';

// TODO: add circular slider for z rotation surrounding the cube.

function getInitialDecals(x: number, y: number, z: number) {
  const decals: Face[] = [];
  if (z === 1) {
    decals.push({ side: 'front', color: 'green' });
  } else if (z === -1) {
    decals.push({ side: 'back', color: 'yellow' });
  }

  if (x === 1) {
    decals.push({ side: 'right', color: 'red' });
  } else if (x === -1) {
    decals.push({ side: 'left', color: 'orange' });
  }

  if (y === 1) {
    decals.push({ side: 'top', color: 'white' });
  } else if (y === -1) {
    decals.push({ side: 'bottom', color: 'blue' });
  }

  return decals;
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobals();
  initControls();
  initHistory();
  initClock();
  initModal();
  document.getElementById('help-button')!.addEventListener('click', () => {
    resetModal();
    stopClock();
  });

  faceManager.init();

  const cube = new THREE.Object3D();

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const decals = getInitialDecals(x, y, z);
        const box = cubeSpawn(decals, new THREE.Vector3(x, y, z));
        boxRegistry.registerBox(
          new THREE.Vector3(x + 1, y + 1, z + 1),
          box,
        );
        cube.add(box);
      }
    }
  }

  shuffle(50);

    globals.scene!.add(cube);

    // const debug = makeDebugScreen();
    // globals.scene!.add(debug);

    function animate() {
      requestAnimationFrame(animate);
      setClock();
      cube.setRotationFromMatrix(getRotation());
      cube.updateMatrix();

      const action = getAction();
      if (action?.type === 'twist-autocorrect') action.params.progressFn();
      if (action?.type === 'rotate-autocorrect') action.params.progressFn();

      if (peek('mousedown')) mousedown();
      if (peek('mouseup')) mouseup();
      if (peek('mousemove')) mousemove();
      globals.render!();
    }

    animate();
});

/// //////////////////////////////////////////////////////
