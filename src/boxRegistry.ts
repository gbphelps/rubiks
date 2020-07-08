import * as THREE from 'three';
import colorizeActive from './utils/uiEffects';
import { getAction } from './action';
import { axes, Axis, axisToOrdinal } from './utils/types';

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

  // for (let i = 0; i < 3; i++) {
  //   for (let j = 0; j < 3; j++) {
  //     case
  //   }
  // }
}

function inPlaceRotate(arr: number[][]) {
  if (arr.length !== arr[0].length) throw new Error('cannot in-place rotate array of mixed dimensions');
  const l = arr.length;

  for (let i = 0; i < Math.floor(arr.length / 2); i++) {
    for (let j = 0; j <= Math.floor(arr.length / 2 - i); j++) {
      const c = [i, i + j];
      const store = arr[c[0]][c[1]];
      for (let k = 0; k < 3; k++) {
        arr[c[0]][c[1]] = arr[l - 1 - c[1]][c[0]];
        const store = c[0];
        c[0] = l - 1 - c[1];
        c[1] = store;
      }
      arr[c[0]][c[1]] = store;
    }
  }
  return arr;
}

// function getIdxs(
//   axis: Axis, layer: number, nonfixed: [number, number],
// ) {
//   const axisNum = axisToOrdinal(axis);
//   const r = [];
//   let nonfixedIdx = 0;
//   for (let i = 0; i < 3; i++) {
//     r.push(axisNum === i ? layer : nonfixed[nonfixedIdx++]);
//   }
//   return r;
// }

// function assign(idxs: any, val: any) {
//   let item: any = boxRegistry;
//   for (let i = 0; i < idxs.length - 1; i++) {
//     item = item[idxs[i]];
//   }
//   item[idxs[idxs.length - 1]] = val;
// }

// function get(idxs: any) {
//   return idxs.reduce((acc: any, el: any) => acc[el], boxRegistry);
// }

// function IPR(axis: any, layer: any) {
//   const l = 3;

//   for (let i = 0; i < Math.floor(l / 2); i++) {
//     for (let j = 0; j <= Math.floor(l / 2 - i); j++) {
//       const c: [number, number] = [i, i + j];
//       const i1 = () => getIdxs(axis, layer, c);
//       const store = get(i1());

//       for (let k = 0; k < 3; k++) {
//         const c2: [number, number] = [l - 1 - c[1], c[0]];
//         const i2 = getIdxs(axis, layer, c2);
//         assign(i1(), get(i2));
//       }
//       assign(i1(), store);
//     }
//   }
// }
