import * as THREE from 'three';

export type Side = 'bottom' | 'top' | 'left' | 'right' | 'back' | 'front';
export interface Face {
    side: Side,
    color: string | number,
}

export const colors: Record<string, string | number> = {
  green: 'lime',
  yellow: 'yellow',
  red: 'red',
  blue: 'blue',
  orange: 0xff8000,
  white: 'white',
};

export interface Vec2 {
    x: number,
    y: number,
}

export interface CoordTriad {
    cubeCoords: THREE.Vector3,
    cameraCoords: THREE.Vector3,
    screenCoords: Vec2,
}

export interface ProjectionData {
    dist2: number,
    side: Side,
    cubeCoords: THREE.Vector3,
    cameraCoords: THREE.Vector3,
}

export const sides: Side[] = ['top', 'bottom', 'back', 'front', 'left', 'right'];

export type Matrix = number[][];

export type Mx4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

export function getNormalCubeSpace(side: Side) {
  switch (side) {
    case 'front':
      return new THREE.Vector3(0, 0, 1);
    case 'back':
      return new THREE.Vector3(0, 0, -1);
    case 'bottom':
      return new THREE.Vector3(0, -1, 0);
    case 'top':
      return new THREE.Vector3(0, 1, 0);
    case 'left':
      return new THREE.Vector3(-1, 0, 0);
    case 'right':
      return new THREE.Vector3(1, 0, 0);
    default:
      throw new Error();
  }
}

export type Axis = 'x' | 'y' | 'z';

export const axes: Axis[] = ['x', 'y', 'z'];

export function axisToOrdinal(axis: Axis) {
  const lookup: Record<Axis, number> = {
    x: 0,
    y: 1,
    z: 2,
  };
  return lookup[axis];
}
