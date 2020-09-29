import {
  Side, CoordTriad,
} from './utils/types';

type Action = |
  RotateAction |
  TwistAction |
  TwistAutocorrectAction |
  RotateAutocorrectAction;

export interface RotateAction {
    type: 'rotate',
    prevScreenCoords: THREE.Vector2,
    startRotation: {
      mx: THREE.Matrix4,
      inv: THREE.Matrix4,
    },
}

export interface TwistAction {
    type: 'twist',
    startPosition: CoordTriad,
    side: Side,
    torqueParams: {
        direction: THREE.Vector3,
        unitTorque: THREE.Vector3,
        activeNode: THREE.Vector3,
        screenDirection: THREE.Vector2,
        tranche: (THREE.Object3D | null)[],
    } | null,
}

export interface TwistAutocorrectAction {
    type: 'twist-autocorrect',
    params: {
        progressFn: ()=>void,
        tranche: (THREE.Object3D | null)[],
        unitTorque: THREE.Vector3,
        toTorque: number,
    }
}

export interface RotateAutocorrectAction {
  type: 'rotate-autocorrect',
  params: {
      progressFn: ()=>void,
  }
}

export default class ActionManager {
  action: Action | null = null;

  getAction() {
    return this.action;
  }

  setAction(incomingAction: Action | null) {
    this.action = incomingAction;
  }
}
