import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("app.js", root), "utf8");
const html = await readFile(new URL("index.html", root), "utf8");
const modelSource = await readFile(new URL("mentor-models.js", root), "utf8");
const ctx = vm.createContext({ window: {}, URL });
vm.runInContext(modelSource, ctx);
const models = ctx.window.MentorModels;
const base = "https://tankyu-five.vercel.app";
for (const url of ["file:///test.glb", "blob:https://x/test.glb", "http://example.com/m.glb", "https://localhost/a.glb", "https://127.0.0.1/a.glb", "https://10.0.1.2/a.glb", "https://192.168.0.1/a.glb", "https://example.com/index.html", "https://user:pass@example.com/a.glb"]) {
  assert.equal(models.normalize({ modelUrl: url }, base), null, url);
}
assert.equal(models.normalize({ modelUrl: "assets/fudo.glb" }, base).modelUrl, `${base}/assets/fudo.glb`);
assert.ok(models.normalize({ modelUrl: "https://firebasestorage.googleapis.com/v0/b/test/o/models%2Fmentor.glb?alt=media&token=test" }, base));
const model = { modelUrl: "https://example.com/mentor.glb", title: "師匠" };
const original = { id: "one", title: "観察の広場", position: { lat: 35, lng: 139 }, model3d: { modelUrl: "https://example.com/building.glb" }, character: { name: "師匠", downloadUrl: "https://example.com/face.png", localOnly: true } };
const seed = { ...original, id: "seed" };
let admin = true, syncs = 0, saves = 0;
const fields = {};
for (const key of ["mentorName", "mentorRole", "mentorRank", "mentorMessage", "mentorModelUrl", "mentorSettingsStatus"]) fields[key] = { value: "", textContent: "" };
Object.assign(fields, { mentorPoint: { value: "one" }, mentorEnabled: { checked: true } });
Object.assign(ctx, {
  state: { customEvents: [structuredClone(original)] }, els: fields, PUBLIC_API_BASE: base, MentorModels: models,
  MentorProgression: { level: (value) => Math.max(1, Math.min(5, Number(value) || 1)) },
  normalizeExternalUrl: (value) => value || "", isAdminUser: () => admin,
  createEventId: () => "copy", saveState: () => saves++, render() {},
  queueFirebaseSync: () => syncs++, verifiedMentorModelUrl: model.modelUrl,
  getEncounters: () => [...ctx.state.customEvents, seed, { ...original, id: "readonly", publicReadOnly: true }],
  getEventCharacter: (point) => point.character,
  populateMentorSettings: (id) => { fields.mentorPoint.value = id; },
});
vm.runInContext(source.slice(source.indexOf("function normalizeCharacter("), source.indexOf("function getEventCharacter(")), ctx);
vm.runInContext(source.slice(source.indexOf("function saveMentorSettings("), source.indexOf("function canOpenManagementMode(")), ctx);
Object.assign(fields.mentorName, { value: "新しい師匠" });
fields.mentorRole.value = "自然観察";
fields.mentorRank.value = "3";
fields.mentorMessage.value = "どこが変わったかな？";
fields.mentorModelUrl.value = model.modelUrl;
admin = false;
ctx.saveMentorSettings();
assert.equal(saves, 0);
admin = true;
ctx.verifiedMentorModelUrl = "";
ctx.saveMentorSettings();
assert.equal(saves, 0, "unverified model cannot be saved");
ctx.verifiedMentorModelUrl = model.modelUrl;
ctx.saveMentorSettings();
assert.equal(saves, 1);
assert.equal(syncs, 1);
assert.equal(ctx.state.customEvents[0].character.model3d.modelUrl, model.modelUrl);
assert.equal(ctx.state.customEvents[0].character.mentorLevel, 3);
assert.equal(ctx.state.customEvents[0].character.downloadUrl, original.character.downloadUrl);
assert.equal(ctx.state.customEvents[0].model3d.modelUrl, original.model3d.modelUrl, "building model remains separate");
fields.mentorPoint.value = "readonly";
ctx.saveMentorSettings();
assert.equal(saves, 1, "read-only shared point cannot be edited");
fields.mentorPoint.value = "seed";
ctx.saveMentorSettings();
assert.equal(ctx.state.customEvents.length, 2);
assert.equal(ctx.state.customEvents[0].sourceEventId, "seed");
ctx.saveMentorSettings();
assert.equal(ctx.state.customEvents.length, 2, "saving again updates the new copy");
fields.mentorModelUrl.value = "";
ctx.saveMentorSettings();
assert.equal(ctx.state.customEvents[0].character.model3d, null, "explicit model removal");

