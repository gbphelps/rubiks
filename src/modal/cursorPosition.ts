import * as THREE from 'three';
import { Globals } from '../globals';

function getId(id: string) {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Element with ID ${id} was not found in the DOM tree! Did you delete anything from index.html?`);
  return result;
}

let cursorPosition: THREE.Vector2 = new THREE.Vector2();

export function setCursorPosition(g: Globals, pos: THREE.Vector2) {
  cursorPosition = pos;
  updateCursor(g);
}

export function updateCursor(g: Globals) {
  const cursor = getId('cursor');
  const dely = getId('faux-canvas').getBoundingClientRect().top - getId('faux-container').getBoundingClientRect().top;
  cursor.style.top = `${dely + g.canvas.height / 2 - cursorPosition.y * g.pixPerUnit}px`;
  cursor.style.left = `${g.canvas.width / 2 + cursorPosition.x * g.pixPerUnit}px`;
}
