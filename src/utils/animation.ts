export function easeInOut(x: number) {
  if (x < 0.5) {
    return (x * x) * 2;
  }
  return 1 - (1 * x - 1) * (2 * x - 2);
}

export function lerp(p: number, from: number, to: number) {
  return from + (to - from) * p;
}

export function progress(
  millis: number,
  ease: (x: number) => number,
  worker: (p: number) => void,
  cleanup: () => void,
) {
  const t0 = Date.now();
  return function getProgress() {
    const x = (Date.now() - t0) / millis;
    let p = ease(x);
    if (x >= 1) p = 1;
    worker(p);
    if (p === 1) {
      cleanup();
    }
  };
}
