import getUserTorque from '../getUserTorque';
import { getAction, setAction } from '../action';
import { progress } from '../utils/animation';
import { setUserEventsEnabled } from '../events';

const DURATION_MS = 300;

interface ProgressFunctionParams {
  tranche: (THREE.Object3D | null)[],
  unitTorque: THREE.Vector3,
  toTorque: number,
}

export function makeProgressFn({ tranche, unitTorque, toTorque }: ProgressFunctionParams) {
  return progress(DURATION_MS, () => {
    setAction({
      type: 'updateRegistry',
      params: {
        tranche,
        unitTorque,
        toTorque,
      },
    });
  });
}

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
    tranche, unitTorque, activeNode,
  } = action.torqueParams!;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeProgressFn({
        tranche,
        unitTorque,
        toTorque,
      }),
      fromTorque: torque,
      toTorque,
      tranche,
      unitTorque,
      activeNode,
    },
  });
}
