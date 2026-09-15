import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const section = (from, to) => app.slice(app.indexOf(from), app.indexOf(to));
const timers = new Map();
let timerId = 0;
let attempts = 0;
let finish;
let fail;
const state = { auth: { email: "owner@example.com", loggedIn: true }, firebase: {}, member: {} };
const api = {
  hasFirebaseConfig: () => true,
  isAuthenticated: () => true,
  saveSnapshot: async () => {
    attempts++;
    return new Promise((resolve, reject) => { finish = resolve; fail = reject; });
  },
};
const context = vm.createContext({
  state, window: { WakuwakuFirebase: api,
    setTimeout: (fn) => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: (id) => timers.delete(id) },
  console: { error() {} },
  els: {}, hasFirebaseConfig: () => true, getFirebaseConfig: () => ({}),
  createFirebaseSnapshot: () => ({ customEvents: [] }),
  saveState: () => true, renderFirebaseSettings() {},
  normalizeAvatar: (avatar) => avatar, ensureEventCharacter: (event) => event,
});
vm.runInContext(`let firebaseAutoSaveReady = true, suppressFirebaseAutoSave = false;
let firebaseSyncInFlight = false, firebaseAutoSyncTimer = null, firebaseAutoSyncRunning = false;
let firebaseAutoSyncQueued = false, firebaseAutoSyncReason = "", publicExploration = {};`, context);
vm.runInContext([
  section("function shouldAutoSaveToFirebase(", "function saveState("),
  section("function setFirebaseStatus(", "function renderFirebaseSettings("),
  section("function pauseFirebaseAutoSync(", "async function saveFirebaseConfig("),
  section("async function syncFirebase(", "function hasLocalAvatarImage("),
  section("function getFirebaseErrorMessage(", "function getMapsKey("),
].join("\n"), context);

context.queueFirebaseSync("edit");
assert.equal(timers.size, 1);
const callback = [...timers.values()][0];
timers.clear();
const running = callback();
assert.equal(attempts, 1);
context.queueFirebaseSync("map movement while saving");
assert.equal(timers.size, 0);
assert.equal(await context.syncFirebase(), false, "Manual clicks cannot overlap a save");
fail({ code: "storage/media-save-failed" });
await running;
assert.equal(state.firebase.autoSyncPaused, true);
assert.match(state.firebase.lastStatus, /Storage/);
assert.equal(state.firebase.lastError, true);
assert.equal(timers.size, 0, "Failed save does not schedule another attempt");
context.queueFirebaseSync("another edit");
await context.runQueuedFirebaseSync();
assert.equal(await context.syncFirebase({ automatic: true }), false);
assert.equal(attempts, 1, "Automatic entry points respect the pause");

const retry = context.syncFirebase();
assert.equal(attempts, 2, "Explicit retry is allowed while paused");
finish({ snapshot: {}, userId: "owner" });
assert.equal(await retry, true);
assert.equal(state.firebase.autoSyncPaused, false);
assert.equal(state.firebase.lastError, false);
context.queueFirebaseSync("next edit");
assert.equal(timers.size, 1, "Successful retry restores automatic saving");

timers.clear();
const warningRetry = context.syncFirebase();
finish({ snapshot: {}, userId: "owner", mediaUploadError: "Storage unavailable" });
await warningRetry;
assert.equal(state.firebase.autoSyncPaused, true, "Inline fallback warns without repeatedly retrying Storage");
assert.equal(timers.size, 0);
console.log("PASS: no retry loop, single in-flight save, explicit recovery, warning pause");
