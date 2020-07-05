import { Vec2, Vec3, Side, CoordTriad } from "./utils/types";


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
    } | null,
}

let action: RotateAction | TwistAction | null = null;


export function getAction() {
    return action;
}

export function setAction(incomingAction: RotateAction | TwistAction | null) {
    action = incomingAction;
}