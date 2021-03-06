import * as THREE from 'three';

import { makeMesh } from './utils/three';
import {
  Side, Face, colors,
} from './utils/types';
import { BoxRegistry } from './boxRegistry';
import RotationManager from './rotation';

const INSET = 0.8;
const BORDER_RADIUS = 0.12;

export interface CubeManager {
  object: THREE.Object3D;
  registry: BoxRegistry;
  rotation: RotationManager;
  updateRotation: () => void;
  respawn: () => void;
}

function makeDecal(color: string | number, side: Side) {
  const threeColor = new THREE.Color(colors[color]);

  const decalShape = new THREE.Shape();

  decalShape.moveTo(BORDER_RADIUS, 0);

  decalShape.lineTo(INSET - BORDER_RADIUS, 0); // line

  decalShape.arc(0, BORDER_RADIUS, BORDER_RADIUS, Math.PI * 3 / 2, 0, false); // arc

  decalShape.lineTo(INSET, INSET - BORDER_RADIUS);

  decalShape.arc(-BORDER_RADIUS, 0, BORDER_RADIUS, 0, Math.PI / 2, false);

  decalShape.lineTo(BORDER_RADIUS, INSET);

  decalShape.arc(0, -BORDER_RADIUS, BORDER_RADIUS, Math.PI / 2, Math.PI, false);

  decalShape.lineTo(0, BORDER_RADIUS);

  decalShape.arc(BORDER_RADIUS, 0, BORDER_RADIUS, Math.PI / 2, Math.PI * 3 / 2, false);

  const decal = makeMesh({
    geometry: new THREE.ShapeGeometry(decalShape),
    material: new THREE.MeshStandardMaterial({
      color: threeColor,
      roughness: 1,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  });

  decal.userData.color = color;

  const decalPivot = new THREE.Object3D();
  decalPivot.position.z = 0.5;

  decal.position.x = -INSET / 2;
  decal.position.y = -INSET / 2;

  decalPivot.add(decal);

  const pivot = new THREE.Object3D();
  pivot.add(decalPivot);

  switch (side) {
    case 'bottom':
      pivot.rotateX(Math.PI / 2);
      break;
    case 'top':
      pivot.rotateX(-Math.PI / 2);
      break;
    case 'right':
      pivot.rotateY(Math.PI / 2);
      break;
    case 'left':
      pivot.rotateY(-Math.PI / 2);
      break;
    case 'back':
      pivot.rotateY(Math.PI);
      break;
    case 'front':
      break;
    default:
      throw new Error();
  }

  return pivot;
}

function getInitialDecals(x: number, y: number, z: number) {
  const decals: Face[] = [];
  if (z === 1) {
    decals.push({ side: 'front', color: 'green' });
  } else if (z === -1) {
    decals.push({ side: 'back', color: 'yellow' });
  }

  if (x === 1) {
    decals.push({ side: 'right', color: 'red' });
  } else if (x === -1) {
    decals.push({ side: 'left', color: 'orange' });
  }

  if (y === 1) {
    decals.push({ side: 'top', color: 'white' });
  } else if (y === -1) {
    decals.push({ side: 'bottom', color: 'blue' });
  }

  return decals;
}

function cubeSpawn(faces: Face[], position: THREE.Vector3) {
  const box = makeMesh({
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: new THREE.MeshLambertMaterial({ color: 0x101010 }),
  });

  faces.forEach(({ color, side }: Face) => {
    const decal = makeDecal(color, side);
    box.add(decal);
  });

  // box.castShadow = true;

  const pivot = new THREE.Object3D();
  pivot.add(box);
  box.position.x = position.x;
  box.position.y = position.y;
  box.position.z = position.z;

  return pivot;
}

export default function makeCube() {
  const cube = new THREE.Object3D();
  const registry = new BoxRegistry();
  const rotation = new RotationManager();

  function respawn() {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const loc = new THREE.Vector3(x + 1, y + 1, z + 1);
          const oldBox = registry.getBox(loc);
          if (oldBox) cube.remove(oldBox);

          const decals = getInitialDecals(x, y, z);
          const box = cubeSpawn(decals, new THREE.Vector3(x, y, z));
          registry.registerBox(loc, box);
          cube.add(box);
        }
      }
    }
  }

  respawn();

  return {
    object: cube,
    registry,
    rotation,
    respawn,
    updateRotation: () => cube.setRotationFromMatrix(
      rotation.getRotation(),
    ),
  };
}
