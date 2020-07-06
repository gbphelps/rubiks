import { drain } from '../events';
import { getAction } from '../action';
import applyRotate from '../actions/rotate';
import applyTwist from '../actions/twist';

export default function mousemove() {
  const e = drain('mousemove');
  if (!e) return;

  // const screenCoords = extractScreenCoords(e);
  // const data = getProjectionOntoCube(screenCoords);

  const action = getAction();

  if (!action) return;
  if (action.type === 'rotate') applyRotate(e);
  if (action.type === 'twist') applyTwist(e);
}
