import * as THREE from 'three';
import { Side, getNormalCubeSpace } from './utils/types';
import {
  Rx, Ry, Rz,
} from './utils/matrix';

export default class RotationManager {
    mx = new THREE.Matrix4();

    inv = new THREE.Matrix4();

    setRotation(
      { mx, inv }: {
      mx?: THREE.Matrix4,
      inv?: THREE.Matrix4
    },
    ) {
      if (mx) this.mx = mx.clone();
      if (inv) this.inv = inv.clone();
    }

    rotate(tx: number, ty: number, tz: number) {
      this.mx = Rx(tx).multiply(
        Ry(ty).multiply(
          Rz(tz).multiply(
            this.mx,
          ),
        ),
      );

      this.inv.multiply(Rz(-tz));
      this.inv.multiply(Ry(-ty));
      this.inv.multiply(Rx(-tx));
    }

    getRotation() {
      return this.mx;
    }

    getRotationAndInverse() {
      return {
        mx: this.mx.clone(),
        inv: this.inv.clone(),
      };
    }

    getPlane(side: Side) {
      const normalCamSpace = getNormalCubeSpace(side)
        .applyMatrix4(this.mx);

      const point = normalCamSpace
        .multiplyScalar(3 / 2);

      const { x: A, y: B, z: C } = normalCamSpace;
      const D = -A * point.x + -B * point.y + -C * point.z;
      return {
        A, B, C, D,
      };
    }
}
