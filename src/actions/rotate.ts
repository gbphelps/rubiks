import { RotateAction, setAction } from '../action';
import { extractScreenCoords } from '../events';
import { rotate } from '../rotation';

export default function applyRotate(e: MouseEvent, action: RotateAction) {
  if (action.type !== 'rotate') throw new Error('Action is not of type `rotate`');

  const screenCoords = extractScreenCoords(e);
  const { x: x2, y: y2 } = screenCoords;
  const { x: x1, y: y1 } = action.prevScreenCoords;
  const delx = x2 - x1;
  const dely = y2 - y1;
  rotate(-dely * 0.5, delx * 0.5, 0);
  setAction({
    type: 'rotate',
    prevScreenCoords: screenCoords,
  });
}
