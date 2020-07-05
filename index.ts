import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';
import { rotate, getRotation, getProjectionOntoCube } from './rotation';
import { init as initControls, controls } from './controls';
import { makeMesh } from './utils/three';
import { makeDebugScreen } from './utils/debug';
import { Face } from './utils/types';
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
        if (controls.click) selectCube();
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

function selectCube() {
    if (!controls.click) throw new Error('controls.click is set to false');
    const data = getProjectionOntoCube(controls.click);
    colorizeActive(new THREE.Color('black'));

    if (!data) return;
    boxRegistry.setActiveBox(data.boxRegistryNode);
    colorizeActive(new THREE.Color('magenta'));
    controls.click = false;
}