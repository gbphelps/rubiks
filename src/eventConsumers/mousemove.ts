import applyRotate from '../actions/rotate';
import applyTwist from '../actions/twist';
import { Globals } from '../globals';

export default function mousemove(g: Globals) {
  const e = g.events.drain('mousemove');
  if (!e) return;

  const action = g.action.getAction();

  if (!action) return;
  if (action.type === 'rotate') applyRotate(g, e);
  if (action.type === 'twist') applyTwist(g, e);
}
