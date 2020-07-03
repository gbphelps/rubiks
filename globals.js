import * as THREE from 'three'

export const globals = {
    canvas: null,
    scene: null,
    camera: null,
    renderer: null,
    render: null,
}

export function init() {
    const canvas = document.getElementById('three');
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true,
    });

    const { height, width } = canvas.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(75, width / height);
    camera.position.z = 2;

    const scene = new THREE.Scene()

    Object.assign(globals,{
       canvas,
       scene,
       camera,
       renderer,
       render: () => renderer.render(scene, camera)
    })  
    
    document.addEventListener('resize', resize);
    resize();
}

function resize() {
    const { camera, renderer, canvas } = globals;
    const { height, width } = canvas.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

