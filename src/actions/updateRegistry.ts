import * as THREE from 'three';
import { getAction, setAction } from '../action';
import { Axis, axes } from '../utils/types';
import { setUserEventsEnabled } from '../events';
import { registerBox } from '../boxRegistry';

export default function updateRegistry() {
  const action = getAction();
  if (!action || action.type !== 'updateRegistry') return;

  const { unitTorque, toTorque, tranche } = action.params;

  const { axis, rotation } = getAxisAndRotation(unitTorque, toTorque);
  const rotMx = getRotationMatrix(axis, rotation);

  tranche.forEach((box) => {
    if (!box) throw new Error();
    const child = box.children[0];
    box.rotation.set(0, 0, 0);

    rotateChild(child, axis, rotation);

    child.position.applyMatrix4(rotMx);
    roundPosition(child);

    const { x, y, z } = child.position;
    registerBox(new THREE.Vector3(x + 1, y + 1, z + 1), box);
  });

  setAction(null);
  setUserEventsEnabled(true);
}

function rotateChild(child: THREE.Object3D, axis: Axis, rotation: number) {
  const a = getRotationMatrix(axis, rotation);
  const m = child.matrix;
  const b = (new THREE.Matrix4()).multiplyMatrices(a, m);
  child.setRotationFromMatrix(b);
  roundRotation(child);
}

function roundRotation(obj: THREE.Object3D) {
  // note: THREEjs already takes the 2pi modulus for angles over 2pi
  for (let i = 0; i < 3; i++) {
    const axis = axes[i];
    const oneRotation = Math.PI / 2;
    console.log(obj.rotation[axis]);
    obj.rotation[axis] = Math.round(obj.rotation[axis] / oneRotation) * oneRotation;
  }
}

function roundPosition(obj: THREE.Object3D) {
  for (let i = 0; i < 3; i++) {
    const axis = axes[i];
    obj.position[axis] = Math.round(obj.position[axis]);
  }
}

function getAxisAndRotation(unitTorque: THREE.Vector3, magnitude: number) {
  let axis: Axis | null = null;
  let rotation: number = 0;
  for (let i = 0; i < 3; i++) {
    if (unitTorque[axes[i]] === 0) continue;
    rotation = magnitude * unitTorque[axes[i]];
    axis = axes[i];
    break;
  }
  if (!axis) throw new Error();

  return { axis, rotation };
}

function getRotationMatrix(axis: Axis, rotation: number) {
  const rotations: Record<string, 'makeRotationX' | 'makeRotationY' | 'makeRotationZ'> = {
    x: 'makeRotationX',
    y: 'makeRotationY',
    z: 'makeRotationZ',
  };
  const mx = new THREE.Matrix4();
  mx[rotations[axis]](rotation);
  return mx;
}
