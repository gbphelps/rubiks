import getUserTorque from '../getUserTorque';
import { getAction, setAction } from '../action';
import { progress } from '../utils/animation';

const DURATION_MS = 500;

export default function setAutocorrectTwist(e: MouseEvent) {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();
  if (!action.torqueParams) {
    // no twisting has been applied - no need for cleanup.
    setAction(null);
    return;
  }
  const torque = getUserTorque(e);
  const quarterSlice = Math.PI / 2;
  const target = {
    x: Math.round(torque.x / quarterSlice) * quarterSlice,
    y: Math.round(torque.y / quarterSlice) * quarterSlice,
    z: Math.round(torque.z / quarterSlice) * quarterSlice,
  };

  const { tranche } = action.torqueParams!;

  const cleanup = () => setAction(null);
  const progressFn = progress(DURATION_MS, cleanup);
  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn,
      fromTorque: torque,
      toTorque: target,
      tranche,
    },
  });
}
