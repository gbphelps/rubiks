import * as THREE from 'three';
import { Geometry, Material } from 'three';


interface Params { 
    geometry: Geometry, material: Material
}

export function makeMesh({geometry, material}: Params){
    return new THREE.Mesh(geometry, material);
}