import * as THREE from 'three';
import { Side, Vec2, sides, Vec3, ProjectionData } from './utils/types';
import { globals } from './globals';

type Matrix = number[][];

type Mx4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

const ERR = 1e-8;

function X(m1: Matrix, m2: Matrix): Matrix {
    const result = [];
    for (let i=0; i<m1.length; i++){
        const r = [];
        for (let j=0; j<m2[0].length; j++){
            r.push(null);
        }
        result.push(r);
    }

    if (m1[0].length !== m2.length) throw new Error('dimensional mismatch');

    for (let row = 0; row < m1.length; row++){
        for (let col = 0; col < m2[0].length; col++){
            let sum = 0;
            for (let k=0; k < m1[0].length; k++){
                sum += m1[row][k]*m2[k][col];
            }
            result[row][col] = sum;
        }
    }
    return result;
}

function Rx(t: number){ 
    return [
        [1, 0, 0, 0],
        [0, Math.cos(t), -Math.sin(t), 0],
        [0, Math.sin(t), Math.cos(t), 0],
        [0, 0, 0, 1],
    ]
}

function Ry(t: number){ 
    return [
        [Math.cos(t), 0, Math.sin(t), 0],
        [0, 1, 0, 0],
        [-Math.sin(t), 0, Math.cos(t), 0],
        [0, 0, 0, 1],
    ]
}

function Rz(t: number){ 
    return [
        [Math.cos(t), -Math.sin(t), 0, 0],
        [Math.sin(t), Math.cos(t), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]
}

export const rotation = {
    mx: [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1],
    ],
    inv: [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1],
    ],
}

export function rotate(tx: number, ty: number, tz: number){

    const rx = X(Rx(tx),rotation.mx);
    const ry = X(Ry(ty),rx);
    const rz = X(Rz(tz),ry);
    rotation.mx = rz;

    const ix = X(rotation.inv, Rx(-tx));
    const iy = X(ix, Ry(-ty));
    const iz = X(iy, Rz(-tz));
    rotation.inv = iz;

}


function flatten<T>(
    mx: (T | T[])[]
): T[] {
    return mx.reduce<T[]>((acc,el) => {
        if (Array.isArray(el)) {
            return acc.concat(flatten(el));
        } else {
            return acc.concat(el);
        }
    },[])
}

export function getRotation(){
    const mx4 = new THREE.Matrix4();
    const typedValues: Mx4 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const values = flatten(rotation.mx);
    for (let i=0; i<values.length; i++){
        typedValues[i] = values[i];
    }
    mx4.set(...typedValues);
    return mx4;
}


export function getPlane(side: Side){
    let normal: Matrix = [[0],[0],[0]];
    let d = 0;

    switch (side) {
        case 'front':
            normal = [[0],[0],[1],[1]];
            break;
        case 'back':
            normal = [[0],[0],[-1],[1]];
            break;
        case 'bottom':
            normal = [[0],[-1],[0],[1]];
            break;
        case 'top':
            normal = [[0],[1],[0],[1]];
            break;
        case 'left':
            normal = [[-1],[0],[0],[1]];
            break;
        case 'right':
            normal = [[1],[0],[0],[1]];
            break;
    }

    normal = X(rotation.mx, normal);
    let point = {
        x: normal[0][0]*3/2,
        y: normal[1][0]*3/2,
        z: normal[2][0]*3/2,
    }
    const [[A],[B],[C]] = normal;
    const D = -A*point.x + -B*point.y + -C*point.z; 
    return {A, B, C, D}
}



function getBox(cubeCoords: Vec3){
    function int(n: 'x' | 'y' | 'z'){
        const integerPart = Math.floor(cubeCoords[n] + 1.5);
        return Math.min(Math.max(0, integerPart),2);
    }
    return {
        x: int('x'),
        y: int('y'),
        z: int('z'),
    }
}

export function getProjectionOntoCube(screen: Vec2){
    // Recovering 3D position from 2D input is a system of three equations:
    
    // Point must be on this plane: 
    //      Ax + By + Cz + D = 0;

    // Two equations relating actualX and actualY to actualZ,
    // Using user-selected screen (a 3D coordinate projected onto the plane z=0),
    //      x = screen.x * (cam.p.z - z)/cam.p.z;
    //      y = screen.y * (cam.p.z - z)/cam.p.z;

    let best: null | ProjectionData = null;
    const { camera: {position: { z: camZ } } } = globals;

    sides.forEach(side => {
        const { A, B, C, D } = getPlane(side);
        const MM = -(A*screen.x + B*screen.y)/camZ + C;
        const BB = A*screen.x + B*screen.y + D;

        const z = -BB/MM;
        const x = (camZ - z)/camZ * screen.x;
        const y = (camZ - z)/camZ * screen.y;
        const vec = X(rotation.inv, [[x],[y],[z],[1]]);

        if (
            !(
                vec[0][0] <= 1.5+ERR && vec[0][0] >= -1.5-ERR &&
                vec[1][0] <= 1.5+ERR && vec[1][0] >= -1.5-ERR &&
                vec[2][0] <= 1.5+ERR && vec[2][0] >= -1.5-ERR
            )
        ) return;

        const cubeCoords = {
            x: vec[0][0],
            y: vec[1][0],
            z: vec[2][0],
        };
        const boxRegistryNode = getBox(cubeCoords);

        const dist2 = x*x + y*y + (camZ-z)*(camZ-z);
        if (!best || dist2 < best.dist2){
            best = {
                point: { x, y, z },
                cubeCoords,
                dist2,
                boxRegistryNode,
                side,
            }
        }
    })
    return best;
}