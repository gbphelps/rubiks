import { drain, extractScreenCoords } from '../events';
import { getProjectionOntoCube } from '../cubeProjections';
import boxRegistry, { getBoxRegistryNode, isCenterSquare } from '../boxRegistry';
import { setAction } from '../action';
import { getRotationAndInverse } from '../rotation';

export default function mousedown() {
  const e = drain('mousedown');
  if (!e) throw new Error('Event already drained!');

  const screenCoords = extractScreenCoords(e);
  const data = getProjectionOntoCube(screenCoords);

  if (!data) {
    boxRegistry.deselectCube();
    boxRegistry.setActiveBox(null);
    return;
  }

  const { cubeCoords, cameraCoords } = data;
  const boxRegistryNode = getBoxRegistryNode(cubeCoords);

  if (isCenterSquare(boxRegistryNode)) {
    setAction({
      type: 'rotate',
      prevScreenCoords: screenCoords,
      startRotation: getRotationAndInverse(),
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

  boxRegistry.setActiveBox(boxRegistryNode);
}
