import { Vec2, ProjectionData, Vec3 } from "./utils/types";


export interface RotateAction {
    type: 'rotate',
    prevScreenCoords: Vec2, 
}

export interface TwistAction {
    type: 'twist',
    startCubeCoords: Vec3,
    prevCubeCoords: Vec3,
    direction: null | Vec3,
}

let action: RotateAction | TwistAction | null = null;


export function getAction() {
    return action;
}

export function setAction(incomingAction: RotateAction | TwistAction | null) {
    action = incomingAction;
}