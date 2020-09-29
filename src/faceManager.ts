import { globals } from './globals';
import {
  sides, Side, colors,
} from './utils/types';

function makeBox(faceElement: HTMLDivElement) {
  const black = document.createElement('div');
  black.classList.add('black');
  const decal = document.createElement('div');
  decal.classList.add('decal');
  black.appendChild(decal);
  faceElement.appendChild(black);
  return decal;
}

function makeFace(id: Side) {
  const faceElement = document.getElementById(id) as HTMLDivElement;
  const face: HTMLDivElement[][] = [];
  for (let i = 0; i < 3; i++) {
    face.push([]);
    for (let j = 0; j < 3; j++) {
      face[i][j] = makeBox(faceElement);
    }
  }
  return face;
}

function getHex(color: string | number) {
  if (typeof color === 'string') return color;
  let str = color.toString(16);
  while (str.length < 6) str = `0${str}`;
  return `#${str}`;
}

class FaceManager {
    left: HTMLDivElement[][];

    right: HTMLDivElement[][];

    top: HTMLDivElement[][];

    bottom: HTMLDivElement[][];

    front: HTMLDivElement[][];

    back: HTMLDivElement[][];

    puzzleSolved = false;

    init() {
      sides.forEach((side) => {
        this[side] = makeFace(side);
      });
    }

    set(side: Side, colorNames: string[][]) {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          const threeColor = colors[colorNames[x][y]];
          const color = getHex(threeColor);
          this[side][2 - y][x].style.background = color;
        }
      }
    }

    updateFaces() {
      let allSolved = true;
      sides.forEach((side) => {
        const colors = globals.cube.registry.extractSide(side);
        this.set(side, colors);
        if (!sideIsSolved(colors)) allSolved = false;
      });
      if (allSolved) this.puzzleSolved = true;
    }
}

function sideIsSolved(colors: string[][]): boolean {
  const color = colors[0][0];
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors[0].length; j++) {
      if (colors[i][j] !== color) return false;
    }
  }
  return true;
}

export default new FaceManager();
