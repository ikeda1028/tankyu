import assert from 'node:assert/strict';
import { windowFocusAmount, smoothWindowFocus, isExteriorWindow } from '../window-view.js';
assert.equal(windowFocusAmount(Infinity), 0);
assert.equal(windowFocusAmount(3), 0);
assert.equal(windowFocusAmount(.3), 1);
assert(windowFocusAmount(1) > windowFocusAmount(1.8));
for (const dt of [1/30,1/60,1/90]) {
 let f=0;for(let t=0;t<1;t+=dt)f=smoothWindowFocus(f,1,dt);
 assert(f>.99,'approach reaches eye view');
 for(let t=0;t<1;t+=dt)f=smoothWindowFocus(f,0,dt);
 assert(f<.01,'looking away restores third person');
}
assert(isExteriorWindow('Rear_facade_glass'));
assert(isExteriorWindow('Terrace glazing.001'));
assert(!isExteriorWindow('Frosted privacy glass'));
assert(!isExteriorWindow('Terrace frame'));
console.log('PASS: near/far focus, frame-rate independent transitions, exterior-only glass selection.');

assert(isExteriorWindow('Curved_glass_edge'));
assert(isExteriorWindow('Future layer 8', 'Cyan architectural glazing'));
assert(!isExteriorWindow('Pool', 'Pool water'));
assert(!isExteriorWindow('Rear facade glass', 'Frosted privacy glass'));
