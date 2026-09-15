import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("firebase-sync.js", root), "utf8");
const writes = [];
const reads = [];
const authInstance = { currentUser: null, authStateReady: async () => {} };
const firestore = {
  doc: (_db, collection, id) => ({ collection, id }),
  getDoc: async (ref) => {
    reads.push(ref);
    return { exists: () => true, data: () => ({ snapshot: { customEvents: [{ id: "fudo", model3d: { modelUrl: "assets/fudo.glb" } }] } }) };
  },
  setDoc: async (ref, value) => { writes.push({ ref, value }); },
  serverTimestamp: () => "server-time",
};
const context = vm.createContext({ window: {}, authInstance, firestore, TextEncoder });
vm.runInContext(source, context);
vm.runInContext("firebaseAuth = authInstance; connectFirebase = async () => ({authInstance, firestore, db:{}})", context);
const api = context.window.WakuwakuFirebase;
const state = { auth: { email: "owner@example.com" } };
const snapshot = { customEvents: [{ id: "fudo", model3d: { modelUrl: "assets/fudo.glb" } }] };

for (const currentUser of [null, { email: "other@example.com", emailVerified: true }, { email: "owner@example.com", emailVerified: false }]) {
  authInstance.currentUser = currentUser;
  await assert.rejects(api.saveSnapshot({}, state, snapshot), { code: "auth/identity-required" });
  await assert.rejects(api.loadSnapshot({}, state), { code: "auth/identity-required" });
}
assert.equal(writes.length, 0);
assert.equal(reads.length, 0);
authInstance.currentUser = { email: "owner@example.com", emailVerified: true };
assert.equal(api.isAuthenticated(" OWNER@example.com "), true);
await api.saveSnapshot({}, state, snapshot);
assert.equal(writes[0].ref.id, "owner@example_com");
assert.equal(writes[0].value.emailLower, "owner@example.com");
assert.equal(writes[0].value.snapshot.customEvents[0].model3d.modelUrl, "assets/fudo.glb");
const loaded = await api.loadSnapshot({}, state);
assert.equal(loaded.snapshot.customEvents[0].model3d.modelUrl, "assets/fudo.glb");

const app = await readFile(new URL("app.js", root), "utf8");
const mergeSource = app.slice(app.indexOf("function mergeLegacyCloudSnapshot("), app.indexOf("function getFirebaseErrorMessage("));
vm.runInContext(mergeSource, context);
const cloud = { member: { name: "Owner", avatar: {} }, customEvents: [{ id: "fudo", updatedAt: "2026-06-17" }], worlds: [], fieldPosts: [] };
const local = { member: { avatar: { downloadUrl: "https://example.com/avatar.png" } }, customEvents: [{ ...snapshot.customEvents[0], updatedAt: "2026-09-15" }], worlds: [{ id: "world", model3d: snapshot.customEvents[0].model3d }], fieldPosts: [{ id: "photo" }] };
const merged = context.mergeLegacyCloudSnapshot(cloud, local);
assert.equal(merged.customEvents.length, 1);
assert.equal(merged.customEvents[0].model3d.modelUrl, "assets/fudo.glb");
assert.equal(merged.worlds[0].id, "world");
assert.equal(merged.fieldPosts[0].id, "photo");
assert.equal(merged.member.name, "Owner");
assert.equal(merged.member.avatar.downloadUrl, local.member.avatar.downloadUrl);
assert.equal(cloud.customEvents[0].model3d, undefined);
const withProfile = context.mergeLegacyCloudSnapshot({ member: { name: "Owner", grade: "old", avatar: { downloadUrl: "cloud.png" } } }, { member: { name: "Owner", grade: "new", avatar: {} } });
assert.equal(withProfile.member.grade, "new");
assert.equal(withProfile.member.avatar.downloadUrl, "cloud.png");
const privateSentinel = "PRIVATE_ONLY";
const mixed = {
  auth: { email: privateSentinel }, member: { name: privateSentinel },
  currentLocation: { lat: 1, lng: 2 }, fieldPosts: [{ text: privateSentinel }],
  customEvents: [{ id: "fudo", title: "Fudo", position: { lat: 35, lng: 139, private: privateSentinel },
    model3d: { modelUrl: "https://example.com/fudo.glb", taskId: privateSentinel },
    character: { name: "Guide", imageDataUrl: "data:image/png;base64,YQ==", private: privateSentinel },
    reflection: privateSentinel }, { id: "invalid", position: { lat: null, lng: "" } }],
  worlds: [{ id: "world", title: "World", sourcePointId: "fudo", discoveries: [{ text: privateSentinel }],
    visualMap: { downloadUrl: "https://example.com/map.jpg", prompt: privateSentinel },
    map: { summary: "Public", zones: [{ name: "Entrance", clue: "Look", private: privateSentinel }] } }],
};
const shared = api.createPublicExploration(mixed);
assert.equal(shared.points.length, 1);
assert.equal(shared.points[0].model3d.modelUrl, mixed.customEvents[0].model3d.modelUrl);
assert.equal(shared.points[0].character.imageDataUrl, mixed.customEvents[0].character.imageDataUrl);
assert.equal(shared.worlds[0].entrancePosition.lat, 35);
assert.equal(shared.worlds[0].visualMap.downloadUrl, mixed.worlds[0].visualMap.downloadUrl);
assert.equal(JSON.stringify(shared).includes(privateSentinel), false);
assert.equal(await api.publishExploration({}, state, mixed), null);
const publicWrites = [];
firestore.collection = (_db, ...path) => ({ path });
firestore.getDocs = async () => ({ docs: [] });
firestore.writeBatch = () => ({
  set: (ref, record) => publicWrites.push({ ref, record }),
  delete: () => assert.fail("No existing documents to delete"),
  commit: async () => {},
});
authInstance.currentUser = { email: "ikeda@manabinomichi.com", emailVerified: true };
await api.publishExploration({}, { auth: { email: authInstance.currentUser.email } }, mixed);
assert.equal(publicWrites.length, 2);
assert.equal(JSON.stringify(publicWrites).includes(privateSentinel), false);
await api.publishExploration({}, { auth: { email: authInstance.currentUser.email } }, mixed);
assert.equal(publicWrites.length, 2, "Unchanged public content is not rewritten");
authInstance.currentUser = null;
assert.deepEqual(JSON.parse(JSON.stringify(await api.loadPublicExploration({}))), { points: [], worlds: [] });
await assert.rejects(api.publishExploration({}, { auth: { email: "ikeda@manabinomichi.com" } }, mixed), { code: "auth/identity-required" });
authInstance.currentUser = { email: "owner@example.com", emailVerified: true };
const withImage = { member: { avatar: { imageDataUrl: "data:image/png;base64,YQ==" } } };
const fallback = await api.saveSnapshot({}, state, withImage);
assert.equal(fallback.snapshot.member.avatar.imageDataUrl, withImage.member.avatar.imageDataUrl);
const beforeFailure = writes.length;
await assert.rejects(api.saveSnapshot({}, state, { member: { avatar: { imageDataUrl: "data:image/png;base64," + "a".repeat(800000) } } }));
assert.equal(writes.length, beforeFailure);
console.log("PASS: identity gates, cloud 3D, migration, public/private projection, image preservation");
