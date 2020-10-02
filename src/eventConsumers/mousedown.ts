import { getBoxRegistryNode, isCenterSquare } from '../boxRegistry';
import { Globals } from '../globals';

export default function mousedown(g: Globals) {
  const e = g.events.drain('mousedown');
  if (!e) throw new Error('Event already drained!');

  const screenCoords = g.events.extractScreenCoords(e);
  const data = g.projections.getProjectionOntoCube(screenCoords);

  if (!data) {
    g.cube.registry.deselectCube();
    g.cube.registry.setActiveBox(null);
    return;
  }

  const { cubeCoords, cameraCoords } = data;
  const boxRegistryNode = getBoxRegistryNode(cubeCoords);

  if (isCenterSquare(boxRegistryNode)) {
    g.action.setAction({
      type: 'rotate',
      prevScreenCoords: screenCoords,
      startRotation: g.cube.rotation.getRotationAndInverse(),
    });
  } else {
    g.action.setAction({
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

  g.cube.registry.setActiveBox(boxRegistryNode);
}
