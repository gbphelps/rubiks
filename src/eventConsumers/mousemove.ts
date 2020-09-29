import { drain } from '../events';
import applyRotate from '../actions/rotate';
import applyTwist from '../actions/twist';
import { globals } from '../globals';

export default function mousemove() {
  const e = drain('mousemove');
  if (!e) return;

  const action = globals.action.getAction();

  if (!action) return;
  if (action.type === 'rotate') applyRotate(e);
  if (action.type === 'twist') applyTwist(e);
}
