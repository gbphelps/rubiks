import { init as initGlobals, globals } from './globals';
import {
  init as initControls, peek,
} from './events';
import {
  init as initHistory,
} from './history';
import {
  init as initClock, setClock,
} from './clock';
import {
  init as initModal, triggerSolvedModal,
} from './modal/instructionsModal';
import {
  init as initOrthoViews,
} from './orthoViews';
// import makeDebugScreen from './utils/debug';
import mouseup from './eventConsumers/mouseup';
import mousedown from './eventConsumers/mousedown';
import mousemove from './eventConsumers/mousemove';
import { shuffle } from './actions/updateRegistry';
import faceManager from './faceManager';
import '../index.scss';
import { getAction } from './action';

// TODO: add circular slider for z rotation surrounding the cube.

document.addEventListener('DOMContentLoaded', () => {
  initGlobals();
  initControls();
  initHistory();
  initClock();
  initModal();
  initOrthoViews();
  disableNativeDrag();

  faceManager.init();

  shuffle(50);

  // const debug = makeDebugScreen();
  // globals.scene!.add(debug);

  function animate() {
    requestAnimationFrame(animate);
    if (faceManager.puzzleSolved) {
      triggerSolvedModal();
      return;
    }

    setClock();
    globals.cube.object!.setRotationFromMatrix(
      globals.cube.rotation.getRotation(),
    );
    globals.cube.object!.updateMatrix();

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
function disableNativeDrag() {
  [
    'drag',
    'dragend',
    'dragenter',
    'dragexit',
    'dragleave',
    'dragover',
    'dragstart',
    'drop',
  ].forEach((type) => {
    document.addEventListener(type, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
}
