import getUserTorque from '../getUserTorque';
import { getAction, setAction } from '../action';
import { progress, easeInOut, lerp } from '../utils/animation';
import { setUserEventsEnabled } from '../events';

const DURATION_MS = 300;

interface ProgressFunctionParams {
  tranche: (THREE.Object3D | null)[],
  unitTorque: THREE.Vector3,
  fromTorque: number,
  toTorque: number,
}

export function makeProgressFn({
  tranche, unitTorque, toTorque, fromTorque,
}: ProgressFunctionParams) {
  return progress(
    DURATION_MS,
    easeInOut,
    (p: number) => {
      const from = fromTorque;
      const to = toTorque;

      tranche.forEach((box) => {
        if (!box) throw new Error();
        box.setRotationFromAxisAngle(
          unitTorque,
          lerp(p, from, to),
        );
      });
    },
    () => {
      setAction({
        type: 'updateRegistry',
        params: {
          tranche,
          unitTorque,
          toTorque,
        },
      });
    },
  );
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
    tranche, unitTorque,
  } = action.torqueParams!;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeProgressFn({
        tranche,
        unitTorque,
        toTorque,
        fromTorque: torque,
      }),
      tranche,
      unitTorque,
      toTorque,
    },
  });
}
