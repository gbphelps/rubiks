import getUserTorque from '../getUserTorque';
import { setUserEventsEnabled } from '../events';
import { makeTwistProgressFn } from '../utils/animation/TwistProgressFunction';
import { globals } from '../globals';

export default function setAutocorrectTwist(e: MouseEvent) {
  const action = globals.action.getAction();
  if (action?.type !== 'twist') throw new Error();
  if (!action.torqueParams) {
    // no twisting has been applied - no need for cleanup.
    globals.action.setAction(null);
    return;
  }

  setUserEventsEnabled(false);

  const torque = getUserTorque(e);
  const quarterSlice = Math.PI / 2;

  const toTorque = Math.round(torque / quarterSlice) * quarterSlice;

  const {
    tranche, unitTorque,
  } = action.torqueParams!;

  globals.action.setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        cube: globals.cube,
        tranche,
        unitTorque,
        toTorque,
        fromTorque: torque,
        duration: 300,
        addlCleanup: () => { globals.action.setAction(null); },
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}
