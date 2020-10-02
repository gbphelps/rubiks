import getUserTorque from '../getUserTorque';
import { makeTwistProgressFn } from '../utils/animation/TwistProgressFunction';
import { Globals } from '../globals';
import faceManager from '../faceManager';

export default function setAutocorrectTwist(g: Globals, e: MouseEvent) {
  const action = g.action.getAction();
  if (action?.type !== 'twist') throw new Error();
  if (!action.torqueParams) {
    // no twisting has been applied - no need for cleanup.
    g.action.setAction(null);
    return;
  }

  g.events.setUserEventsEnabled(false);

  const torque = getUserTorque(g, e);
  const quarterSlice = Math.PI / 2;

  const toTorque = Math.round(torque / quarterSlice) * quarterSlice;

  const {
    tranche, unitTorque,
  } = action.torqueParams!;

  g.action.setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeTwistProgressFn({
        events: g.events,
        cube: g.cube,
        tranche,
        unitTorque,
        toTorque,
        fromTorque: torque,
        duration: 300,
        addlCleanup: () => {
          g.action.setAction(null);
          faceManager.updateFaces();
        },
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}
