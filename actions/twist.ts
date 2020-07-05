import { setAction, TwistAction, getAction } from "../action";
import { extractScreenCoords } from "../events";
import { getProjectionOntoSide } from "../cubeProjections";
import { Vec3, getNormal_cubeSpace } from "../utils/types";
import { XProd, X, Rx, Ry, Rz, Matrix2Tuple, unitVector } from "../utils/matrix";
import { getTranche } from "../boxRegistry";
import * as THREE from "three";
import { globals } from "../globals";

const THRESHHOLD = .1;


function getCardinalDirection(vec: Vec3){
    // Gives cardinal unit vector that most closely corresponds to vec.

    let ordinate: null | keyof Vec3 = null;
    let coords: (keyof Vec3)[] = ['x','y','z'];
    
    for (let i=0; i<3; i++){
        const testDimension = coords[i];
        if (!ordinate){
            ordinate = coords[i];
            continue;
        } else if (Math.abs(vec[ordinate]) < Math.abs(vec[testDimension])) {
            ordinate = testDimension;
        }
    }

    const result: Vec3 = {
        x: 0,
        y: 0,
        z: 0,
    }

    for (let i=0; i<3; i++){
        const testDimension = coords[i];
        if (testDimension === ordinate){
            result[ordinate] = vec[ordinate] > 0 ? 1 : -1;
        }
    }

    return result;
}

function scalarProjection(a: Vec3, b: Vec3){
    const {x: x1, y: y1, z: z1} = a;
    const {x: x2, y: y2, z: z2} = b;
    const bdotb = x2*x2 + y2*y2 + z2*z2;
    const adotb = x1*x2 + y1*y2 + z1*z2;
    return adotb / bdotb; 
}

function getTorque(e: MouseEvent){
    const action = getAction();
    if (!action) throw new Error('No active action');
    if (action.type !== 'twist') throw new Error('Torque can only be extracted when action type is `twist`');
    if (!action.direction) throw new Error('No direction on action');
    if (!action.unitTorque) throw new Error('No unitTorque on action');
    
    const { x: x1, y: y1, z: z1 } = action.startPosition.cubeCoords;
    const screenCoords = extractScreenCoords(e);
    const { cubeCoords: { x: x2, y: y2, z: z2 } } = getProjectionOntoSide(screenCoords, action.side);

    const vec = {
        x: x2 - x1,
        y: y2 - y1,
        z: z2 - z1,
    };

    const theta = scalarProjection(vec, action.direction);

    return {
        x: theta * action.unitTorque.x,
        y: theta * action.unitTorque.y,
        z: theta * action.unitTorque.z,
    }
}

export default function applyTwist(e: MouseEvent, action: TwistAction){
    const screenCoords = extractScreenCoords(e);
    const { cubeCoords } = getProjectionOntoSide(screenCoords, action.side);

    const {x: x2, y: y2, z: z2} = cubeCoords;
    const {x: x1, y: y1, z: z1} = action.startPosition.cubeCoords;

    const vec = {
        x: x2 - x1,
        y: y2 - y1,
        z: z2 - z1,
    };

    if (!action.direction) {
        // When user first starts dragging, we don't have a good sense for
        // which direction they want to drag in. So we wait until their drag
        // distance has reached a certain threshhold here. Note that THRESHHOLD
        // is in screen units (the cube is 3x3x3 in screen units).
        const dragDistance = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);

        if (dragDistance > THRESHHOLD){
            const direction = getCardinalDirection(vec);
            const unitTorque = XProd(getNormal_cubeSpace(action.side),direction);

            const dims: (keyof Vec3)[] = ['x', 'y', 'z'];
            let axis: null | keyof Vec3 = null;
            for (let i=0; i<3; i++){
                const dim = dims[i];
                if (unitTorque[dim] === 0) continue;
                axis = dim;
                break;
            }

            if (!axis) throw new Error('Axis not found!');

            setAction({
                ...action,
                direction,
                unitTorque,
                axis,
            })
        }
    } else {
        // apply direction

        const torque = getTorque(e);

        let m = unitVector();

        switch (action.axis) {
            case 'x':
                m = X(Rx(torque.x), m);
                break;
            case 'y':
                m = X(Ry(torque.y), m);
                break;
            case 'z':
                m = X(Rz(torque.z), m);
                break;
        }
       
        const tranche = getTranche();
        tranche.forEach(box => {
            if (!box) throw new Error('Tried to access unintialized box');

            const matrix = new THREE.Matrix4();
            matrix.set(...Matrix2Tuple(m));
            box.setRotationFromMatrix(matrix);
            box.updateMatrix();
        })
    }
}