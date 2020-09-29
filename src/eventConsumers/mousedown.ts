import { drain, extractScreenCoords } from '../events';
import { getProjectionOntoCube } from '../cubeProjections';
import { getBoxRegistryNode, isCenterSquare } from '../boxRegistry';
import { setAction } from '../action';
import { globals } from '../globals';

export default function mousedown() {
  const e = drain('mousedown');
  if (!e) throw new Error('Event already drained!');

  const screenCoords = extractScreenCoords(e);
  const data = getProjectionOntoCube(screenCoords);

  if (!data) {
    globals.cube.registry.deselectCube();
    globals.cube.registry.setActiveBox(null);
    return;
  }

  const { cubeCoords, cameraCoords } = data;
  const boxRegistryNode = getBoxRegistryNode(cubeCoords);

  if (isCenterSquare(boxRegistryNode)) {
    setAction({
      type: 'rotate',
      prevScreenCoords: screenCoords,
      startRotation: globals.cube.rotation.getRotationAndInverse(),
    });
  } else {
    setAction({
      type: 'twist',
      startPosition: {
        cubeCoords,
        cameraCoords,
        screenCoords,
      },
      side: data.side,
      torqueParams: null,
    });
  }

  globals.cube.registry.setActiveBox(boxRegistryNode);
}
