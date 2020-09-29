import { drain } from '../events';
import setAutocorrectTwist from '../actions/setAutocorrectTwist';
import * as history from '../history';
import { globals } from '../globals';

export default function mouseup() {
  globals.cube.registry.deselectCube();

  const e = drain('mouseup');
  if (!e) throw new Error();

  const action = globals.action.getAction();
  if (!action) return;

  if (action.type === 'rotate') {
    const endRotation = globals.cube.rotation.getRotationAndInverse();
    const { startRotation } = action;

    const moveLog: history.RotateMove = {
      type: 'rotate',
      params: {
        endRotation,
        startRotation,
      },
    };

    if (!startRotation.mx.equals(endRotation.mx)) {
      history.push(moveLog);
    }

    globals.action.setAction(null);
    return;
  }

  if (action.type === 'twist') {
    setAutocorrectTwist(e);
    const newAction = globals.action.getAction();
    if (newAction?.type !== 'twist-autocorrect') return; // NOTE: this condition is encountered if user clicks without dragging

    const {
      unitTorque, toTorque, tranche,
    } = newAction.params;

    if (toTorque === 0) return;

    const moveLog: history.TwistMove = {
      type: 'twist',
      params: {
        unitTorque,
        toTorque,
        tranche,
      },
    };
    history.push(moveLog);
  }
}
