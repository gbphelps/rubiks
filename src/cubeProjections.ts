import * as THREE from 'three';
import {
  ProjectionData, sides, Side,
} from './utils/types';
import { CubeManager } from './cubeSpawn';

const ERR = 1e-8;

export function getProjectionOntoCube({
  screen,
  camera,
  cube,
}: {
  screen: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  cube: CubeManager
}): null | ProjectionData {
  // Recovering 3D position from 2D input is a system of three equations:

  // Point must be on this plane:
  //      Ax + By + Cz + D = 0;

  // Two equations relating actualX and actualY to actualZ,
  // Using user-selected screen (a 3D coordinate projected onto the plane z=0),
  //      x = screen.x * (cam.p.z - z)/cam.p.z;
  //      y = screen.y * (cam.p.z - z)/cam.p.z;

  let best: null | ProjectionData = null;
  const camZ = camera.position.z;

  sides.forEach((side) => {
    const { cubeCoords, cameraCoords } = getProjectionOntoSide({
      screen,
      side,
      camera,
      cube,
    });

    if (
      !(
        cubeCoords.x <= 1.5 + ERR && cubeCoords.x >= -1.5 - ERR
                && cubeCoords.y <= 1.5 + ERR && cubeCoords.y >= -1.5 - ERR
                && cubeCoords.z <= 1.5 + ERR && cubeCoords.z >= -1.5 - ERR
      )
    ) return;

    const dist2 = cameraCoords.x * cameraCoords.x
            + cameraCoords.y * cameraCoords.y
            + (camZ - cameraCoords.z) * (camZ - cameraCoords.z);

    if (!best || dist2 < best.dist2) {
      best = {
        cameraCoords, // pointCameraSpace: { x, y, z }, // location of point in camera space
        cubeCoords, // location of point in cube space
        dist2,
        side,
      };
    }
  });
  return best;
}

export function getProjectionOntoSide({
  screen,
  side,
  camera,
  cube,
}: {
  screen: THREE.Vector2,
  side: Side,
  camera: THREE.PerspectiveCamera,
  cube: CubeManager,
}) {
  const {
    A, B, C, D,
  } = cube.rotation.getPlane(side);

  const camZ = camera.position.z;

  const MM = -(A * screen.x + B * screen.y) / camZ + C;
  const BB = A * screen.x + B * screen.y + D;

  const z = -BB / MM;
  const x = (camZ - z) / camZ * screen.x;
  const y = (camZ - z) / camZ * screen.y;

  const vec = new THREE.Vector3(x, y, z);

  return {
    cubeCoords: vec.clone().applyMatrix4(cube.rotation.inv),
    cameraCoords: vec,
  };
}

export function getCameraCoords({
  cubeCoords,
  cube,
}: {
  cubeCoords: THREE.Vector3,
  cube: CubeManager
}) {
  return cubeCoords.clone().applyMatrix4(cube.rotation.mx);
}

export function getScreenCoords({
  cameraCoords,
  camera,
}:{
  cameraCoords: THREE.Vector3,
  camera: THREE.PerspectiveCamera
}) {
  const camZ = camera.position.z;
  const { x, y, z } = cameraCoords;

  return new THREE.Vector2(
    camZ / (camZ - z) * x,
    camZ / (camZ - z) * y,
  );
}
