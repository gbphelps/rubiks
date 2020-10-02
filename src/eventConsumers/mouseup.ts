import setAutocorrectTwist from '../actions/setAutocorrectTwist';
import * as history from '../history';
import { Globals } from '../globals';

export default function mouseup(g: Globals) {
  g.cube.registry.deselectCube();

  const e = g.events.drain('mouseup');
  if (!e) throw new Error();

  const action = g.action.getAction();
  if (!action) return;

  if (action.type === 'rotate') {
    const endRotation = g.cube.rotation.getRotationAndInverse();
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

    g.action.setAction(null);
    return;
  }

  if (action.type === 'twist') {
    setAutocorrectTwist(g, e);
    const newAction = g.action.getAction();
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
        staticLocation: tranche[0]!.children[0].position.clone(),
      },
    };
    history.push(moveLog);
  }
}
