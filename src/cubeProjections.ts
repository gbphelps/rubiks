import {
  Vec2, ProjectionData, sides, Side, Vec3,
} from './utils/types';
import { globals } from './globals';
import { getPlane, rotation } from './rotation';
import { X, Matrix2Vec, Vec2Matrix } from './utils/matrix';

const ERR = 1e-8;

export function getProjectionOntoCube(screen: Vec2): null | ProjectionData {
  // Recovering 3D position from 2D input is a system of three equations:

  // Point must be on this plane:
  //      Ax + By + Cz + D = 0;

  // Two equations relating actualX and actualY to actualZ,
  // Using user-selected screen (a 3D coordinate projected onto the plane z=0),
  //      x = screen.x * (cam.p.z - z)/cam.p.z;
  //      y = screen.y * (cam.p.z - z)/cam.p.z;

  let best: null | ProjectionData = null;
  const camZ = globals.camera!.position.z;

  sides.forEach((side) => {
    const { cubeCoords, cameraCoords } = getProjectionOntoSide(screen, side);

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

export function getProjectionOntoSide(screen: Vec2, side: Side) {
  const {
    A, B, C, D,
  } = getPlane(side);

  const camZ = globals.camera!.position.z;

  const MM = -(A * screen.x + B * screen.y) / camZ + C;
  const BB = A * screen.x + B * screen.y + D;

  const z = -BB / MM;
  const x = (camZ - z) / camZ * screen.x;
  const y = (camZ - z) / camZ * screen.y;
  const vectorMatrix = X(rotation.inv, [[x], [y], [z], [1]]);

  return {
    cubeCoords: Matrix2Vec(vectorMatrix),
    cameraCoords: {
      x, y, z,
    },
  };
}

export function getCameraCoords(cubeCoords: Vec3) {
  return Matrix2Vec(X(rotation.mx, Vec2Matrix(cubeCoords)));
}

export function getScreenCoords(cameraCoords: Vec3) {
  const camZ = globals.camera!.position.z;
  const { x, y, z } = cameraCoords;

  return {
    x: camZ / (camZ - z) * x,
    y: camZ / (camZ - z) * y,
  };
}