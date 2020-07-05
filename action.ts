import { Vec2, Vec3, Side } from "./utils/types";


export interface RotateAction {
    type: 'rotate',
    prevScreenCoords: Vec2, 
}

export interface TwistAction {
    type: 'twist',
    startPosition: {
        cubeCoords: Vec3,
        cameraCoords: Vec3,
        screenCoords: Vec2,
    },
    direction: null | Vec3,
    side: Side,
    axis: null | keyof Vec3,
    unitTorque: null | Vec3,
}

let action: RotateAction | TwistAction | null = null;


export function getAction() {
    return action;
}

export function setAction(incomingAction: RotateAction | TwistAction | null) {
    action = incomingAction;
}