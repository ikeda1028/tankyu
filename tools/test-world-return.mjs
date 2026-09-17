import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../model-world.html", import.meta.url), "utf8");
const flow = source.slice(source.indexOf("function closeOpeningScreen("), source.indexOf("function playOpeningVideo("));

for (const returning of [true, false]) {
  let plays = 0;
  let maps = 0;
  let pauses = 0;
  let hidden = false;
  const location = { href: `https://example.test/?other=keep${returning ? "&return=map" : ""}#place` };
  const historyState = { retained: true };
  const context = vm.createContext({
    URL,
    window: { location, history: {
      state: historyState,
      replaceState(state, title, href) {
        assert.equal(state, historyState);
        location.href = href;
      },
    } },
    els: {
      openingVideo: { pause() { pauses++; } },
      openingScreen: { classList: { add(name) { hidden = name === "hidden"; } } },
    },
    openMapAfterOpening() { maps++; },
    playOpeningVideo() { plays++; },
  });
  vm.runInContext(flow, context);
  context.startOpeningFlow();
  assert.equal(plays, returning ? 0 : 1);
  assert.equal(maps, returning ? 1 : 0);
  assert.equal(pauses, returning ? 1 : 0);
  assert.equal(hidden, returning);
  assert.equal(location.href, "https://example.test/?other=keep#place");
  // The return flag is one-shot; a later normal reload still plays the intro.
  context.startOpeningFlow();
  assert.equal(plays, returning ? 1 : 2);
}

const links = [...html.matchAll(/<a class="back" href="([^"]+)"/g)];
assert.equal(links.length, 2);
assert.ok(links.every((link) => link[1] === "/?return=map"));
assert.ok(source.lastIndexOf("startOpeningFlow();") > source.lastIndexOf("applyAgeBasedMode({ force: true })"));
console.log("PASS: 3D close/error return directly to map, normal startup retains opening, one-shot return preserves URL state");
