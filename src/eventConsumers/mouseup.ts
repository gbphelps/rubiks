import { drain } from '../events';
import { getAction, setAction } from '../action';
import setAutocorrectTwist from '../actions/setAutocorrectTwist';
import { deselectCube } from '../boxRegistry';

export default function mouseup() {
  deselectCube();

  const e = drain('mouseup');
  if (!e) throw new Error();

  const action = getAction();
  if (!action) return;

  if (action.type === 'twist') {
    setAutocorrectTwist(e);
    return;
  }

  setAction(null);
}
