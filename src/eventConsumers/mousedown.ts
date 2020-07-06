import { drain, extractScreenCoords } from '../events';
import { getProjectionOntoCube } from '../cubeProjections';
import * as boxRegistry from '../boxRegistry';
import { setAction } from '../action';

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
  const boxRegistryNode = boxRegistry.getBoxRegistryNode(cubeCoords);

  if (boxRegistry.isCenterSquare(boxRegistryNode)) {
    setAction({
      type: 'rotate',
      prevScreenCoords: screenCoords,
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
