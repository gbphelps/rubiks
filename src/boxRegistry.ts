import * as THREE from 'three';
import { colorize, decolorize } from './utils/uiEffects';
import { axes, getNormalCubeSpace, Side } from './utils/types';
import { roundPosition } from './utils/three';

export class BoxRegistry {
  activeNode: THREE.Vector3 | null = null;

  registry: (THREE.Object3D | null)[][][] = [
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

  registerBox({ x, y, z }: THREE.Vector3, box: THREE.Object3D) {
    this.registry[x][y][z] = box;
  }

  getBox({ x, y, z }: THREE.Vector3) {
    return this.registry[x][y][z];
  }

  getActiveNode() {
    return this.activeNode;
  }

  setActiveBox(node: THREE.Vector3 | null) {
    if (this.activeNode) {
      decolorize(
        this.getBox(this.activeNode),
      );
    }
    this.activeNode = node;
    if (this.activeNode) {
      colorize(
        this.getBox(this.activeNode),
      );
    }
  }

  getActiveBox() {
    if (!this.activeNode) return null;
    return this.getBox(this.activeNode);
  }

  getTranche(unitTorque: THREE.Vector3) {
    if (!this.activeNode) throw new Error();

    const tranche = [];

    const bounds: Record<string, number[]> = {};
    for (let i = 0; i < 3; i++) {
      const dim = axes[i];
      bounds[dim] = unitTorque[dim]
        ? [this.activeNode[dim], this.activeNode[dim]]
        : [0, 2];
    }

    for (let x: number = bounds.x[0]; x <= bounds.x[1]; x++) {
      for (let y = bounds.y[0]; y <= bounds.y[1]; y++) {
        for (let z = bounds.z[0]; z <= bounds.z[1]; z++) {
          tranche.push(this.registry[x][y][z]);
        }
      }
    }

    return tranche;
  }

  deselectCube() {
    if (this.activeNode) {
      decolorize(
        this.getBox(this.activeNode),
      );
    }
    this.setActiveBox(null);
  }

  getTrancheStatic(axis: number, layer: number) {
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
          tranche.push(this.registry[x][y][z]);
        }
      }
    }

    return tranche;
  }

  // todo: this can be hardcoded into a lookup to save a ton of calculations.
  extractSide(side: Side) {
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

    const tranche = this.getTrancheStatic(dimension, index);
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

  updateRegistry(
    tranche: (THREE.Object3D | null)[],
  ) {
    tranche.forEach((box) => {
      if (!box) throw new Error();
      const child = box.children[0];
      const mx = box.matrix.clone();
      box.rotation.set(0, 0, 0);
      child.applyMatrix4(mx);
      roundPosition(child);
      const { x, y, z } = child.position;
      this.registerBox(new THREE.Vector3(x + 1, y + 1, z + 1), box);
    });
  }
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

function roundVector(v: THREE.Vector3) {
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  v.z = Math.round(v.z);
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

export default new BoxRegistry();
