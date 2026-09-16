import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("firebase-sync.js", root), "utf8");
const authInstance = { currentUser: null, authStateReady: async () => {} };
const records = new Map();
const listeners = new Set();
let writes = 0;
const firestore = {
  doc: (_db, collection, id) => ({ collection, id }),
  serverTimestamp: () => "server-time",
  runTransaction: async (_db, callback) => callback({
    get: async (ref) => ({ exists: () => records.has(ref.id), data: () => records.get(ref.id) }),
    set: (ref, data, options) => {
      assert.equal(ref.collection, "wakuwakuUsers");
      assert.equal(options.merge, true);
      records.set(ref.id, { ...records.get(ref.id), ...data });
      writes++;
      for (const listener of listeners) listener();
    },
  }),
  onSnapshot: (ref, onChange) => {
    const notify = () => onChange({ data: () => records.get(ref.id) });
    listeners.add(notify);
    notify();
    return () => listeners.delete(notify);
  },
};
const context = vm.createContext({ window: {}, authInstance, firestore });
vm.runInContext(source, context);
vm.runInContext("firebaseAuth = authInstance; connectFirebase = async () => ({authInstance, firestore, db:{}})", context);
const api = context.window.WakuwakuFirebase;
const state = { auth: { email: "owner@example.com" }, member: { name: "Owner", grade: "high2", age: 17, avatar: { imageDataUrl: "x".repeat(900000) } }, childProfile: { age: 17 }, currentLocation: { lat: 1, lng: 2 } };
for (const user of [null, { email: "other@example.com", emailVerified: true }, { email: "owner@example.com", emailVerified: false }]) {
  authInstance.currentUser = user;
  await assert.rejects(api.saveMemberProfile({}, state, state), { code: "auth/identity-required" });
  await assert.rejects(api.watchMemberProfile({}, state, () => {}, () => {}), { code: "auth/identity-required" });
}
assert.equal(writes, 0);
authInstance.currentUser = { email: "owner@example.com", emailVerified: true };
records.set("owner@example_com", { snapshot: { member: { grade: "old" } } });
const initial = await api.saveMemberProfile({}, state, state);
assert.equal(initial.revision, 1);
assert.equal(initial.member.grade, "high2");
assert.equal(initial.member.avatar, undefined);
assert.equal(initial.currentLocation, undefined);
assert.equal(records.get("owner@example_com").snapshot.member.grade, "old", "Lightweight save preserves the full snapshot");
assert.ok(JSON.stringify(initial).length < 1000, "No Storage access or inline images needed");
const stale = { ...state, member: { name: "Old device", grade: "junior3" } };
assert.equal((await api.saveMemberProfile({}, stale, stale)).member.grade, "high2", "Migration cannot replace an existing canonical profile");
assert.equal(writes, 1);
let received;
const stop = await api.watchMemberProfile({}, state, (profile) => { received = profile; }, assert.fail);
assert.equal(received.member.grade, "high2");
const update = { ...state, member: { ...state.member, region: "Tokyo" } };
const saved = await api.saveMemberProfile({}, state, update, initial.revision);
assert.equal(saved.revision, 2);
assert.equal(received.member.region, "Tokyo", "Other devices receive profile updates");
await assert.rejects(api.saveMemberProfile({}, stale, stale, initial.revision), { code: "profile/conflict" });
assert.equal(writes, 2, "Stale revisions never overwrite newer data");
stop();
assert.equal(listeners.size, 0);

// Capture identity and draft before asynchronous authentication yields.
const pending = api.saveMemberProfile({}, state, update, 2);
state.auth.email = "other@example.com";
update.member.region = "Modified while pending";
await pending;
assert.equal(records.get("owner@example_com").memberProfile.member.region, "Tokyo");
assert.equal(records.has("other@example_com"), false);

const app = await readFile(new URL("app.js", root), "utf8");
context.normalizeChildProfile = (value) => value;
vm.runInContext(app.slice(app.indexOf("function applyCloudMemberProfile("), app.indexOf("function stopWatchingMemberProfile(")), context);
const local = { member: { grade: "junior3", avatar: { downloadUrl: "local-image" } }, childProfile: { age: 14 } };
context.applyCloudMemberProfile(local, initial);
assert.equal(local.member.grade, "high2");
assert.equal(local.childProfile.age, 17);
assert.equal(local.member.avatar.downloadUrl, "local-image");
assert.ok(app.indexOf("mergeLegacyCloudSnapshot(loadedSnapshot, localSnapshot)") < app.indexOf("applyCloudMemberProfile(loadedSnapshot, profile)"));
const appContext = vm.createContext({
  state: { auth: { loggedIn: true, email: "owner@example.com" }, firebase: { autoSyncPaused: true } },
  window: { WakuwakuFirebase: { isAuthenticated: () => true, saveMemberProfile: async () => ({ revision: 3 }) } },
  getFirebaseConfig: () => ({}), saveState: (options) => assert.equal(options.localOnly, true),
  startMemberProfileWatch: () => {}, setMemberStatus: () => {}, console,
});
vm.runInContext("let memberProfileSaving = false; let firebaseAutoSaveReady = true; let memberProfileRevision = 2;", appContext);
vm.runInContext(app.slice(app.indexOf("async function syncMemberProfile("), app.indexOf("function mergeLegacyCloudSnapshot(")), appContext);
assert.equal(await appContext.syncMemberProfile(), true, "Paused image sync must not block member information");
assert.equal(vm.runInContext("memberProfileRevision", appContext), 3);
console.log("PASS: private profile auth, image-independent saves, canonical migration, live updates, revision conflicts, identity isolation");
