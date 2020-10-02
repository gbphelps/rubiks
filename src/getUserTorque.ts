import * as THREE from 'three';
import { Globals } from './globals';
import { dotProd } from './utils/matrix';

export default function getUserTorque(g: Globals, e: MouseEvent) {
  const action = g.action.getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();
  if (!action.torqueParams) throw new Error();

  if (!action.torqueParams) throw new Error();
  const {
    screenDirection,
  } = action.torqueParams;

  const { x: x2, y: y2 } = g.events.extractScreenCoords(e);
  const { x: x1, y: y1 } = action.startPosition.screenCoords;
  const userDir = new THREE.Vector2(x2 - x1, y2 - y1);

  const magnitudeAsRotation = dotProd(userDir, screenDirection);
  return magnitudeAsRotation;
}