const firebase = vm.createContext({ window: {} });
vm.runInContext(await readFile(new URL("firebase-sync.js", root), "utf8"), firebase);
const shared = firebase.window.WakuwakuFirebase.createPublicExploration({ customEvents: [{ ...original, character: { ...original.character, model3d: { ...model, secret: "PRIVATE" } } }] });
assert.equal(shared.points[0].character.model3d.modelUrl, model.modelUrl);
assert.ok(!JSON.stringify(shared).includes("PRIVATE"));
assert.equal(shared.points[0].model3d.modelUrl, original.model3d.modelUrl);
assert.ok(source.includes("eventCharacterModel3d = MentorModels.normalize(character.model3d, PUBLIC_API_BASE)"));
assert.equal((source.slice(source.indexOf("function getRequiredCharacterFromForm("), source.indexOf("async function suggestEventCharacter(")).match(/model3d: eventCharacterModel3d/g) || []).length, 2);

if (process.argv.includes("--preview")) {
  await mkdir(new URL("outputs/", root), { recursive: true });
  const panel = html.slice(html.indexOf('<section class="mentor-settings-view'), html.indexOf('<section class="event-admin-view'));
  const controller = source.slice(source.indexOf("function openMentorSettings("), source.indexOf("function canOpenManagementMode("));
  const fieldsSource = source.slice(source.indexOf("  mentorSettingsView:"), source.indexOf("  mentorSave:")) + 'mentorSave: document.querySelector("#mentor-save"),';
  await writeFile(new URL("outputs/mentor-settings-preview.html", root), `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>メンター設定の検証</title><style>.mentor-settings-view{display:block!important;inset:16px}body{background:white}</style>${panel}<script src="/mentor-models.js"></script><script src="/mentor-progression.js"></script><script>
    const PUBLIC_API_BASE='${base}', state={customEvents:[{id:'one',title:'検証用の広場',character:{name:'検証用メンター',mentorLevel:1,mentorEnabled:true,model3d:{modelUrl:'${base}/assets/fudozaka-dragon.glb'}}}]};
    const els={${fieldsSource}}, isAdminUser=()=>true, getEncounters=()=>state.customEvents, getEventCharacter=p=>p.character;
    const escapeHtml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
    let verifiedMentorModelUrl=''; function showMode(){} function saveState(){} function render(){} function queueFirebaseSync(){} const normalizeCharacter=c=>c;
    ${controller}
    els.mentorPoint.onchange=loadMentorSettings; els.mentorSettingsForm.onsubmit=saveMentorSettings;
    document.querySelector('#mentor-preview-button').onclick=previewMentorModel;
    document.querySelector('#mentor-remove-model').onclick=()=>{els.mentorModelUrl.value='';previewMentorModel()};
    els.mentorModelUrl.oninput=()=>{verifiedMentorModelUrl='';els.mentorModelPreview.replaceChildren()};
    openMentorSettings('one');
    const metrics=document.createElement('output');metrics.id='preview-pixels';metrics.style.overflowWrap='anywhere';document.querySelector('.mentor-appearance').append(metrics);
    setInterval(()=>{
      const viewer=document.querySelector('model-viewer'),source=viewer?.shadowRoot?.querySelector('canvas');if(!source)return;
      const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
      const context=canvas.getContext('2d');context.drawImage(source,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let visible=0;
      for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)visible++;
      metrics.textContent=JSON.stringify({width:canvas.width,height:canvas.height,visiblePixels:visible,orbit:viewer.getCameraOrbit?.().theta});
    },1000);
    </script></html>`);
}
console.log("PASS: mentor permissions, verified GLB registration, world separation, copy/edit/remove, public projection and URL validation");
