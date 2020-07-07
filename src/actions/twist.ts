import * as THREE from 'three';
import {
  setAction, TwistAction, getAction,
} from '../action';
import { extractScreenCoords } from '../events';
import { getProjectionOntoSide, getCameraCoords, getScreenCoords } from '../cubeProjections';
import {
  getNormalCubeSpace, CoordTriad, Axis,
} from '../utils/types';

import { getTranche, getActiveNode } from '../boxRegistry';
import getUserTorque from '../getUserTorque';

const THRESHHOLD = 0.01;

function getCardinalDirection(vec: THREE.Vector3) {
  // Gives cardinal unit vector that most closely corresponds to vec.

  let ordinate: null | Axis = null;
  const coords: (Axis)[] = ['x', 'y', 'z'];

  for (let i = 0; i < 3; i++) {
    const testDimension = coords[i];
    if (!ordinate) {
      ordinate = coords[i];
      continue;
    } else if (Math.abs(vec[ordinate]) < Math.abs(vec[testDimension])) {
      ordinate = testDimension;
    }
  }

  const result = new THREE.Vector3(0, 0, 0);

  for (let i = 0; i < 3; i++) {
    const testDimension = coords[i];
    if (testDimension === ordinate) {
      result[ordinate] = vec[ordinate] > 0 ? 1 : -1;
    }
  }

  return result;
}

function getScreenDirection(startPosition: CoordTriad, direction: THREE.Vector3) {
  const cameraStart = startPosition.cameraCoords;
  const cameraDir = getCameraCoords(direction);
  const end = new THREE.Vector3(
    cameraStart.x + cameraDir.x,
    cameraStart.y + cameraDir.y,
    cameraStart.z + cameraDir.z,
  );

  const screenEnd = getScreenCoords(end);
  const screenStart = startPosition.screenCoords;
  const r = {
    x: screenEnd.x - screenStart.x,
    y: screenEnd.y - screenStart.y,
  };
  const mag = Math.sqrt(r.x * r.x + r.y * r.y);

  return {
    x: r.x / mag,
    y: r.y / mag,
  };
}

function canSetTorqueParams(e: MouseEvent, action: TwistAction) {
  const { x: x1, y: y1 } = action.startPosition.screenCoords;
  const { x: x2, y: y2 } = extractScreenCoords(e);
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) >= THRESHHOLD * THRESHHOLD;
}

function getTorqueParams(e: MouseEvent, action: TwistAction) {
  const screenCoords = extractScreenCoords(e);
  const { cubeCoords } = getProjectionOntoSide(screenCoords, action.side);

  const vec = (new THREE.Vector3()).subVectors(
    cubeCoords,
    action.startPosition.cubeCoords,
  );

  const direction = getCardinalDirection(vec);
  const screenDirection = getScreenDirection(action.startPosition, direction);

  const unitTorque = (new THREE.Vector3()).crossVectors(
    getNormalCubeSpace(action.side),
    direction,
  );

  const activeNode = getActiveNode();
  if (!activeNode) throw new Error();

  return {
    direction,
    screenDirection,
    unitTorque,
    tranche: getTranche(unitTorque),
    activeNode,
  };
}

export default function applyTwist(e: MouseEvent) {
  const action = getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();

  let { torqueParams } = action;
  if (!torqueParams) {
    // When user first starts dragging, we don't have a good sense for
    // which direction they want to drag in. So we wait until their drag
    // distance has reached a certain threshhold here. Note that THRESHHOLD
    // is in screen units (the cube is 3x3x3 in screen units).
    if (!canSetTorqueParams(e, action)) return;
    torqueParams = getTorqueParams(e, action);
    setAction({
      ...action,
      torqueParams,
    });
  }

  const { unitTorque, tranche } = torqueParams;
  tranche.forEach((box) => {
    if (!box) throw new Error('Tried to access unintialized box');
    box.setRotationFromAxisAngle(
      unitTorque,
      getUserTorque(e),
    );
  });
}
