import { easeInOut, lerp, progress } from '../animation';
import { setUserEventsEnabled } from '../../events';
import { CubeManager } from '../../cubeSpawn';

interface ProgressFunctionParams {
    tranche: (THREE.Object3D | null)[],
    unitTorque: THREE.Vector3,
    fromTorque: number,
    toTorque: number,
    duration: number,
    addlCleanup?: () => void,
    cube: CubeManager,
  }

export function makeTwistProgressFn({
  tranche,
  unitTorque,
  toTorque,
  fromTorque,
  duration,
  addlCleanup,
  cube,
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
      cube.registry.updateRegistry(tranche);
      setUserEventsEnabled(true);
      if (addlCleanup) addlCleanup();
    },
  );
}
