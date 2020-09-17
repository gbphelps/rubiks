let t0 = 0;
let clock: any;

export function init() {
  t0 = Date.now();
  clock = document.getElementById('clock');
}

function leadingZeros(num: number, len: number) {
  let str = num.toString();
  while (str.length < len) {
    str = `0${str}`;
  }
  return str;
}

function getTime() {
  const now = Date.now();
  let del = now - t0;
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
