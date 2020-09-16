import {
  Vec2, Side, CoordTriad,
} from './utils/types';

type Action = RotateAction | TwistAction | TwistAutocorrectAction | UpdateRegistryAction;

export interface RotateAction {
    type: 'rotate',
    prevScreenCoords: Vec2,
    startRotation: THREE.Quaternion,
}

export interface TwistAction {
    type: 'twist',
    startPosition: CoordTriad,
    side: Side,
    torqueParams: {
        direction: THREE.Vector3,
        unitTorque: THREE.Vector3,
        activeNode: THREE.Vector3,
        screenDirection: Vec2,
        tranche: (THREE.Object3D | null)[],
    } | null,
}

export interface TwistAutocorrectAction {
    type: 'twist-autocorrect',
    params: {
        progressFn: ()=>number,
        fromTorque: number,
        toTorque: number,
        unitTorque: THREE.Vector3,
        tranche: (THREE.Object3D | null)[],
        activeNode: THREE.Vector3,
    }
}

export interface UpdateRegistryAction {
  type: 'updateRegistry',
  params: {
      tranche: (THREE.Object3D | null)[],
      unitTorque: THREE.Vector3,
      toTorque: number,
  }
}

let action: Action | null = null;

export function getAction() {
  return action;
}

export function setAction(incomingAction: Action | null) {
  action = incomingAction;
}
