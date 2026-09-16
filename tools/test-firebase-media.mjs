import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import vm from "node:vm";

const source = await readFile(new URL("../firebase-sync.js", import.meta.url), "utf8");
const objects = new Map();
let document, failUpload = false;
const authInstance = { currentUser: { uid: "owner-uid", email: "owner@example.com", emailVerified: true }, authStateReady: async () => {} };
const firebase = {
  authInstance, db: {}, storageBucket: {},
  firestore: {
    doc: (_db, collection, id) => ({ collection, id }),
    setDoc: async (ref, value) => { assert.equal(ref.id, "owner@example_com"); document = value; },
    getDoc: async () => ({ exists: () => Boolean(document), data: () => structuredClone(document) }),
    serverTimestamp: () => "server-time",
  },
  storage: {
    ref: (_bucket, path) => path,
    uploadBytes: async (path, blob, metadata) => {
      if (failUpload) throw Object.assign(new Error("denied"), { code: "storage/unauthorized" });
      assert.match(path, /^media\/owner-uid\/(avatars|worldMaps|eventCharacters|fieldPosts)\/[a-f0-9]{64}\.png$/);
      assert.equal(metadata.contentType, "image/png");
      objects.set(path, blob);
    },
    getDownloadURL: async (path) => `https://storage.example.test/${path}`,
  },
};
const context = vm.createContext({ window: {}, firebase, Blob, atob, crypto: webcrypto, TextEncoder });
vm.runInContext(source, context);
vm.runInContext("firebaseAuth = firebase.authInstance; connectFirebase = async () => firebase", context);
const api = context.window.WakuwakuFirebase;
const image = "data:image/png;base64,YQ==";
const input = {
  member: { name: "Owner", avatar: { imageDataUrl: image, symbol: "star" } },
  worlds: [{ id: "world", visualMap: { imageDataUrl: image }, model3d: { modelUrl: "https://example.test/world.glb" } }],
  customEvents: [{ id: "point", character: { imageDataUrl: image, name: "Guide" } }],
  fieldPosts: [{ id: "photo", image: { dataUrl: image } }],
};
const identity = { auth: { email: "owner@example.com" } };
const result = await api.saveSnapshot({}, identity, input);
assert.equal(result.mediaUploadError, "");
assert.equal(objects.size, 4);
assert.equal(input.member.avatar.imageDataUrl, image, "Original local media is not mutated");
assert.equal(JSON.stringify(document.snapshot).includes("data:image"), false);
const remote = await api.loadSnapshot({}, identity);
for (const media of [remote.snapshot.member.avatar, remote.snapshot.worlds[0].visualMap, remote.snapshot.customEvents[0].character, remote.snapshot.fieldPosts[0].image]) {
  assert.ok(objects.has(media.storagePath));
  assert.equal(media.downloadUrl, `https://storage.example.test/${media.storagePath}`);
}
assert.equal(remote.snapshot.worlds[0].model3d.modelUrl, input.worlds[0].model3d.modelUrl);
const firstUrl = result.snapshot.member.avatar.downloadUrl;
await api.saveSnapshot({}, identity, { member: { avatar: { imageDataUrl: "data:image/png;base64,Yg==" } } });
assert.notEqual(document.snapshot.member.avatar.downloadUrl, firstUrl, "New avatar cannot overwrite or reuse a cached old URL");
assert.equal(objects.size, 5);
failUpload = true;
const before = document;
await assert.rejects(api.saveSnapshot({}, identity, { member: { avatar: { imageDataUrl: "data:image/png;base64," + "YQ==".slice(0, 2).repeat(600000) } } }), { code: "storage/media-save-failed" });
assert.equal(document, before, "Failed media save does not replace cloud data");

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
context.normalizeAvatar = (value) => value;
vm.runInContext(app.slice(app.indexOf("function applySavedMediaSnapshot("), app.indexOf("function hasLocalAvatarImage(")), context);
const local = structuredClone(input);
local.member.avatar.imageDataUrl = "new-image";
local.worlds[0].title = "Edited during upload";
local.customEvents[0].character.name = "New guide";
local.fieldPosts = [{ id: "new-post", image: { dataUrl: image } }];
context.applySavedMediaSnapshot(local, input, result.snapshot);
assert.equal(local.member.avatar.imageDataUrl, "new-image");
assert.equal(local.worlds[0].title, "Edited during upload");
assert.equal(local.worlds[0].visualMap.downloadUrl, result.snapshot.worlds[0].visualMap.downloadUrl);
assert.equal(local.customEvents[0].character.name, "New guide");
assert.equal(local.fieldPosts.length, 1);
assert.equal(local.fieldPosts[0].id, "new-post", "Deleted records stay deleted; new records survive sync");
console.log("PASS: four media types, cross-client restore, immutable URLs, failure preservation, concurrent edits");
