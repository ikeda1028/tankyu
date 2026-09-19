import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import vm from "node:vm";
const root = new URL("../", import.meta.url);
const ctx = { window: {}, URL };
vm.runInNewContext(await readFile(new URL("quest-items.js", root), "utf8"), ctx);
const q = ctx.window.QuestItems;
assert.equal(q.question("lens", ""), null);
assert.equal(q.question("unknown", "高2"), null);
for (const grade of ["年少", "年長", "小1", "小2", "小3", "小4", "小5", "小6", "中1", "中3", "高2", "社会人"]) {
  for (const item of q.definitions) {
    const quiz = q.question(item.id, grade);
    assert.equal(quiz.choices.length, 3);
    assert.throws(() => q.award([], "castle", "城", item.id, grade, (quiz.answer + 1) % 3));
    const result = q.award([], "castle", "城", item.id, grade, quiz.answer, 100);
    assert.equal(result.records.length, 1);
    assert.equal(result.added, true);
    assert.equal(q.award(result.records, "castle", "城", item.id, grade, quiz.answer).added, false);
    assert.equal(q.totals(result.records)[item.id], 5);
    assert.equal(q.award(result.records, "different", "別の城", item.id, grade, quiz.answer).records.length, 2);
  }
}
assert.notEqual(q.question("lens", "小2").text, q.question("lens", "高2").text);
assert.equal(q.worldKey("/assets/castle.glb"), q.worldKey("https://tankyu-five.vercel.app/assets/castle.glb?token=a"));
assert.notEqual(q.worldKey("https://one.example/model.glb"), q.worldKey("https://two.example/model.glb"));
const ui = await readFile(new URL("quest-inventory.js", root), "utf8");
assert.ok(ui.includes("QuestItems.saveAward"));
assert.ok(ui.includes("includeMetadataChanges: true"));
assert.ok(!ui.includes("localStorage"));
assert.ok(!ui.includes("innerHTML = item"));
let stored = { memberProfile: { member: { grade: "高2" } }, snapshot: { quest: 72 }, avatar: { downloadUrl: "private-image" } }, writes = 0;
const session = { db: {}, ref: {}, firestore: { runTransaction: async (db, run) => run({
  get: async () => ({ exists: () => true, data: () => structuredClone(stored) }),
  set: (ref, value, options) => { assert.equal(options.merge, true); writes++; stored = { ...stored, ...value }; },
}) } };
const answer = q.question("lens", "高2").answer;
await q.saveAward(session, "castle", "城", "lens", "高2", answer);
await q.saveAward(session, "castle", "城", "lens", "高2", answer);
assert.equal(writes, 1, "another device cannot award the same item twice");
assert.equal(stored.snapshot.quest, 72, "private snapshot is not overwritten");
assert.equal(stored.avatar.downloadUrl, "private-image");
stored.memberProfile.member.grade = "小2";
await assert.rejects(q.saveAward(session, "castle", "城", "scroll", "高2", 1));
assert.equal(writes, 1, "grade changes require a fresh question");
await assert.rejects(q.saveAward({ ...session, firestore: { runTransaction: async () => { throw Error("offline"); } } }, "castle", "城", "lens", "小2", 0));

// Offline UI fixture uses the actual viewer and quest UI, but never writes real account data.
let html = await readFile(new URL("model-world.html", root), "utf8");
const mock = `<script>
let data = {memberProfile:{member:{grade:new URLSearchParams(location.search).get('grade') || '高2'}},questInventory:{records:[]}};
let notify;
const snapshot=()=>({exists:()=>true,data:()=>structuredClone(data),metadata:{fromCache:false}});
const firestore={doc:()=>({}),onSnapshot:(ref,opts,callback)=>{notify=callback;callback(snapshot());return()=>{};},runTransaction:async(db,fn)=>fn({get:async()=>snapshot(),set:(ref,value)=>{data={...data,...value};queueMicrotask(()=>notify(snapshot()));}})};
async function connectFirebase(){return {firestore,db:{},authInstance:{},auth:{onAuthStateChanged:(auth,cb)=>cb({emailVerified:true,email:'test@example.com'})}}}; function getFirebaseUserId(){return 'test';}
</script>`;
html = html.replace('<script src="firebase-sync.js"></script>', mock).replace('<head>', '<head><base href="/">');
html = html.replace('</body>', `<output id="pixel-check" style="position:fixed;bottom:0;left:0;font:10px monospace;background:white;z-index:5"></output><script>
const check=document.querySelector('#pixel-check');
setInterval(()=>{try{const canvas=document.querySelector('model-viewer').shadowRoot.querySelector('canvas');const copy=document.createElement('canvas');copy.width=160;copy.height=100;const context=copy.getContext('2d');context.drawImage(canvas,0,0,160,100);const pixels=context.getImageData(0,0,160,100).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])visible++;check.textContent='canvas pixels: '+visible;}catch(e){check.textContent=e.message}},1500);
</script></body>`);
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
await mkdir(new URL("outputs/", root), { recursive: true });
await writeFile(new URL("outputs/quest-preview.html", root), html);
console.log("Quest item grade, reward, duplicate and build fixture checks passed");
