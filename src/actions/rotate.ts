import { Globals } from '../globals';

export default function applyRotate(g: Globals, e: MouseEvent) {
  const action = g.action.getAction();
  if (!action) throw new Error();
  if (action.type !== 'rotate') throw new Error('Action is not of type `rotate`');

  const screenCoords = g.events.extractScreenCoords(e);
  const { x: x2, y: y2 } = screenCoords;
  const { x: x1, y: y1 } = action.prevScreenCoords;
  const delx = x2 - x1;
  const dely = y2 - y1;
  g.cube.rotation.rotate(-dely * 0.5, delx * 0.5, 0);
  g.action.setAction({
    type: 'rotate',
    prevScreenCoords: screenCoords,
    startRotation: action.startRotation,
  });
}
