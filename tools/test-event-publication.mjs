import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const ctx = vm.createContext({
  state: { customEvents: [] }, seedEncounters: [], publicExploration: { points: [] },
  ensureEventCharacter: (event) => event, normalizeEventModel3d: (model) => model,
  createEventId: () => "verified-event", clamp: (value) => value,
  createPositionFromLatLng: (lat, lng) => ({ lat, lng }), createMapPosition: () => ({}),
});
for (const name of ["normalizeExternalUrl", "isVerifiedAiSuggestion", "isPublishableEncounter", "getEncounters", "suggestionToEventData"]) {
  const start = source.indexOf("function " + name + "(");
  const end = source.indexOf("\nfunction ", start + 1);
  vm.runInContext(source.slice(start, end), ctx);
}
const verified = {
  title: "検証用イベント", sourceUrl: "https://example.org/event/1",
  sourceTitle: "主催者の案内", sourceType: "official",
  verificationNote: "ページ内容を確認", verificationLevel: "strict",
  verifiedAt: "2026-09-18T00:00:00Z", eventType: "limited",
};
const registered = ctx.suggestionToEventData(verified);
assert.equal(registered.verificationLevel, "strict");
assert.equal(registered.verifiedAt, verified.verifiedAt);
assert.equal(ctx.isPublishableEncounter(registered), true);
assert.equal(ctx.isPublishableEncounter({ ...registered, verificationLevel: "" }), false);
assert.equal(ctx.isPublishableEncounter({ ...registered, sourceUrl: "javascript:alert(1)" }), false);
assert.equal(ctx.isPublishableEncounter({ id: "sea-plastic-fieldwork" }), false);
assert.equal(ctx.isPublishableEncounter({ id: "my-3d-point", model3d: { modelUrl: "assets/fudo.glb" } }), true);
ctx.state.customEvents = [registered, { ...registered, id: "old-ai", verificationLevel: "" }];
assert.equal(ctx.getEncounters().length, 1);
ctx.state.customEvents = [];
assert.equal(ctx.getEncounters().length, 0);
const firebase = vm.createContext({ window: {} });
vm.runInContext(await readFile(new URL("../firebase-sync.js", import.meta.url), "utf8"), firebase);
const shared = firebase.window.WakuwakuFirebase.createPublicExploration({
  customEvents: [{ ...registered, position: { lat: 35, lng: 139 } }],
});
assert.equal(shared.points[0].sourceUrl, verified.sourceUrl);
assert.equal(shared.points[0].verificationLevel, "strict");
assert.equal(shared.points[0].aiGenerated, true);
console.log("PASS: source links and verification survive registration/sharing; samples and unverified AI events excluded");
