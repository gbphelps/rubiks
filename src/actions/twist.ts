import * as THREE from 'three';
import {
  TwistAction,
} from '../action';
import {
  getNormalCubeSpace, CoordTriad, Axis,
} from '../utils/types';

import getUserTorque from '../getUserTorque';
import { Globals } from '../globals';

const THRESHHOLD = 0.1;

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

function getScreenDirection(g: Globals, startPosition: CoordTriad, direction: THREE.Vector3) {
  const cameraStart = startPosition.cameraCoords;
  const cameraDir = g.projections.getCameraCoordsFromCubeCoords(direction);
  const end = new THREE.Vector3(
    cameraStart.x + cameraDir.x,
    cameraStart.y + cameraDir.y,
    cameraStart.z + cameraDir.z,
  );

  const screenEnd = g.projections.getScreenCoordsFromCameraCoords(end);
  const screenStart = startPosition.screenCoords;
  const r = {
    x: screenEnd.x - screenStart.x,
    y: screenEnd.y - screenStart.y,
  };
  const mag = Math.sqrt(r.x * r.x + r.y * r.y);

  return new THREE.Vector2(r.x / mag, r.y / mag);
}

function canSetTorqueParams(g: Globals, e: MouseEvent, action: TwistAction) {
  const { x: x1, y: y1 } = action.startPosition.screenCoords;
  const { x: x2, y: y2 } = g.events.extractScreenCoords(e);
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) >= THRESHHOLD * THRESHHOLD;
}

function getTorqueParams(g: Globals, e: MouseEvent, action: TwistAction) {
  const screenCoords = g.events.extractScreenCoords(e);
  const { cubeCoords } = g.projections.getProjectionOntoSide({
    screen: screenCoords, side: action.side,
  });

  const vec = (new THREE.Vector3()).subVectors(
    cubeCoords,
    action.startPosition.cubeCoords,
  );

  const direction = getCardinalDirection(vec);
  const screenDirection = getScreenDirection(g, action.startPosition, direction);

  const unitTorque = (new THREE.Vector3()).crossVectors(
    getNormalCubeSpace(action.side),
    direction,
  );

  const activeNode = g.cube.registry.getActiveNode();
  if (!activeNode) throw new Error();

  return {
    direction,
    screenDirection,
    unitTorque,
    tranche: g.cube.registry.getTranche(unitTorque),
    activeNode,
  };
}

export default function applyTwist(g: Globals, e: MouseEvent) {
  const action = g.action.getAction();
  if (!action) throw new Error();
  if (action.type !== 'twist') throw new Error();

  let { torqueParams } = action;
  if (!torqueParams) {
    // When user first starts dragging, we don't have a good sense for
    // which direction they want to drag in. So we wait until their drag
    // distance has reached a certain threshhold here. Note that THRESHHOLD
    // is in screen units (the cube is 3x3x3 in screen units).
    if (!canSetTorqueParams(g, e, action)) return;
    torqueParams = getTorqueParams(g, e, action);
    g.action.setAction({
      ...action,
      torqueParams,
    });
  }

  const { unitTorque, tranche } = torqueParams;
  tranche.forEach((box) => {
    if (!box) throw new Error('Tried to access unintialized box');
    box.setRotationFromAxisAngle(
      unitTorque,
      getUserTorque(g, e),
    );
  });
}
