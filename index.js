import { init as initGlobals, globals } from './globals.js';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';
import { rotate, getRotation } from './cubeGlobals';
import { init as initControls, controls } from './controls';
import { makeMesh } from './utils/three';






function makeDebugScreen() {
    const m = new THREE.Shape();
    m.moveTo(-1.5, 1.5);
    m.lineTo(1.5, 1.5);
    m.lineTo(1.5, -1.5);
    m.lineTo(-1.5, -1.5);
    const geometry = new THREE.ShapeGeometry(m);
    const material = new THREE.MeshBasicMaterial({ 
        color: 'black',
        transparent: true,
        opacity: .2, 
    });
    return makeMesh({
        geometry,
        material,
    })
}

document.addEventListener('DOMContentLoaded',()=>{
    initGlobals();
    initControls();

    const cube = new THREE.Object3D();

    for (let x=-1; x<=1; x++){
        for (let y=-1; y<=1; y++){
            for (let z=-1; z<=1; z++){
                const decals = [];
                
                if (z === 1){
                    decals.push({side: 'front', color: 'lime'})
                } else if (z === -1){
                    decals.push({side: 'back', color: 'yellow'})
                }

                if (x === 1){
                    decals.push({side: 'right', color: 'red'})
                } else if (x === -1){
                    decals.push({side: 'left', color: 'orange'})
                }

                if (y === 1){
                    decals.push({side: 'top', color: 'white'})
                } else if (y === -1){
                    decals.push({side: 'bottom', color: 'blue'})
                }

                const box = cubeSpawn(decals,{ x, y, z, });
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
        if (controls.click) getClickedCube();
        globals.render();
    }

    animate();

})



function getClickedCube() {
    const { x, y } = controls.click;
    console.log({x, y})
}