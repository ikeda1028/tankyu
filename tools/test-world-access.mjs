import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../world-access.js", import.meta.url), "utf8");
let options;
const context = vm.createContext({ navigator: { geolocation: { getCurrentPosition(resolve, reject, value) { options = value; resolve(fix); } } } });
vm.runInContext(source, context);
const { WorldAccess: access } = context;
const now = Date.now();
const entrance = { lat: 35, lng: 139 };
const fix = { coords: { latitude: 35, longitude: 139, accuracy: 5 }, timestamp: now };
assert.equal(access.assess(entrance, fix, now).allowed, true);
assert.equal(access.assess(entrance, { ...fix, coords: { ...fix.coords, latitude: 36 } }, now).reason, "far");
assert.equal(access.assess(null, fix, now).reason, "entrance");
assert.equal(access.assess({ lat: null, lng: null }, fix, now).allowed, false);
assert.equal(access.assess({ lat: 91, lng: 139 }, fix, now).allowed, false);
assert.equal(access.assess(entrance, { ...fix, timestamp: now - 60001 }, now).reason, "location");
assert.equal(access.assess(entrance, { ...fix, timestamp: now + 6000 }, now).allowed, false);
assert.equal(access.assess(entrance, null, now).allowed, false);
assert.equal(access.assess(entrance, { ...fix, coords: { ...fix.coords, accuracy: 200 } }, now).reason, "accuracy");
assert.equal(access.assess(entrance, { ...fix, coords: { ...fix.coords, accuracy: NaN } }, now).allowed, false);
assert.equal(access.assess(entrance, { ...fix, coords: { ...fix.coords, accuracy: null } }, now).allowed, false);
for (const [distance, expected] of [[access.radius - 1, true], [access.radius + 1, false]]) {
  const latitude = entrance.lat + distance / 6371000 * 180 / Math.PI;
  assert.equal(access.assess(entrance, { ...fix, coords: { ...fix.coords, latitude } }, now).allowed, expected);
}
await access.locate();
assert.equal(options.maximumAge, 0);
assert.equal(options.enableHighAccuracy, true);
const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
assert.ok(app.includes("getModelWorldUrl(model3d, encounter.title, encounter.position)"));
assert.ok(app.includes("getModelWorldUrl(model3d, encounter?.title, encounter?.position)"));
assert.ok(app.includes("getModelWorldUrl(model3d, world.title, getWorldAccessPosition(world))"));
const html = await readFile(new URL("../model-world.html", import.meta.url), "utf8");
assert.ok(html.includes('body class="entry-locked"'));
assert.ok(html.includes("if (!result.allowed) { lockEntry(result); return false; }"));
assert.ok(html.includes('viewer.removeAttribute("src")'));
for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);

function mockElement() {
  const attrs = new Map(), classes = new Set();
  return {
    hidden: false, disabled: false, textContent: "", events: {}, style: {}, parentElement: {},
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    addEventListener(type, fn) { this.events[type] = fn; },
    removeAttribute: (name) => attrs.delete(name), getAttribute: (name) => attrs.get(name),
    set src(value) { attrs.set("src", value); },
    querySelectorAll: () => [],
  };
}
async function testViewer(query, requireLocation = true) {
  const elements = new Map();
  const document = { hidden: false, body: mockElement(), events: {}, querySelectorAll: () => [],
    querySelector(selector) { if (!elements.has(selector)) elements.set(selector, mockElement()); return elements.get(selector); },
    addEventListener(type, fn) { this.events[type] = fn; },
  };
  let currentFix = fix, watch;
  const sandbox = vm.createContext({ document, URLSearchParams, location: { search: query }, setInterval: () => 1, clearInterval() {},
    WAKUWAKU_CONFIG: { worldAccess: { requireLocation } },
    navigator: { geolocation: { getCurrentPosition(resolve) { resolve(currentFix); }, watchPosition(fn) { watch = fn; return 1; }, clearWatch() {} } },
  });
  vm.runInContext(source, sandbox);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(script[1], sandbox);
  const viewer = document.querySelector("#world-model"), button = document.querySelector("#entry-check");
  if (!requireLocation) {
    assert.equal(viewer.getAttribute("src"), "/assets/fudo.glb", "unrestricted entry loads without GPS");
    assert.equal(document.querySelector("#entry-gate").hidden, true);
    assert.equal(watch, undefined, "no location tracking while restriction is disabled");
    assert.equal(document.events.visibilitychange, undefined);
    return;
  }
  assert.equal(viewer.getAttribute("src"), undefined, "no model fetched before location check");
  if (!query.includes("lat=")) { assert.equal(button.disabled, true); return; }
  currentFix = { ...fix, coords: { ...fix.coords, latitude: 36 } };
  await button.events.click();
  assert.equal(viewer.getAttribute("src"), undefined, "distant visitor stays locked");
  currentFix = fix;
  await button.events.click();
  assert.equal(viewer.getAttribute("src"), "/assets/fudo.glb", "nearby visitor enters");
  watch({ ...fix, coords: { ...fix.coords, latitude: 36 } });
  assert.equal(viewer.getAttribute("src"), undefined, "leaving area revokes entry");
  await button.events.click();
  document.hidden = true;
  document.events.visibilitychange();
  assert.equal(viewer.getAttribute("src"), undefined, "return requires new check");
}
await testViewer("?src=/assets/fudo.glb&lat=35&lng=139");
await testViewer("?src=/assets/fudo.glb");
await testViewer("?src=/assets/fudo.glb", false);
assert.equal(access.requiresLocation(), true, "missing configuration fails closed");
context.WAKUWAKU_CONFIG = { worldAccess: { requireLocation: false } };
assert.equal(access.assessWorld(null, null).allowed, true);
assert.equal(access.assess(entrance, null).allowed, false, "mentor encounter still needs location");
context.WAKUWAKU_CONFIG.worldAccess.requireLocation = true;
assert.equal(access.assessWorld(entrance, null).allowed, false, "restriction can be restored");
const preview = mockElement();
preview.querySelector = () => mockElement();
const world = { id: "test-world", title: "Visible world name", entrance: "Visible entrance", entrancePosition: entrance, map: { summary: "Hidden world content" }, visualMap: { imageDataUrl: "private-preview" } };
const appContext = vm.createContext({
  WorldAccess: access, els: { worldMapPreview: preview }, state: { ui: { worldViewMode: "view" } },
  worldEntryFixes: new Map(), canViewWorldHere: () => false, getWorldAccessPosition: () => entrance,
  getCurrentWorldAgeMode: () => "standard", escapeHtml: (text) => text,
});
vm.runInContext(app.slice(app.indexOf("function renderWorldMapPreview("), app.indexOf("function getSelectedWorld(")), appContext);
appContext.renderWorldMapPreview(world);
assert.ok(preview.innerHTML.includes(world.title));
assert.ok(preview.innerHTML.includes("100m"));
assert.ok(!preview.innerHTML.includes("Hidden world content"));
assert.ok(!preview.innerHTML.includes("private-preview"));
console.log("PASS: 100m boundary, fresh/accurate fixes, missing entrance, viewer lock/enter/leave/background and guarded links");
