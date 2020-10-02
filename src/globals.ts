import * as THREE from 'three';
import ActionManager from './action';
import { Projections } from './cubeProjections';
import makeCube, { CubeManager } from './cubeSpawn';
import { Events } from './events';

const UNIT = 10;

export class Globals {
  action = new ActionManager();

  canvas: HTMLCanvasElement;

  scene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  renderer: THREE.Renderer;

  render: (() => void);

  container: HTMLDivElement;

  lights: THREE.Light[];

  cube: CubeManager;

  pixPerUnit: number;

  getCanvas: () => HTMLCanvasElement;

  getContainer: () => HTMLDivElement;

  projections: Projections;

  events: Events;

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

    this.events = new Events({
      getPPU: () => this.pixPerUnit,
      canvas: this.canvas,
    });
    this.events.init();

    this.projections = new Projections({
      cube: this.cube,
      camera: this.camera,
    });

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize = () => {
    let { height, width } = this.container.getBoundingClientRect();

    const limitingDimension = Math.min(height, width);
    height = limitingDimension;
    width = limitingDimension;

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
