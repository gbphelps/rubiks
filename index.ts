import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';
import { getRotation } from './rotation';
import { getProjectionOntoCube } from './cubeProjections';
import { init as initControls, drain, peek, extractScreenCoords } from './events';
import { makeDebugScreen } from './utils/debug';
import { Face } from './utils/types';
import * as boxRegistry from './boxRegistry';
import { Mesh, MeshBasicMaterial } from 'three';
import { setAction, getAction } from './action';
import applyTwist from './actions/twist';
import applyRotate from './actions/rotate';
import getUserTorque from './getUserTorque';


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
    
    globals.scene!.add(cube);

    const debug = makeDebugScreen();
    globals.scene!.add(debug);

    function animate(){
        requestAnimationFrame(animate);
        cube.setRotationFromMatrix(getRotation());
        cube.updateMatrix();
        if (peek('mousedown')) mousedown();
        if (peek('mouseup')) mouseup();
        if (peek('mousemove')) mousemove();
        globals.render!();
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

    const { cubeCoords, cameraCoords } = data;
    const boxRegistryNode = boxRegistry.getBoxRegistryNode(cubeCoords);

    if (boxRegistry.isCenterSquare(boxRegistryNode)) {
        setAction({
            type: 'rotate',
            prevScreenCoords: screenCoords,
        })
    } else {
        setAction({
            type: 'twist',
            startPosition: {
                cubeCoords,
                cameraCoords,
                screenCoords,
            },
            side: data.side,
            torqueParams: null,
        })
    }

    colorizeActive(new THREE.Color('black'));
    boxRegistry.setActiveBox(boxRegistryNode);
    colorizeActive(new THREE.Color('magenta'));
}

function deselectCube() {
    colorizeActive(new THREE.Color('black'));
    boxRegistry.setActiveBox(null);
}

function mouseup(){
    deselectCube();
    const e = drain('mouseup');
    if (!e) throw new Error();
    
    const action = getAction();
    if (!action) return;

    if (action.type === 'twist'){
        const torque = getUserTorque(e);
        const quarterSlice = Math.PI/2;
        const target = {
            x: Math.round(torque.x/quarterSlice)*quarterSlice,
            y: Math.round(torque.y/quarterSlice)*quarterSlice,
            z: Math.round(torque.z/quarterSlice)*quarterSlice,
        };
        
        const t0 = Date.now();
        const millis = 2000;
        const progressFn = progress(t0, millis);
        setAction({
            type: 'twist-autocorrect',
            params: {
                progressFn,
            }
        });
        return;
    }

    setAction(null);
}

function mousemove(){
    const e = drain('mousemove');
    if (!e) return;
    
    // const screenCoords = extractScreenCoords(e);
    // const data = getProjectionOntoCube(screenCoords);

    const action = getAction();

    if (!action) return;
    if (action.type === 'rotate') applyRotate(e, action);
    if (action.type === 'twist') applyTwist(e, action);
}


function easeInOut(x: number){
    if (x < .5){
        return x*x;
    } else {
        return 1-(x-1)*(x-1);
    }
}

function progress(t0: number,millis: number){
    return function(){
        let x = (Date.now() - t0)/millis;
        if (x >= 1){
            setAction(null);
            x = 1;
        }
        return easeInOut(x)
    }
}