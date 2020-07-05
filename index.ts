import { init as initGlobals, globals } from './globals';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';
import { rotate, getRotation, getProjectionOntoCube } from './rotation';
import { init as initControls, drain, peek, extractScreenCoords } from './events';
import { makeDebugScreen } from './utils/debug';
import { Face, Vec3 } from './utils/types';
import * as boxRegistry from './boxRegistry';
import { Mesh, MeshBasicMaterial } from 'three';
import { setAction, getAction, RotateAction, TwistAction } from './action';


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
        setAction({
            type: 'rotate',
            prevScreenCoords: screenCoords,
        })
    } else {
        setAction({
            type: 'twist',
            direction: null,
            startCubeCoords: data.cubeCoords,
            prevCubeCoords: data.cubeCoords,
        })
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
    setAction(null);
}



function applyRotation(e: MouseEvent, action: RotateAction){
    if (action.type !== 'rotate') throw new Error('Action is not of type `rotate`');

    const screenCoords = extractScreenCoords(e);
    const { x: x2, y: y2 } = screenCoords;
    const { x: x1, y: y1 } = action.prevScreenCoords;
    const delx = x2 - x1;
    const dely = y2 - y1;
    rotate(-dely*.5, delx*.5, 0);
    setAction({
        type: 'rotate',
        prevScreenCoords: screenCoords,
    })
}



function getCardinalDirection(vec: Vec3){
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

function twist(e: MouseEvent, action: TwistAction){
    const screenCoords = extractScreenCoords(e);
    const { cubeCoords } = getProjectionOntoCube(screenCoords);

    if (!action.direction) {
        const {x: x2, y: y2, z: z2} = cubeCoords;
        const {x: x1, y: y1, z: z1} = action.startCubeCoords;

        const vec = {
            x: x2 - x1,
            y: y2 - y1,
            z: z2 - z1,
        };
        const dist = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
        if (dist > .1){
            setAction({
                ...action,
                direction: getCardinalDirection(vec),
                prevCubeCoords: cubeCoords,
            })
        }
    } else {
        console.log('apply direction');
        setAction({
            ...action,
            prevCubeCoords: cubeCoords,
         })
    }
}

function mousemove(){
    const e = drain('mousemove');
    if (!e) return;
    
    // const screenCoords = extractScreenCoords(e);
    // const data = getProjectionOntoCube(screenCoords);

    const action = getAction();

    if (!action) return;
    if (action.type === 'rotate') applyRotation(e, action);
    if (action.type === 'twist') twist(e, action);
}
