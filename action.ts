import { Vec2, Vec3, Side, CoordTriad } from "./utils/types";


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
        direction: Vec3,
        axis: keyof Vec3,
        unitTorque: Vec3,
        screenDirection: Vec2,
        tranche: (THREE.Object3D | null)[],
    } | null,
}

export interface TwistAutocorrectAction {
    type: 'twist-autocorrect',
    params: {
        progressFn: ()=>void,
    }
}

let action: Action | null = null;

export function getAction() {
    return action;
}

export function setAction(incomingAction: Action | null) {
    action = incomingAction;
}