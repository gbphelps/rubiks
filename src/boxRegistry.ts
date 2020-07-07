import * as THREE from 'three';
import colorizeActive from './utils/uiEffects';
import { getAction } from './action';
import { axes, Axis } from './utils/types';

type BoxRegistry = (THREE.Object3D | null)[][][];

let activeNode: THREE.Vector3 | null = null;

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

export function registerBox({ x, y, z }: THREE.Vector3, box: THREE.Object3D) {
  boxRegistry[x][y][z] = box;
}

export function getBox({ x, y, z }: THREE.Vector3) {
  return boxRegistry[x][y][z];
}

export function getActiveNode() {
  return activeNode;
}

export function setActiveBox(node: THREE.Vector3 | null) {
  if (activeNode) {
    colorizeActive(
      getBox(activeNode),
      new THREE.Color('black'),
    );
  }
  activeNode = node;
  if (activeNode) {
    colorizeActive(
      getBox(activeNode),
      new THREE.Color('magenta'),
    );
  }
}

export function getActiveBox() {
  if (!activeNode) return null;
  return getBox(activeNode);
}

export function isCenterSquare(node: THREE.Vector3) {
  let ones = 0;
  Object.values(node).forEach((val) => {
    if (val === 1) ones++;
  });
  return ones === 2;
}

export function getBoxRegistryNode(cubeCoords: THREE.Vector3) {
  function int(n: 'x' | 'y' | 'z') {
    const integerPart = Math.floor(cubeCoords[n] + 1.5);
    return Math.min(Math.max(0, integerPart), 2);
  }
  return new THREE.Vector3(int('x'), int('y'), int('z'));
}

export function getTranche(unitTorque: THREE.Vector3) {
  if (!activeNode) throw new Error();

  const tranche = [];

  const bounds = [];
  const dims: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
  for (let i = 0; i < 3; i++) {
    const dim = dims[i];
    bounds.push(
      unitTorque[dim]
        ? [activeNode[dim], activeNode[dim]]
        : [0, 2],
    );
  }

  for (let x: number = bounds[0][0]; x <= bounds[0][1]; x++) {
    for (let y = bounds[1][0]; y <= bounds[1][1]; y++) {
      for (let z = bounds[2][0]; z <= bounds[2][1]; z++) {
        tranche.push(boxRegistry[x][y][z]);
      }
    }
  }

  return tranche;
}

export function deselectCube() {
  if (activeNode) {
    colorizeActive(
      getBox(activeNode),
      new THREE.Color('black'),
    );
  }
  setActiveBox(null);
}

type AxisDirection = {
  axis: Axis,
  direction: number,
} | null;

export function updateRegistryAfterTwist() {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist-autocorrect') throw new Error();
  const { unitTorque, toTorque, activeNode: node } = action.params;
  const turns = Math.round(toTorque / (Math.PI / 2));

  const { axis, direction } = axes
    .reduce<AxisDirection>((ans, axis) => (
      unitTorque[axis]
        ? { axis, direction: unitTorque[axis] } : ans), null) || {};

  if (!direction || !axis) throw new Error();

  rotateTrancheInRegistry(turns * direction, axis, node);
}

export function rotateTrancheInRegistry(
  turns: number, axis: Axis, node: THREE.Vector3,
) {
  const layer = node[axis];
  console.log({ turns, axis, layer });
}
