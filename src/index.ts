import { globals } from './globals';
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

// TODO: add circular slider for z rotation surrounding the cube.

document.addEventListener('DOMContentLoaded', () => {
  globals.init();
  initHistory(globals);
  initClock();
  initModal();
  initOrthoViews(globals, globals.events);
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
    globals.cube.updateRotation();
    globals.cube.object!.updateMatrix();

    const action = globals.action.getAction();
    if (action?.type === 'twist-autocorrect') action.params.progressFn();
    if (action?.type === 'rotate-autocorrect') action.params.progressFn();

    if (globals.events.peek('mousedown')) mousedown(globals);
    if (globals.events.peek('mouseup')) mouseup(globals);
    if (globals.events.peek('mousemove')) mousemove(globals);
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
