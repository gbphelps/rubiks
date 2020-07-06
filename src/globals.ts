import * as THREE from 'three';

interface Globals {
    canvas: HTMLCanvasElement | null,
    scene: THREE.Scene | null,
    camera: THREE.PerspectiveCamera | null,
    renderer: THREE.Renderer | null,
    render: (() => void) | null,
    container: HTMLDivElement | null,
    pixPerUnit: number,
}

export const globals: Globals = {
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  render: null,
  container: null,
  pixPerUnit: 0,
};

export function init() {
  const canvas = document.createElement('canvas');

  const container = document.createElement('div');
  container.id = 'container';

  document.body.appendChild(container);
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const { height, width } = container.getBoundingClientRect();
  const camera = new THREE.PerspectiveCamera(30, width / height);
  camera.position.z = 10;

  const scene = new THREE.Scene();

  Object.assign(globals, {
    container,
    canvas,
    scene,
    camera,
    renderer,
    render: () => renderer.render(scene, camera),
  });

  window.addEventListener('resize', resize);
  resize();
}

function resize() {
  const { camera, renderer, container } = globals;
  const { height, width } = container!.getBoundingClientRect();

    camera!.aspect = window.innerWidth / window.innerHeight;
    camera!.updateProjectionMatrix();

    const theta = camera!.fov / 180 * Math.PI;

    // calculate z distance of camera screen in pixels (using height).
    const z = (height / 2) / Math.tan(theta / 2);

    // calculate ratio between z in pixels and z in scene units.
    globals.pixPerUnit = z / camera!.position.z;

    renderer!.setSize(width, height);
}
