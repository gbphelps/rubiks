import * as THREE from 'three';
import { colorize, decolorize } from './utils/uiEffects';
import { axes, getNormalCubeSpace, Side } from './utils/types';

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
    decolorize(
      getBox(activeNode),
    );
  }
  activeNode = node;
  if (activeNode) {
    colorize(
      getBox(activeNode),
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
  for (let i = 0; i < 3; i++) {
    const dim = axes[i];
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
    decolorize(
      getBox(activeNode),
    );
  }
  setActiveBox(null);
}

export function getTrancheStatic(axis: number, layer: number) {
  const tranche = [];

  const bounds: Record<string, number[]> = {};

  for (let i = 0; i < 3; i++) {
    bounds[axes[i]] = (
      axis === i
        ? [layer, layer]
        : [0, 2]
    );
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

function getRotationToFront(side: Side) {
  switch (side) {
    case 'front':
      return new THREE.Matrix4();
    case 'left':
      return (new THREE.Matrix4()).makeRotationY(Math.PI / 2);
    case 'right':
      return (new THREE.Matrix4()).makeRotationY(-Math.PI / 2);
    case 'back':
      return (new THREE.Matrix4()).makeRotationX(Math.PI);
    case 'top':
      return (new THREE.Matrix4()).makeRotationX(Math.PI / 2);
    case 'bottom':
      return (new THREE.Matrix4()).makeRotationX(-Math.PI / 2);
    default:
      throw new Error();
  }
}

// todo: this can be hardcoded into a lookup to save a ton of calculations.
export function extractSide(side: Side) {
  const normal = getNormalCubeSpace(side);
  let dimension;
  let index;

  for (let i = 0; i < 3; i++) {
    if (!normal[axes[i]]) continue;
    dimension = i;
    index = normal[axes[i]] + 1;
  }
  if (
    dimension === undefined
    || index === undefined
  ) throw new Error();

  const tranche = getTrancheStatic(dimension, index);
  const rotation = getRotationToFront(side);

  const face: (THREE.Object3D | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  tranche.forEach((box) => {
    if (!box) throw new Error();
    const child = box.children[0] as THREE.Mesh;
    const position = child.position.clone().applyMatrix4(rotation);
    roundVector(position);
    face[position.x + 1][position.y + 1] = box;
  });

  const faceColors = face.map((row) => (
    row.map((box) => {
      if (!box) throw new Error();
      const child = box.children[0] as THREE.Mesh;
      const decals = child.children;
      for (let i = 0; i < decals.length; i++) {
        const decal = decals[i].children[0];
        decals[i].updateMatrix();
        child.updateMatrix();
        const pos = decal.position.clone()
          .applyMatrix4(decals[i].matrix)
          .applyEuler(child.rotation)
          .applyMatrix4(rotation);
        if (Math.round(pos.z * 2) === 1) {
          const mesh = decal.children[0] as THREE.Mesh;
          return mesh.userData.color;
        }
      }
      throw new Error();
    })
  ));

  return faceColors;
}

function roundVector(v: THREE.Vector3) {
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  v.z = Math.round(v.z);
}

// function getIndices(axis: number, fixed: number, others: number[]) {
//   const indices: number[] = [];
//   let othersIndex = 0;
//   for (let i = 0; i < 3; i++) {
//     indices.push(axis === i ? fixed : others[othersIndex++]);
//   }
//   return indices;
// }

/// ///////////////////////////////////////////////////////////

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
