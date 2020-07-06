import { getAction } from './action';
import { extractScreenCoords } from './events';
import { dotProd } from './utils/matrix';

export default function getUserTorque(e: MouseEvent) {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();
  if (!action.torqueParams) throw new Error();

  if (!action.torqueParams) throw new Error();
  const {
    screenDirection,
  } = action.torqueParams;

  const { x: x2, y: y2 } = extractScreenCoords(e);
  const { x: x1, y: y1 } = action.startPosition.screenCoords;
  const userDir = {
    x: x2 - x1,
    y: y2 - y1,
  };

  const magnitudeAsRotation = dotProd(userDir, screenDirection);
  return magnitudeAsRotation;
}
