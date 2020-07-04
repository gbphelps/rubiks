import * as THREE from 'three'

export const globals = {
    canvas: null,
    scene: null,
    camera: null,
    renderer: null,
    render: null,
    container: null,
    pixPerUnit: 0,
}

export function init() {
    const canvas = document.getElementById('three');
    const container = document.getElementById('container');
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true,
    });

    const { height, width } = container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(30, width / height);
    camera.position.z = 10;

    const scene = new THREE.Scene()

    Object.assign(globals,{
       container,
       canvas,
       scene,
       camera,
       renderer,
       render: () => renderer.render(scene, camera)
    })  
    
    window.addEventListener('resize', resize);
    resize();
}

function resize() {
    const { camera, renderer, container } = globals;
    const { height, width } = container.getBoundingClientRect();

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const theta = camera.fov/180 * Math.PI;
    const z = 1/Math.tan(theta/2) / 2;

    globals.pixPerUnit = height/camera.position.z*z;
    renderer.setSize(width, height);
}

