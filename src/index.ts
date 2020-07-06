import * as THREE from 'three';
import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import { getRotation } from './rotation';
import {
  init as initControls, drain, peek,
} from './events';
import makeDebugScreen from './utils/debug';
import { Face } from './utils/types';
import * as boxRegistry from './boxRegistry';
import { getAction } from './action';
import applyTwist from './actions/twist';
import applyRotate from './actions/rotate';
import autocorrectTwist from './actions/autocorrectTwist';
import mouseup from './eventConsumers/mouseup';
import mousedown from './eventConsumers/mousedown';
import mousemove from './eventConsumers/mousemove';

function getInitialDecals(x: number, y: number, z: number) {
  const decals: Face[] = [];
  if (z === 1) {
    decals.push({ side: 'front', color: new THREE.Color('lime') });
  } else if (z === -1) {
    decals.push({ side: 'back', color: new THREE.Color('yellow') });
  }

  if (x === 1) {
    decals.push({ side: 'right', color: new THREE.Color('red') });
  } else if (x === -1) {
    decals.push({ side: 'left', color: new THREE.Color('orange') });
  }

  if (y === 1) {
    decals.push({ side: 'top', color: new THREE.Color('white') });
  } else if (y === -1) {
    decals.push({ side: 'bottom', color: new THREE.Color('blue') });
  }

  return decals;
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobals();
  initControls();

  const cube = new THREE.Object3D();

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const decals = getInitialDecals(x, y, z);
        const box = cubeSpawn(decals, { x, y, z });
        boxRegistry.registerBox({
          x: x + 1,
          y: y + 1,
          z: z + 1,
        }, box);
        cube.add(box);
      }
    }
  }

    globals.scene!.add(cube);

    const debug = makeDebugScreen();
    globals.scene!.add(debug);

    function animate() {
      requestAnimationFrame(animate);
      cube.setRotationFromMatrix(getRotation());
      cube.updateMatrix();

      autocorrectTwist(); // todo disable other actions while this is happening.

      if (peek('mousedown')) mousedown();
      if (peek('mouseup')) mouseup();
      if (peek('mousemove')) mousemove();
        globals.render!();
    }

    animate();
});

/// //////////////////////////////////////////////////////
