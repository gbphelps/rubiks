import { init, globals } from './globals.js';
import cubeSpawn from './cubeSpawn';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded',()=>{
    init();

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

    function animate(){
        requestAnimationFrame(animate);
        cube.rotation.x += .01;
        cube.rotation.y += .01;
        globals.render();
    }

    animate();

})
