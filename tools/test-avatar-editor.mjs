import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile, mkdir, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const app = await readFile(new URL("app.js",root),"utf8");
const html = await readFile(new URL("index.html",root),"utf8");
const slice=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b,app.indexOf(a)));
const normalize=slice("function normalizeAvatar(","function getAvatarGradient(");
const ctx=vm.createContext({ defaultState:{member:{avatar:{symbol:"星",color:"#2f8f63",aura:"探究"}}},normalizeExternalUrl:v=>String(v||"") });
vm.runInContext(normalize,ctx);
const saved=ctx.normalizeAvatar({presetId:"miu",imageDataUrl:"data:image/png;base64,old",equippedItems:["hat"]});
assert.equal(saved.presetId,"miu");assert.ok(saved.imageDataUrl);assert.equal(saved.equippedItems[0],"hat");
const controls=html.slice(html.indexOf('<fieldset class="avatar-fieldset">'),html.indexOf('<fieldset class="party-fieldset">'));
for(const id of ["member-avatar-prompt","member-avatar-photo","member-avatar-symbol","member-avatar-color","member-avatar-aura"])assert.equal((controls.match(new RegExp(`id="${id}"`,"g"))||[]).length,1);
assert.ok(controls.includes('disabled aria-describedby="avatar-3d-availability"'));
const fixture=`<!doctype html><html lang="ja"><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../"><link rel="stylesheet" href="styles.css"><style>body{display:block;background:#f4f7f7;padding:16px;overflow:auto}main{max-width:760px;margin:auto;background:white;padding:20px}fieldset{min-width:0}input,textarea,select{max-width:100%;box-sizing:border-box}button{cursor:pointer}</style></head><body><main>${controls}</main><script>
const defaultState={member:{avatar:{symbol:'星',color:'#2f8f63',aura:'探究'}}};
const normalizeExternalUrl=v=>String(v||''); const escapeHtml=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
${slice('const memberAvatarPresets =','let publicExploration')}
${normalize}
const state={member:{avatar:normalizeAvatar({symbol:'星'})}};
const els=Object.fromEntries(['Preview','Symbol','Color','Aura','Prompt'].map(key=>['memberAvatar'+key,document.querySelector('#member-avatar-'+key.toLowerCase())]));
const getEquippedKidsItems=()=>[];const getAvatarGradient=()=> '#317168';const renderMemberSummary=()=>{};
${slice('function renderAvatarElement(','function renderHeroGrowth(')}
${slice('function getAvatarFromEditor(','function updateAvatarFromEditor(')}
${slice('const avatarModeTabs =','els.addPartyRoleButton?.addEventListener')}
renderAvatarEditor();
</script></body></html>`;
await mkdir(new URL("outputs/",root),{recursive:true});await writeFile(new URL("outputs/avatar-editor-preview.html",root),fixture);
console.log("PASS: preset identity, existing image/equipment retained, unique form controls, no enabled purchase; isolated preview created");
