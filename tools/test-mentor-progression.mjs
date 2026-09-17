import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
const context = vm.createContext({});
vm.runInContext(await readFile(new URL("../mentor-progression.js", import.meta.url), "utf8"), context);
const m = context.MentorProgression;
assert.equal(m.normalize(null).unlockedAt, "");
assert.equal(m.normalize({ selectedEventId: "unknown" }).selectedEventId, "");
for (const [score, expected] of [[0, 1], [99, 1], [100, 2], [149, 2], [150, 3], [220, 4], [320, 5]]) assert.equal(m.playerLevel(score), expected);
const beginner = { name: "観察の師匠", mentorLevel: 1 };
const expert = { name: "実践の師匠", mentorLevel: 5 };
const first = m.meet({}, beginner, "one", 72, "2026-09-17T00:00:00Z");
assert.equal(first.changed, true);
assert.ok(first.progress.unlockedAt);
assert.equal(first.progress.selectedEventId, "", "meeting unlocks before choosing a mentor");
assert.equal(m.meet(first.progress, beginner, "one", 72, "later").changed, false);
assert.equal(m.meet(first.progress, expert, "five", 72, "later").changed, false);
assert.equal(m.meet(first.progress, { ...beginner, mentorEnabled: false }, "disabled", 72, "later").changed, false);
const advanced = m.meet(first.progress, expert, "five", 320, "later");
assert.equal(advanced.changed, true);
advanced.progress.selectedEventId = "five";
const restored = m.normalize(JSON.parse(JSON.stringify(advanced.progress)));
assert.equal(restored.selectedEventId, "five");
assert.equal(restored.unlockedAt, first.progress.unlockedAt);

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
let visible = false, saved = 0, synced = 0;
const state = { quest: 72, mentorship: {} };
const app = vm.createContext({ state, MentorProgression: m, WorldAccess: { assess: (position, fix) => ({ allowed: !!fix?.near }) },
  getEventCharacter: (event) => event.character, markCharacterVisited() {}, addActivity() { saved++; },
  renderGrowthPath() { visible = !!state.mentorship.unlockedAt; }, renderMentors() {}, queueFirebaseSync() { synced++; },
});
vm.runInContext(source.slice(source.indexOf("function meetMentorHere("), source.indexOf("function getDistanceMeters(")), app);
const point = { id: "one", character: beginner, position: {} };
assert.equal(app.meetMentorHere(point, { near: false }), false);
assert.equal(visible, false);
assert.equal(app.meetMentorHere(point, { near: true }), true);
assert.equal(visible, true, "growth appears at encounter, not at mentor selection");
assert.equal(saved, 1);
assert.equal(synced, 1);
assert.equal(app.meetMentorHere(point, { near: true }), false);
assert.equal(saved, 1, "re-render does not duplicate encounters or saves");
vm.runInContext(source.slice(source.indexOf("function selectMentor("), source.indexOf("function renderMentors(")), Object.assign(app, { saveState() { saved++; } }));
app.selectMentor("unmet");
assert.equal(state.mentorship.selectedEventId, "");
app.selectMentor("one");
assert.equal(state.mentorship.selectedEventId, "one");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.ok(html.includes('class="panel hidden" id="growth-path-panel"'));
if (process.argv.includes("--preview")) {
  const panels = html.slice(html.indexOf('<section class="panel" id="mentor-panel">'), html.indexOf('<section class="panel input-panel">'));
  const functions = source.slice(source.indexOf("function renderGrowthPath("), source.indexOf("function renderFeedbackView("));
  await writeFile(new URL("../outputs/mentor-preview.html", import.meta.url), `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>師匠表示の検証</title><style>body{overflow:auto;padding:16px}main{max-width:380px;margin:auto}button{min-height:44px;margin-bottom:16px}.panel{margin-bottom:16px}</style><main><button id="meet">テスト：師匠に出会う</button><button id="advance">テスト：Lv.5へ</button>${panels}</main><script src="/mentor-progression.js"></script><script>
    const state={quest:72,mentorship:{}};
    const points=[{id:'one',title:'観察の広場',character:{name:'観察の師匠',mentorEnabled:true,mentorLevel:1}},{id:'five',title:'実践の広場',character:{name:'実践の師匠',mentorEnabled:true,mentorLevel:5}}];
    const els={growthPath:document.querySelector('#growth-path'),growthPathPanel:document.querySelector('#growth-path-panel'),mentorChoice:document.querySelector('#mentor-choice'),mentorLevel:document.querySelector('#mentor-level'),selectedMentor:document.querySelector('#selected-mentor'),mentorNextLevel:document.querySelector('#mentor-next-level')};
    const getEncounters=()=>points,getEventCharacter=p=>p.character,getBestDepth=()=>1,getEncounterQuestions=()=>['何を見つけた？','なぜだろう？','何と関係する？','別の分野では？','何を試して改善する？'];
    const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function saveState(){} function queueFirebaseSync(){}
    ${functions}
    document.querySelector('#meet').addEventListener('click',()=>{const p=points[MentorProgression.playerLevel(state.quest)===5?1:0];state.mentorship=MentorProgression.meet(state.mentorship,p.character,p.id,state.quest,new Date().toISOString()).progress;renderGrowthPath();renderMentors()});
    document.querySelector('#advance').addEventListener('click',()=>{state.quest=320;renderMentors()});
    els.mentorChoice.addEventListener('change',()=>selectMentor(els.mentorChoice.value));
    renderGrowthPath();renderMentors();
    </script></html>`);
}
console.log("PASS: instant encounter unlock, level boundaries, mentor selection, no remote unlock, persistence, duplicate prevention");
