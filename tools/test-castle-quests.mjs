import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import vm from "node:vm";
import { previewHtml } from "./test-quest-items.mjs";
const root = new URL("../", import.meta.url);
const ctx = { window: {}, URL };
vm.createContext(ctx);
vm.runInContext(await readFile(new URL("quest-items.js", root), "utf8"), ctx);
ctx.QuestItems = ctx.window.QuestItems;
vm.runInContext(await readFile(new URL("castle-quests.js", root), "utf8"), ctx);
const catalog = ctx.window.CastleQuests, q = ctx.QuestItems;
assert.equal(catalog.items.length, 30);
assert.equal(new Set(catalog.items.map((item) => item.id)).size, 30);
let records = [];
for (let level = 1; level <= 10; level++) {
  const next = catalog.next(records, "castle");
  assert.equal(next.length, 3);
  assert.ok(next.every((item) => item.level === level));
  for (const item of next) {
    for (const grade of ["年長", "小2", "小4", "小6", "中2", "高3"]) {
      const quiz = q.question(item.id, grade);
      assert.equal(quiz.choices.length, 3);
      assert.equal(quiz.choices[quiz.answer], item.step[/^(年|小[1-4])/.test(grade) ? 5 : 4]);
    }
    const quiz = q.question(item.id, "高3");
    assert.throws(() => q.award(records, "castle", "城", item.id, "高3", (quiz.answer + 1) % 3));
    const result = q.award(records, "castle", "城", item.id, "高3", quiz.answer);
    records = result.records;
    assert.equal(q.award(records, "castle", "城", item.id, "高3", quiz.answer).added, false);
  }
}
assert.equal(catalog.next(records, "castle").length, 0);
assert.deepEqual(JSON.parse(JSON.stringify(q.totals(records))), { lens: 50, scroll: 50, prism: 50 });
const locked = catalog.items.find((item) => item.level === 10);
assert.throws(() => q.award([], "castle", "城", locked.id, "高3", q.question(locked.id, "高3").answer));
assert.equal(catalog.next([], "different").length, 3);
assert.equal(q.totals([{ itemId: "lens" }]).lens, 5, "legacy awards retained");

// Reuse the existing isolated Firebase fixture, without touching production inventory.
let html = previewHtml;
html = html.replace("questInventory:{records:[]}", `questInventory:{records:(${JSON.stringify(records)}).filter(r => Number(r.itemId.split('-').at(-1)) < Number(new URLSearchParams(location.search).get('level') || 1)).map(r => ({...r,world:'/assets/Katsuren_Future_Castle.glb',key:'/assets/Katsuren_Future_Castle.glb::'+r.itemId}))}`);
html = html.replace("const canvas=document.querySelector('model-viewer').shadowRoot.querySelector('canvas');", "const canvas=document.querySelector('.castle-interior:not([hidden]) canvas') || document.querySelector('model-viewer').shadowRoot.querySelector('canvas');");
html = html.replace("check.textContent='canvas pixels: '+visible;", "const colors=new Set();for(let i=0;i<pixels.length;i+=4)colors.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2]);check.textContent='canvas pixels: '+visible+' / colors: '+colors.size;");
await mkdir(new URL("outputs/", root), { recursive: true });
await writeFile(new URL("outputs/castle-preview.html", root), html);
console.log("PASS: 30 objectives, grade copy, sequential unlock, duplicate prevention, 10 levels, legacy totals");
