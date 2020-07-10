import * as THREE from 'three';

interface Globals {
    canvas: HTMLCanvasElement | null,
    scene: THREE.Scene | null,
    camera: THREE.PerspectiveCamera | null,
    renderer: THREE.Renderer | null,
    render: (() => void) | null,
    container: HTMLDivElement | null,
    pixPerUnit: number,
    lights: null | {
      ambientLight: THREE.AmbientLight,
      pointLightLeft: THREE.PointLight,
      pointLightRight: THREE.PointLight,
      pointLightFront: THREE.PointLight,
    }
}

export const globals: Globals = {
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  render: null,
  container: null,
  lights: null,
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

  const ambientLight = new THREE.AmbientLight('white', 0.35);
  scene.add(ambientLight);

  const pointLightFront = new THREE.PointLight('white', 1, 0, 2);
  pointLightFront.position.set(0, 3, 10);
  scene.add(pointLightFront);

  const pointLightLeft = new THREE.PointLight('white', 0.6, 0, 2);
  pointLightLeft.position.set(-10, 0, -camera.position.z);
  scene.add(pointLightLeft);

  const pointLightRight = new THREE.PointLight('white', 0.6, 0, 2);
  pointLightRight.position.set(10, 0, -camera.position.z);
  scene.add(pointLightRight);

  Object.assign(globals, {
    container,
    canvas,
    scene,
    camera,
    renderer,
    lights: {
      ambientLight,
      pointLightFront,
      pointLightLeft,
      pointLightRight,
    },
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
