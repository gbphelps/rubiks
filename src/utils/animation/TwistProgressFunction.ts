import updateRegistry from '../../actions/updateRegistry';
import { easeInOut, lerp, progress } from '../animation';
import { setUserEventsEnabled } from '../../events';

interface ProgressFunctionParams {
    tranche: (THREE.Object3D | null)[],
    unitTorque: THREE.Vector3,
    fromTorque: number,
    toTorque: number,
    duration: number,
    addlCleanup?: () => void,
  }

export function makeTwistProgressFn({
  tranche, unitTorque, toTorque, fromTorque, duration, addlCleanup,
}: ProgressFunctionParams) {
  return progress(
    duration,
    easeInOut,
    (p: number) => {
      const from = fromTorque;
      const to = toTorque;

      const degrees = lerp(p, from, to);

      tranche.forEach((box) => {
        if (!box) throw new Error();
        box.setRotationFromAxisAngle(
          unitTorque,
          degrees,
        );
      });
    },
    () => {
      updateRegistry(unitTorque, toTorque, tranche);
      setUserEventsEnabled(true);
      if (addlCleanup) addlCleanup();
    },
  );
}
