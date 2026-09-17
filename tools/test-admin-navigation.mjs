import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
let admin = false, poster = false;
const context = vm.createContext({ isAdminUser: () => admin, canEditPointCharacter: () => admin || poster });
vm.runInContext(source.slice(source.indexOf("function canOpenManagementMode("), source.indexOf("function renderAdminHub(")), context);
for (const mode of ["admin", "mentor-settings", "event-admin"]) assert.equal(context.canOpenManagementMode(mode), false);
assert.equal(context.canOpenManagementMode("worlds", { worldEditor: true }), false);
assert.equal(context.canOpenManagementMode("worlds"), true, "reader entry remains available");
assert.equal(context.canOpenManagementMode("settings"), true);
poster = true;
assert.equal(context.canOpenManagementMode("event-admin"), true, "existing approved poster permission retained");
assert.equal(context.canOpenManagementMode("admin"), false);
assert.equal(context.canOpenManagementMode("mentor-settings"), false);
admin = true;
for (const mode of ["admin", "mentor-settings", "event-admin", "worlds"]) assert.equal(context.canOpenManagementMode(mode, { worldEditor: true }), true);
const menu = html.slice(html.indexOf('id="screen-menu"'), html.indexOf('</header>', html.indexOf('id="screen-menu"')));
assert.ok(menu.includes('data-mode="admin" class="hidden"'));
assert.ok(!menu.includes('data-mode="event-admin"'));
assert.ok(!menu.includes('data-mode="worlds"'));
assert.ok(source.indexOf('if (!canOpenManagementMode(mode, options))') < source.indexOf('const admin = mode === "admin"'));
assert.ok(html.includes("data-admin-entry"));
assert.ok(html.includes('id="event-mentor-level"'));
const classList = () => ({ hidden: true, toggle(name, hidden) { this[name] = hidden; }, contains: () => false });
const view = () => ({ classList: classList() });
const views = { questViews: [view()], mentorSettingsView: view(), mentorPoint: { options: [1] }, adminView: view(), feedbackView: view(), eventAdminView: view(), heroGrowthView: view(), settingsView: view(), worldsView: view(), kidsView: view(), guardianView: view() };
const state = { ui: { mode: "quest" } };
Object.assign(context, { state, els: views, window: { alert() {} }, document: { querySelectorAll: () => [] },
  setAccountPanelOpen() {}, requiresGuardianConfirmation: () => false, confirmGuardianMode: () => true,
  saveState() {}, pauseQuestSidePanels() {}, closeScreenMenu() {}, renderKidsMode() {}, renderGuardianMode() {}, renderWorlds() {}, renderAdminHub() {}, renderModeNavigation() {}, applyKidsMapOnlyVisibility() {},
});
vm.runInContext(source.slice(source.indexOf("function showMode("), source.indexOf("window.setQuestMode")), context);
context.showMode("admin");
assert.equal(views.adminView.classList.hidden, false);
assert.equal(views.questViews[0].classList.hidden, true);
context.showMode("worlds", { worldEditor: true });
assert.equal(state.ui.worldViewMode, "edit");
assert.equal(views.adminView.classList.hidden, true);
context.showMode("admin");
context.showMode("mentor-settings");
assert.equal(views.mentorSettingsView.classList.hidden, false);
assert.equal(views.adminView.classList.hidden, true);
context.showMode("event-admin");
assert.equal(views.mentorSettingsView.classList.hidden, true);
assert.equal(views.eventAdminView.classList.hidden, false);
context.showMode("quest");
admin = poster = false;
context.showMode("admin");
assert.equal(state.ui.mode, "quest", "unauthorized direct navigation does not change the active screen");
if (process.argv.includes("--preview")) {
  const panel = html.slice(html.indexOf('<section class="admin-view'), html.indexOf('<section class="event-admin-view'));
  const render = source.slice(source.indexOf("function renderAdminHub("), source.indexOf("function showMode("));
  await writeFile(new URL("../outputs/admin-preview.html", import.meta.url), `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>管理者画面の検証</title><style>.admin-view{display:block!important;inset:16px}</style>${panel}<script src="/mentor-progression.js"></script><script>
    const state={worlds:[{}],customEvents:[{id:'one'}]};
    const points=[{id:'one',title:'観察の広場',character:{name:'観察の師匠',mentorEnabled:true,mentorLevel:1}},{id:'five',title:'実践の広場',character:{name:'実践の師匠',mentorEnabled:true,mentorLevel:5}}];
    const isAdminUser=()=>true,getEncounters=()=>points,getEventCharacter=p=>p.character,escapeHtml=s=>String(s);
    function editPointCharacter(){}
    const els={adminView:document.querySelector('.admin-view'),adminSummary:document.querySelector('#admin-summary'),adminMentorList:document.querySelector('#admin-mentor-list'),adminMentorSearch:document.querySelector('#admin-mentor-search')};
    ${render}
    els.adminMentorSearch.oninput=renderAdminHub;renderAdminHub();
    </script></html>`);
}
console.log("PASS: authenticated admin route guards, approved poster scope, ordinary reader access, consolidated settings menu");
