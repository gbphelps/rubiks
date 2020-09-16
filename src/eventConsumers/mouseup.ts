import { Quaternion } from 'three';
import { drain } from '../events';
import { getAction, setAction } from '../action';
import setAutocorrectTwist from '../actions/setAutocorrectTwist';
import { deselectCube } from '../boxRegistry';
import { getRotation } from '../rotation';
import * as history from '../history';

export default function mouseup() {
  deselectCube();

  const e = drain('mouseup');
  if (!e) throw new Error();

  const action = getAction();
  if (!action) return;

  if (action.type === 'rotate') {
    const moveLog = {
      type: 'rotation',
      startRotation: action.startRotation,
      endRotation: new Quaternion().setFromRotationMatrix(getRotation()),
    };

    if (!moveLog.startRotation.equals(moveLog.endRotation)) {
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
      unitTorque, toTorque, tranche, activeNode,
    } = newAction.params;

    if (toTorque === 0) return;

    const moveLog = {
      type: 'twist',
      params: {
        unitTorque,
        toTorque,
        tranche,
        activeNode,
      },
    };
    history.push(moveLog);
    return;
  }

  setAction(null);
}
