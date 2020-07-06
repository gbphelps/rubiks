export type Side = 'bottom' | 'top' | 'left' | 'right' | 'back' | 'front';
export interface Face {
    side: Side,
    color: THREE.Color,
}
export interface Vec3 {
    x: number,
    y: number,
    z: number
}

export interface Vec2 {
    x: number,
    y: number,
}

export interface CoordTriad {
    cubeCoords: Vec3,
    cameraCoords: Vec3,
    screenCoords: Vec2,
}

export interface ProjectionData {
    dist2: number,
    side: Side,
    cubeCoords: Vec3,
    cameraCoords: Vec3,
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
  let normal: Vec3 = { x: 0, y: 0, z: 0 };

  switch (side) {
    case 'front':
      normal = {
        x: 0,
        y: 0,
        z: 1,
      };
      break;
    case 'back':
      normal = {
        x: 0,
        y: 0,
        z: -1,
      };
      break;
    case 'bottom':
      normal = {
        x: 0,
        y: -1,
        z: 0,
      };
      break;
    case 'top':
      normal = {
        x: 0,
        y: 1,
        z: 0,
      };
      break;
    case 'left':
      normal = {
        x: -1,
        y: 0,
        z: 0,
      };
      break;
    case 'right':
      normal = {
        x: 1,
        y: 0,
        z: 0,
      };
      break;
    default:
      throw new Error();
  }
  return normal;
}
