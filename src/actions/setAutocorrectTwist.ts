import getUserTorque from '../getUserTorque';
import { getAction, setAction } from '../action';
import { setUserEventsEnabled } from '../events';
import { makeTwistProgressFn } from '../utils/animation/TwistProgressFunction';

export default function setAutocorrectTwist(e: MouseEvent) {
  const action = getAction();
  if (action?.type !== 'twist') throw new Error();
  if (!action.torqueParams) {
    // no twisting has been applied - no need for cleanup.
    setAction(null);
    return;
  }

  setUserEventsEnabled(false);

  const torque = getUserTorque(e);
  const quarterSlice = Math.PI / 2;

  const toTorque = Math.round(torque / quarterSlice) * quarterSlice;

  const {
    tranche, unitTorque,
  } = action.torqueParams!;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        tranche,
        unitTorque,
        toTorque,
        fromTorque: torque,
        duration: 300,
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}
