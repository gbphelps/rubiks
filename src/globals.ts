import * as THREE from 'three';
import { BoxRegistry } from './boxRegistry';
import makeCube from './cubeSpawn';
import RotationManager from './rotation';

const UNIT = 10;

class Globals {
  canvas: HTMLCanvasElement;

  scene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  renderer: THREE.Renderer;

  render: (() => void);

  container: HTMLDivElement;

  lights: THREE.Light[];

  cube: {
    object: THREE.Object3D,
    registry: BoxRegistry,
    rotation: RotationManager,
  };

  pixPerUnit: number;

  getCanvas: () => HTMLCanvasElement;

  getContainer: () => HTMLDivElement;

  constructor({ getCanvas, getContainer }: {
    getCanvas: () => HTMLCanvasElement,
    getContainer: () => HTMLDivElement,
  }) {
    this.getCanvas = getCanvas;
    this.getContainer = getContainer;
  }

  init() {
    this.canvas = this.getCanvas();
    this.container = this.getContainer();
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.lights = makeLights();
    this.lights.forEach((l) => this.scene.add(l));

    const { height, width } = this.container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(30, width / height);
    this.camera.position.z = UNIT;
    this.render = () => { this.renderer.render(this.scene, this.camera); };

    this.cube = makeCube();
    this.scene.add(this.cube.object);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize = () => {
    const { height, width } = this.container.getBoundingClientRect();

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const theta = this.camera.fov / 180 * Math.PI;

    // calculate z distance of camera screen in pixels (using height).
    const z = (height / 2) / Math.tan(theta / 2);

    // calculate ratio between z in pixels and z in scene units.
    this.pixPerUnit = z / this.camera.position.z;

    this.renderer.setSize(width, height);
  }
}

function makeLights() {
  const ambientLight = new THREE.AmbientLight('white', 0.2);

  const pointLightFront = new THREE.PointLight('white', 1, 0, 2);
  pointLightFront.position.set(0, 0.5 * UNIT, 1 * UNIT);

  const pointLightLeft = new THREE.PointLight('white', 0.4, 0, 2);
  pointLightLeft.position.set(-2 * UNIT, -UNIT, -UNIT * 0.5);

  const pointLightRight = new THREE.PointLight('white', 0.4, 0, 2);
  pointLightRight.position.set(2 * UNIT, -UNIT, -UNIT * 0.5);

  return [
    ambientLight,
    pointLightFront,
    pointLightLeft,
    pointLightRight,
  ];
}

export const globals = new Globals({
  getCanvas: () => document.getElementById('canvas') as HTMLCanvasElement,
  getContainer: () => document.getElementById('container') as HTMLDivElement,
});
