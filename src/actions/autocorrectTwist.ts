import { getAction } from '../action';

function lerp(p: number, from: number, to: number) {
  return from + (to - from) * p;
}

export default function autocorrectTwist() {
  const action = getAction();
  if (!action || action.type !== 'twist-autocorrect') return;
  const p = action.params.progressFn();
  const from = action.params.fromTorque;
  const to = action.params.toTorque;

  action.params.tranche.forEach((box) => {
    if (!box) throw new Error();
    box.setRotationFromAxisAngle(
      action.params.unitTorque,
      lerp(p, from, to),
    );
  });
}
