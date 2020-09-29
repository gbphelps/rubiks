import * as THREE from 'three';
import { BoxRegistry } from './boxRegistry';
import makeCube from './cubeSpawn';

interface Globals {
    canvas: HTMLCanvasElement | null,
    scene: THREE.Scene | null,
    camera: THREE.PerspectiveCamera | null,
    renderer: THREE.Renderer | null,
    cube: {
      object: THREE.Object3D | null,
      registry: BoxRegistry,
    },
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
  cube: {
    object: null,
    registry: new BoxRegistry(),
  },
  pixPerUnit: 0,
};

const UNIT = 10;

export function init() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const container = document.getElementById('container') as HTMLDivElement;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const { height, width } = container.getBoundingClientRect();
  const camera = new THREE.PerspectiveCamera(30, width / height);

  camera.position.z = UNIT;

  const scene = new THREE.Scene();

  const cube = makeCube();
  scene.add(cube.object);

  const ambientLight = new THREE.AmbientLight('white', 0.2);
  scene.add(ambientLight);

  const pointLightFront = new THREE.PointLight('white', 1, 0, 2);
  pointLightFront.position.set(0, 0.5 * UNIT, 1 * UNIT);
  // pointLightFront.castShadow = true;
  // pointLightFront.shadow.mapSize.width = 1500;
  // pointLightFront.shadow.mapSize.height = 1500;
  // pointLightFront.shadow.radius = 2;
  scene.add(pointLightFront);

  const pointLightLeft = new THREE.PointLight('white', 0.4, 0, 2);
  pointLightLeft.position.set(-2 * UNIT, -UNIT, -UNIT * 0.5);
  scene.add(pointLightLeft);

  const pointLightRight = new THREE.PointLight('white', 0.4, 0, 2);
  pointLightRight.position.set(2 * UNIT, -UNIT, -UNIT * 0.5);
  scene.add(pointLightRight);

  // const pivot = new THREE.Object3D();
  // const planeGeometry = new THREE.PlaneBufferGeometry(50, 50, 200, 200);
  // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.position.z = -10;
  // pivot.rotation.x = -Math.PI / 2 + 0.4;

  // plane.receiveShadow = true;
  // pivot.add(plane);
  // scene.add(pivot);

  Object.assign(globals, {
    container,
    canvas,
    scene,
    camera,
    renderer,
    cube,
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
  const {
    camera, renderer, container,
  } = globals;
  const { height, width } = container!.getBoundingClientRect();

  camera!.aspect = width / height;
  camera!.updateProjectionMatrix();

  const theta = camera!.fov / 180 * Math.PI;

  // calculate z distance of camera screen in pixels (using height).
  const z = (height / 2) / Math.tan(theta / 2);

  // calculate ratio between z in pixels and z in scene units.
  globals.pixPerUnit = z / camera!.position.z;

  renderer!.setSize(width, height);
}
