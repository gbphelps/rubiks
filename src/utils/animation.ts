export function easeInOut(x: number) {
  if (x < 0.5) {
    return (x * x) * 2;
  }
  return 1 - (1 * x - 1) * (2 * x - 2);
}

export function progress(millis: number, cleanup: () => void) {
  const t0 = Date.now();
  return function getProgress() {
    let x = (Date.now() - t0) / millis;
    if (x >= 1) {
      cleanup();
      x = 1;
    }
    return easeInOut(x);
  };
}
