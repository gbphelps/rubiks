let timeouts: ReturnType<typeof setTimeout>[] = [];

export function getTimeouts() {
  return timeouts;
}

export function cancelTimeouts() {
  timeouts.forEach((t) => clearTimeout(t));
  timeouts = [];
}

export function setTimeouts(incomingTimeouts: ReturnType<typeof setTimeout>[]) {
  timeouts.forEach((t) => clearTimeout(t));
  timeouts = incomingTimeouts;
}
