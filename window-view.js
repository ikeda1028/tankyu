// Window focus leaves collision and movement untouched: only the view changes.
export function windowFocusAmount(distance) {
  if (!Number.isFinite(distance)) return 0;
  const t = Math.max(0, Math.min(1, (2.2 - distance) / 1.65));
  return t * t * (3 - 2 * t);
}
export function smoothWindowFocus(current, target, dt) {
  return current + (target - current) * (1 - Math.exp(-8 * Math.max(0, Math.min(.1, dt))));
}
export function isExteriorWindow(name) {
  return /^(Rear facade glass|Terrace glazing)(?:[._ ]\d+)?$/i.test(name.replaceAll('_', ' '));
}
