import * as THREE from 'three';

export class Events {
  userEventsEnabled = true;

  events: Record<string, false | MouseEvent> = {
    mousemove: false,
    mousedown: false,
    mouseup: false,
  };

  getPPU: () => number;

  canvas: HTMLCanvasElement;

  constructor({ getPPU, canvas }:{
    getPPU: () => number,
    canvas: HTMLCanvasElement,
  }) {
    this.getPPU = getPPU;
    this.canvas = canvas;
  }

  getUserEventsEnabled() {
    return this.userEventsEnabled;
  }

  setUserEventsEnabled(value: boolean) {
    this.userEventsEnabled = value;
  }

  assign(key: string) {
    return (e: MouseEvent) => {
      if (this.getUserEventsEnabled()) this.events[key] = e;
    };
  }

  extractScreenCoords(e: MouseEvent) {
    const {
      top: y0, left: x0, height, width,
    } = this.canvas.getBoundingClientRect();

    const x = ((e.clientX - x0) - width / 2) / this.getPPU();
    const y = (height / 2 - (e.clientY - y0)) / this.getPPU();

    return new THREE.Vector2(x, y);
  }

  init() {
    document.addEventListener('mousemove', this.assign('mousemove'));
    document.addEventListener('mousedown', this.assign('mousedown'));
    document.addEventListener('mouseup', this.assign('mouseup'));
  }

  drain(key: string) {
    const result = this.events[key];
    this.events[key] = false;
    return result;
  }

  flushEvents() {
    Object.keys(this.events).forEach((key) => {
      this.events[key] = false;
    });
  }

  peek(key: string) {
    return !!this.events[key];
  }
}
