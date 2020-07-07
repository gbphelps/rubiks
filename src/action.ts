import {
  Vec2, Side, CoordTriad, Axis,
} from './utils/types';

type Action = RotateAction | TwistAction | TwistAutocorrectAction;

export interface RotateAction {
    type: 'rotate',
    prevScreenCoords: Vec2,
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

let action: Action | null = null;

export function getAction() {
  return action;
}

export function setAction(incomingAction: Action | null) {
  action = incomingAction;
}
