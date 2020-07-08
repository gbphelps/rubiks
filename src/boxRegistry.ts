import * as THREE from 'three';
import colorizeActive from './utils/uiEffects';

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

  const bounds: Record<string, number[]> = {};
  const dims: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
  for (let i = 0; i < 3; i++) {
    const dim = dims[i];
    bounds[dim] = unitTorque[dim]
      ? [activeNode[dim], activeNode[dim]]
      : [0, 2];
  }

  for (let x: number = bounds.x[0]; x <= bounds.x[1]; x++) {
    for (let y = bounds.y[0]; y <= bounds.y[1]; y++) {
      for (let z = bounds.z[0]; z <= bounds.z[1]; z++) {
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

// function inPlaceRotate(arr: number[][]) {
//   if (arr.length !== arr[0].length) throw new Error(
//    'cannot in-place rotate array of mixed dimensions'
//   );
//   const l = arr.length;

//   for (let i = 0; i < Math.floor(arr.length / 2); i++) {
//     for (let j = 0; j <= Math.floor(arr.length / 2 - i); j++) {
//       const c = [i, i + j];
//       const store = arr[c[0]][c[1]];
//       for (let k = 0; k < 3; k++) {
//         arr[c[0]][c[1]] = arr[l - 1 - c[1]][c[0]];
//         const store = c[0];
//         c[0] = l - 1 - c[1];
//         c[1] = store;
//       }
//       arr[c[0]][c[1]] = store;
//     }
//   }
//   return arr;
// }
