import * as THREE from 'three';

export function makeMesh({geometry, material}){
    return new THREE.Mesh(geometry, material);
}