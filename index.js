import * as THREE from 'three';
import { init, globals } from './globals.js';



function makeMesh({geometry, material}){
    return new THREE.Mesh(geometry, material);
}

function makeCube(color, inset=.8, r=.15) {

    const box = makeMesh({
        geometry: new THREE.BoxGeometry(1,1,1),
        material: new THREE.MeshBasicMaterial({ color: 0x000000 })
    });

    const decalShape = new THREE.Shape();
    decalShape.moveTo(r,0);

    decalShape.lineTo(inset-r,0); // line

    decalShape.arc(0, r, r, Math.PI*3/2, 0, false); // arc

    decalShape.lineTo(inset,inset-r);

    decalShape.arc(-r, 0, r, 0, Math.PI/2);

    decalShape.lineTo(r,inset);

    decalShape.arc(0,-r, r, Math.PI/2, Math.PI);

    decalShape.lineTo(0,r);

    decalShape.arc(r, 0, r, Math.PI/2, Math.PI*3/2);
    

    const decal = makeMesh({
        geometry: new THREE.ShapeGeometry(decalShape),
        material: new THREE.MeshBasicMaterial({ 
            color,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1, 
        }),
    })

    decal.position.x = -inset/2;
    decal.position.y = -inset/2;
    decal.position.z = .5;

    box.add(decal);

    globals.scene.add( box );
    return box;
}


document.addEventListener('DOMContentLoaded',()=>{
    init();
    const box = makeCube('red');

    function animate(){
        requestAnimationFrame(animate);
        box.rotation.x += .01;
        globals.render();
    }

    animate();
})
