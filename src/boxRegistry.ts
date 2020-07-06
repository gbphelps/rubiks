import * as THREE from 'three';
import { Vec3 } from './utils/types';
import { getAction } from './action';
import colorizeActive from './utils/uiEffects';

type BoxRegistry = (THREE.Object3D | null)[][][];

let activeNode: Vec3 | null = null;

const boxRegistry: BoxRegistry = [
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ], [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ], [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ],
];

export function registerBox({ x, y, z }: Vec3, box: THREE.Object3D) {
  boxRegistry[x][y][z] = box;
}

export function getBox({ x, y, z }: Vec3) {
  return boxRegistry[x][y][z];
}

export function setActiveBox(node: Vec3 | null) {
  colorizeActive(new THREE.Color('black'));
  activeNode = node;
  colorizeActive(new THREE.Color('magenta'));
}

export function getActiveBox() {
  if (!activeNode) return null;
  return getBox(activeNode);
}

export function isCenterSquare(node: Vec3) {
  let ones = 0;
  Object.values(node).forEach((val) => {
    if (val === 1) ones++;
  });
  return ones === 2;
}

export function getBoxRegistryNode(cubeCoords: Vec3) {
  function int(n: 'x' | 'y' | 'z') {
    const integerPart = Math.floor(cubeCoords[n] + 1.5);
    return Math.min(Math.max(0, integerPart), 2);
  }
  return {
    x: int('x'),
    y: int('y'),
    z: int('z'),
  };
}

export function getTranche(unitTorque: Vec3) {
  if (!activeNode) throw new Error();

  const tranche = [];

  const bounds = [];
  const dims: (keyof Vec3)[] = ['x', 'y', 'z'];
  for (let i = 0; i < 3; i++) {
    const dim = dims[i];
    bounds.push(
      unitTorque[dim]
        ? [activeNode[dim], activeNode[dim]]
        : [0, 2],
    );
  }

  for (let x = bounds[0][0]; x <= bounds[0][1]; x++) {
    for (let y = bounds[1][0]; y <= bounds[1][1]; y++) {
      for (let z = bounds[2][0]; z <= bounds[2][1]; z++) {
        tranche.push(boxRegistry[x][y][z]);
      }
    }
  }

  return tranche;
}

export function deselectCube() {
  colorizeActive(new THREE.Color('black'));
  setActiveBox(null);
}