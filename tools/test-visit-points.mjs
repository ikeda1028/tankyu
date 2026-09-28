import assert from "node:assert/strict";
import { claimPoints, createVisitHandler, hashToken, issueSecret } from "../server/visit-core.js";

function memoryDb() {
  const data = new Map(); let queue = Promise.resolve();
  const snapshot = (path) => ({ exists: data.has(path), id: path.split("/").at(-1), data: () => data.get(path) });
  const ref = (path) => ({ path, collection: (name) => collection(`${path}/${name}`), get: async () => snapshot(path), create: async (value) => { assert.ok(!data.has(path)); data.set(path, value); }, update: async (value) => data.set(path, { ...data.get(path), ...value }) });
  const collection = (path) => ({ doc: (id) => ref(`${path}/${id}`) });
  return {
    data, collection,
    runTransaction(callback) {
      const result = queue.then(async () => {
        const writes = [];
        const transaction = { getAll: async (...refs) => refs.map((item) => snapshot(item.path)), get: async (item) => snapshot(item.path), create: (item, value) => { assert.ok(!data.has(item.path)); writes.push([item.path, value]); }, set: (item, value) => writes.push([item.path, value]), update: (item, value) => writes.push([item.path, { ...data.get(item.path), ...value }]) };
        const result = await callback(transaction);
        for (const [path, value] of writes) data.set(path, value);
        return result;
      });
      queue = result.catch(() => {}); return result;
    },
  };
}
const db = memoryDb(), secret = issueSecret(), user = { uid: "member-a", email: "a@example.com", email_verified: true };
const stationPath = `visitStations/${secret.id}`;
db.data.set(stationPath, { title: "本郷・入口", enabled: true, tokenHash: hashToken(secret.token) });
const stamp = () => "server-time";
const parallel = await Promise.all(Array.from({ length: 15 }, () => claimPoints(db, user, { ...secret, points: 9999, uid: "another-user" }, stamp)));
assert.equal(parallel.filter((entry) => entry.added === 10).length, 1);
assert.equal(db.data.get("visitAccounts/member-a").total, 10);
assert.equal(db.data.has("visitAccounts/another-user"), false);
assert.equal((await claimPoints(db, { ...user, uid: "member-b" }, secret, stamp)).added, 10);
await assert.rejects(claimPoints(db, user, { ...secret, token: "x".repeat(43) }, stamp), { status: 404 });
await assert.rejects(claimPoints(db, user, { ...secret, id: "../../someone" }, stamp), { status: 400 });
db.data.set(stationPath, { ...db.data.get(stationPath), enabled: false });
await assert.rejects(claimPoints(db, { ...user, uid: "member-c" }, secret, stamp), { status: 404 });
assert.equal(db.data.has("visitAccounts/member-c"), false);
const replacement = issueSecret();
db.data.set(stationPath, { ...db.data.get(stationPath), enabled: true, tokenHash: hashToken(replacement.token) });
assert.equal((await claimPoints(db, user, { id: secret.id, token: replacement.token }, stamp)).added, 0);
await assert.rejects(claimPoints(db, user, secret, stamp), { status: 404 });

const handler = createVisitHandler({ services: () => ({ db, timestamp: stamp, auth: { verifyIdToken: async (token, checkRevoked) => { assert.equal(checkRevoked, true); if (token === "invalid") throw new Error(); return token === "admin" ? { ...user, email: "admin@example.com" } : token === "unverified" ? { ...user, email_verified: false } : user; } } }), adminEmails: ["admin@example.com"], publicOrigin: "https://example.com", makeQr: async (url) => `<svg>${url}</svg>` });
async function call(token, body, method = "POST") {
  let status, json;
  await handler({ method, headers: { authorization: token ? `Bearer ${token}` : "" }, body }, { setHeader() {}, status(value) { status = value; return this; }, json(value) { json = value; } });
  return { status, json };
}
assert.equal((await call(null, {})).status, 401);
assert.equal((await call("invalid", {})).status, 401);
assert.equal((await call("unverified", {})).status, 403);
assert.equal((await call("member", { action: "create", title: "fake" })).status, 403);
assert.equal((await call("member", { action: "disable", id: secret.id })).status, 403);
assert.equal((await call("admin", { action: "create", title: "" })).status, 400);
const issued = await call("admin", { action: "create", title: "勝連城・入口" });
assert.equal(issued.status, 200);
assert.equal(new URL(issued.json.url).origin, "https://example.com");
assert.equal(new URL(issued.json.url).search, "");
assert.ok(new URL(issued.json.url).hash.length > 70);
const saved = db.data.get(`visitStations/${issued.json.id}`);
assert.equal(saved.token, undefined);
assert.match(saved.tokenHash, /^[a-f0-9]{64}$/);
assert.equal((await call("admin", { action: "disable", id: issued.json.id })).status, 200);
assert.equal(db.data.get(`visitStations/${issued.json.id}`).enabled, false);
const rotated = await call("admin", { action: "rotate", id: issued.json.id });
assert.equal(rotated.status, 200); assert.equal(rotated.json.id, issued.json.id); assert.notEqual(rotated.json.url, issued.json.url);
assert.equal((await call("admin", {}, "DELETE")).status, 405);
console.log("PASS: fixed 10 points, concurrent replay, account isolation, invalid/disabled QR, rotation, verification and admin authorization");
