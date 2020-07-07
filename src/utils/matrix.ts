import * as THREE from 'three';
import {
  Matrix, Vec2,
} from './types';

export function Matrix2Vec(mx: Matrix) {
  return {
    x: mx[0][0],
    y: mx[1][0],
    z: mx[2][0],
  };
}

export function Vec2Matrix(vec: THREE.Vector3) {
  return [[vec.x], [vec.y], [vec.z], [1]];
}

export function XProd(v1: THREE.Vector3, v2: THREE.Vector3) {
  const { x: x1, y: y1, z: z1 } = v1;
  const { x: x2, y: y2, z: z2 } = v2;
  return {
    x: y1 * z2 - z1 * y2,
    y: z1 * x2 - x1 * z2,
    z: x1 * y2 - y1 * x2,
  };
}

export function dotProd(v1: Vec2 | THREE.Vector3, v2: Vec2 | THREE.Vector3) {
  const a = {
    z: 0,
    ...v1,
  };

  const b = {
    z: 0,
    ...v2,
  };

  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function mag2(vec: THREE.Vector3) {
  return vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
}

export function vec3(vec: Vec2) {
  return {
    ...vec,
    z: 0,
  };
}

export function X(m1: Matrix, m2: Matrix): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < m1.length; i++) {
    const r = [];
    for (let j = 0; j < m2[0].length; j++) {
      r.push(0);
    }
    result.push(r);
  }

  if (m1[0].length !== m2.length) throw new Error('dimensional mismatch');

  for (let row = 0; row < m1.length; row++) {
    for (let col = 0; col < m2[0].length; col++) {
      let sum = 0;
      for (let k = 0; k < m1[0].length; k++) {
        sum += m1[row][k] * m2[k][col];
      }
      result[row][col] = sum;
    }
  }
  return result;
}

export function Rx(t: number) {
  return (new THREE.Matrix4()).makeRotationX(t);
}

export function Ry(t: number) {
  return (new THREE.Matrix4()).makeRotationY(t);
}

export function Rz(t: number) {
  return (new THREE.Matrix4()).makeRotationZ(t);
}

export function unitVector() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}
