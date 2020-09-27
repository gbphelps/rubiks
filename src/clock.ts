let t0 = 0;
let clock: any;
let sum = 0;
let stopped = true;

export function reset() {
  sum = 0;
  start();
}

export function stop() {
  if (stopped) return;
  stopped = true;
  sum += Date.now() - t0;
}

export function start() {
  stopped = false;
  t0 = Date.now();
}

export function init() {
  clock = document.getElementById('clock');
  setClock();
}

function leadingZeros(num: number, len: number) {
  let str = num.toString();
  while (str.length < len) {
    str = `0${str}`;
  }
  return str;
}

export function getTime() {
  let del = sum + (stopped ? 0 : Date.now() - t0);
  const millis = del % 1000;
  del -= millis;
  del /= 1000;
  const secs = del % 60;
  del -= secs;
  del /= 60;
  const mins = del % 60;
  del -= mins;
  del /= 60;
  const hours = del;

  return `${Math.floor(hours)}:${leadingZeros(mins, 2)}:${leadingZeros(secs, 2)}.${Math.floor(millis / 100)}`;
}

export function setClock() {
  clock.innerHTML = getTime();
}
