import * as THREE from 'three';
import { globals } from './globals';

let userEventsEnabled = true;

export function getUserEventsEnabled() {
  return userEventsEnabled;
}

export function setUserEventsEnabled(value: boolean) {
  userEventsEnabled = value;
}

const events: Record<string, false | MouseEvent> = {
  mousemove: false,
  mousedown: false,
  mouseup: false,
};

function assign(key: string) {
  return function enqueue(e: MouseEvent) {
    if (getUserEventsEnabled()) events[key] = e;
  };
}

export function extractScreenCoords(e: MouseEvent) {
  const { canvas } = globals;
  const {
    top: y0, left: x0, height, width,
  } = canvas.getBoundingClientRect();

  const x = ((e.clientX - x0) - width / 2) / globals.pixPerUnit;
  const y = (height / 2 - (e.clientY - y0)) / globals.pixPerUnit;

  return new THREE.Vector2(x, y);
}

export function init() {
  document.addEventListener('mousemove', assign('mousemove'));
  document.addEventListener('mousedown', assign('mousedown'));
  document.addEventListener('mouseup', assign('mouseup'));
}

export function drain(key: string) {
  const result = events[key];
  events[key] = false;
  return result;
}

export function flushEvents() {
  Object.keys(events).forEach((key) => {
    events[key] = false;
  });
}

export function peek(key: string) {
  return !!events[key];
}
