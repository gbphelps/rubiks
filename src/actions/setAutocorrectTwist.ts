import getUserTorque from '../getUserTorque';
import { getAction, setAction } from '../action';
import { progress } from '../utils/animation';
import { setUserEventsEnabled } from '../../userEventsEnabled';

const DURATION_MS = 300;

export default function setAutocorrectTwist(e: MouseEvent) {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();
  if (!action.torqueParams) {
    // no twisting has been applied - no need for cleanup.
    setAction(null);
    return;
  }

  setUserEventsEnabled(false);

  const torque = getUserTorque(e);
  const quarterSlice = Math.PI / 2;

  const target = Math.round(torque / quarterSlice) * quarterSlice;

  const { tranche, unitTorque } = action.torqueParams!;

  const cleanup = () => {
    setAction(null);
    setUserEventsEnabled(true);
  };

  const progressFn = progress(DURATION_MS, cleanup);
  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn,
      fromTorque: torque,
      toTorque: target,
      tranche,
      unitTorque,
    },
  });
}
