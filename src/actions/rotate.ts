import { setAction, getAction } from '../action';
import { extractScreenCoords } from '../events';
import { globals } from '../globals';

export default function applyRotate(e: MouseEvent) {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'rotate') throw new Error('Action is not of type `rotate`');

  const screenCoords = extractScreenCoords(e);
  const { x: x2, y: y2 } = screenCoords;
  const { x: x1, y: y1 } = action.prevScreenCoords;
  const delx = x2 - x1;
  const dely = y2 - y1;
  globals.cube.rotation.rotate(-dely * 0.5, delx * 0.5, 0);
  setAction({
    type: 'rotate',
    prevScreenCoords: screenCoords,
    startRotation: action.startRotation,
  });
}
