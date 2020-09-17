import { Quaternion } from 'three';
import { drain } from '../events';
import { getAction, setAction } from '../action';
import setAutocorrectTwist from '../actions/setAutocorrectTwist';
import { deselectCube } from '../boxRegistry';
import { getRotation, getRotationAndInverse } from '../rotation';
import * as history from '../history';

export default function mouseup() {
  deselectCube();

  const e = drain('mouseup');
  if (!e) throw new Error();

  const action = getAction();
  if (!action) return;

  if (action.type === 'rotate') {
    const endRotation = getRotationAndInverse();
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

    setAction(null);
    return;
  }

  if (action.type === 'twist') {
    setAutocorrectTwist(e);
    const newAction = getAction();
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
    return;
  }

  setAction(null);
}
