import * as THREE from 'three';

function X(m1,m2){
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

function Rx(t){ 
    return [
        [1, 0, 0, 0],
        [0, Math.cos(t), -Math.sin(t), 0],
        [0, Math.sin(t), Math.cos(t), 0],
        [0, 0, 0, 1],
    ]
}

function Ry(t){ 
    return [
        [Math.cos(t), 0, Math.sin(t), 0],
        [0, 1, 0, 0],
        [-Math.sin(t), 0, Math.cos(t), 0],
        [0, 0, 0, 1],
    ]
}

function Rz(t){ 
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

export function rotate(tx, ty, tz){

    const rx = X(Rx(tx),rotation.mx);
    const ry = X(Ry(ty),rx);
    const rz = X(Rz(tz),ry);
    rotation.mx = rz;

    const ix = X(rotation.inv, Rx(-tx));
    const iy = X(ix, Ry(-ty));
    const iz = X(iy, Rz(-tz));
    rotation.inv = iz;

}


function flatten(mx){
    return mx.reduce((acc,el) => {
        if (Array.isArray(el)) {
            return acc.concat(flatten(el));
        } else {
            return acc.concat(el);
        }
    },[])
}
export function getRotation(){
    const mx4 = new THREE.Matrix4();
    mx4.set(...flatten(rotation.mx));
    return mx4;
}