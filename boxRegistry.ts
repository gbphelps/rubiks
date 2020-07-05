import * as THREE from 'three';
import { Vec3 } from './utils/types';
type BoxRegistry = (THREE.Object3D | null)[][][];



let activeNode: Vec3 | null = null;

const boxRegistry: BoxRegistry = [
    [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ],[
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ],[
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ],
];

export function registerBox({x, y, z}: Vec3, box: THREE.Object3D){
    boxRegistry[x][y][z] = box;
}

export function getBox({x, y, z}: Vec3){
    return  boxRegistry[x][y][z];
}

export function setActiveBox(node: Vec3){
    activeNode = node;
}

export function getActiveBox(){
    if (!activeNode) return null;
    return getBox(activeNode);
}