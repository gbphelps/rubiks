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
        const extractedColors = globals.cube.registry.extractSide(side);
        this.set(side, extractedColors);
        if (!sideIsSolved(extractedColors)) allSolved = false;
      });
      if (allSolved) this.puzzleSolved = true;
    }
}

function sideIsSolved(extractedColors: string[][]): boolean {
  const color = extractedColors[0][0];
  for (let i = 0; i < extractedColors.length; i++) {
    for (let j = 0; j < extractedColors[0].length; j++) {
      if (extractedColors[i][j] !== color) return false;
    }
  }
  return true;
}

export default new FaceManager();
