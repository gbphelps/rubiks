import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';
import { rotate, getRotation, getProjectionOntoCube } from './rotation';
import { init as initControls, drain, peek, extractScreenCoords } from './events';
import { makeDebugScreen } from './utils/debug';
import { Face, Vec3 } from './utils/types';
import * as boxRegistry from './boxRegistry';
import { Mesh, MeshBasicMaterial } from 'three';


function getInitialDecals(x: number,y: number,z: number) {
    const decals: Face[] = [];           
    if (z === 1){
        decals.push({side: 'front', color: new THREE.Color('lime') })
    } else if (z === -1){
        decals.push({side: 'back', color: new THREE.Color('yellow') })
    }

    if (x === 1){
        decals.push({side: 'right', color: new THREE.Color('red') })
    } else if (x === -1){
        decals.push({side: 'left', color: new THREE.Color('orange') })
    }

    if (y === 1){
        decals.push({side: 'top', color: new THREE.Color('white') })
    } else if (y === -1){
        decals.push({side: 'bottom', color: new THREE.Color('blue') })
    }
    
    return decals;
}

document.addEventListener('DOMContentLoaded',()=>{
    initGlobals();
    initControls();

    const cube = new THREE.Object3D();

    for (let x=-1; x<=1; x++){
        for (let y=-1; y<=1; y++){
            for (let z=-1; z<=1; z++){
                const decals = getInitialDecals(x,y,z);
                const box = cubeSpawn(decals,{ x, y, z, });
                boxRegistry.registerBox({
                    x: x + 1,
                    y: y + 1,
                    z: z + 1,
                }, box);
                cube.add(box);
            }
        }
    }
    

    globals.scene.add(cube);

    const debug = makeDebugScreen();
    globals.scene.add(debug);

    function animate(){
        requestAnimationFrame(animate);
        rotate(.008, 0.015, .01);
        cube.setRotationFromMatrix(getRotation());
        cube.updateMatrix();
        if (peek('mousedown')) mousedown();
        if (peek('mouseup')) mouseup();
        if (peek('mousemove')) mousemove();
        globals.render();
    }

    animate();

})



/////////////////////////////////////////////////////////

function colorizeActive(color: THREE.Color) {
    const active = boxRegistry.getActiveBox();
    if (!active) return;

    const mesh = active.children[0] as Mesh;
    const material = mesh.material as MeshBasicMaterial;
    material.color = color;
    material.needsUpdate = true;
}

function mousedown() {
    const mousedown = drain('mousedown');
    if (!mousedown) throw new Error('Event already drained!');

    const screenCoords = extractScreenCoords(mousedown);
    const data = getProjectionOntoCube(screenCoords);
    
    if (!data) {
        deselectCube();
        boxRegistry.setActiveBox(null);
        return;
    }

    if (boxRegistry.isCenterSquare(data.boxRegistryNode)) {
        console.log('CENTER');
    }

    colorizeActive(new THREE.Color('black'));
    boxRegistry.setActiveBox(data.boxRegistryNode);
    colorizeActive(new THREE.Color('magenta'));
}

function deselectCube() {
    colorizeActive(new THREE.Color('black'));
    boxRegistry.setActiveBox(null);
}

function mouseup(){
    drain('mouseup');
    deselectCube();
}

function mousemove(){
    const e = drain('mousemove');
}