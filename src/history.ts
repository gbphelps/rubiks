import { setAction } from './action';
import { makeProgressFn } from './actions/setAutocorrectTwist';
import { getUserEventsEnabled, setUserEventsEnabled } from './events';

type TwistMove = {
    type: 'twist',
    params: {
        unitTorque: THREE.Vector3,
        toTorque: number,
        tranche: (THREE.Object3D | null)[],
        activeNode: THREE.Vector3,
    }
}

type MoveLog = TwistMove;

let moveManifest: MoveLog[] = [];
let manifestIndex = 0;
let eventsWereEnabled = true;

export function init() {
  const undoBtn = document.getElementById('undo');
  undoBtn!.addEventListener('click', undo);
  undoBtn!.addEventListener('mousedown', () => {
    eventsWereEnabled = getUserEventsEnabled();
    setUserEventsEnabled(false);
  });
}

export function push(moveLog: any): void {
  moveManifest = moveManifest.slice(0, manifestIndex);
  moveManifest.push(moveLog);
  manifestIndex++;
  getManifest();
}

export function undo(): void {
  if (!eventsWereEnabled) return;

  manifestIndex--;
  const {
    unitTorque, toTorque, tranche, activeNode,
  } = moveManifest[manifestIndex].params;

  setAction({
    type: 'twist-autocorrect',
    params: {
      progressFn: makeProgressFn({
        tranche,
        unitTorque,
        toTorque: -toTorque,
      }),
      fromTorque: 0,
      toTorque: -toTorque,
      tranche,
      unitTorque,
      activeNode,
    },
  });
}

export function getManifest() {
  return moveManifest;
}
