import * as THREE from 'three';
import {
  ProjectionData, sides, Side,
} from './utils/types';
import { CubeManager } from './cubeSpawn';

const ERR = 1e-8;
export class Projections {
  camera: THREE.PerspectiveCamera;

  cube: CubeManager;

  constructor({ camera, cube }: {
    camera: THREE.PerspectiveCamera,
    cube: CubeManager
  }) {
    this.camera = camera;
    this.cube = cube;
  }

  getProjectionOntoCube(screen: THREE.Vector2): null | ProjectionData {
    // Recovering 3D position from 2D input is a system of three equations:

    // Point must be on this plane:
    //      Ax + By + Cz + D = 0;

    // Two equations relating actualX and actualY to actualZ,
    // Using user-selected screen (a 3D coordinate projected onto the plane z=0),
    //      x = screen.x * (cam.p.z - z)/cam.p.z;
    //      y = screen.y * (cam.p.z - z)/cam.p.z;

    let best: null | ProjectionData = null;
    const camZ = this.camera.position.z;

    sides.forEach((side) => {
      const { cubeCoords, cameraCoords } = this.getProjectionOntoSide({
        screen,
        side,
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

  getProjectionOntoSide({
    screen,
    side,
  }: {
    screen: THREE.Vector2,
    side: Side,
  }) {
    const {
      A, B, C, D,
    } = this.cube.rotation.getPlane(side);

    const camZ = this.camera.position.z;

    const MM = -(A * screen.x + B * screen.y) / camZ + C;
    const BB = A * screen.x + B * screen.y + D;

    const z = -BB / MM;
    const x = (camZ - z) / camZ * screen.x;
    const y = (camZ - z) / camZ * screen.y;

    const vec = new THREE.Vector3(x, y, z);

    return {
      cubeCoords: vec.clone().applyMatrix4(this.cube.rotation.inv),
      cameraCoords: vec,
    };
  }

  getCameraCoordsFromCubeCoords(cubeCoords: THREE.Vector3) {
    return cubeCoords.clone().applyMatrix4(this.cube.rotation.mx);
  }

  getScreenCoordsFromCameraCoords(cameraCoords: THREE.Vector3) {
    const camZ = this.camera.position.z;
    const { x, y, z } = cameraCoords;

    return new THREE.Vector2(
      camZ / (camZ - z) * x,
      camZ / (camZ - z) * y,
    );
  }
}
