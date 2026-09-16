import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const classes = new Set();
const element = () => ({
  attrs: {}, focused: false,
  setAttribute(key, value) { this.attrs[key] = value; },
  removeAttribute(key) { delete this.attrs[key]; },
  toggleAttribute(key, enabled) { if (enabled) this.attrs[key] = ""; else delete this.attrs[key]; },
  focus() { this.focused = true; },
});
const els = { accountPanel: element(), accountButton: element(), closeAccountButton: element(), accountBackdrop: { hidden: true } };
const mapArea = { inert: false };
const media = { matches: true };
const state = { auth: { loggedIn: true } };
const context = vm.createContext({
  els, state, window: { matchMedia: () => media }, closeScreenMenu() {},
  document: { body: { classList: {
    contains: (value) => classes.has(value),
    toggle(value, enabled) { if (enabled) classes.add(value); else classes.delete(value); },
  } }, querySelector: () => mapArea },
});
vm.runInContext(source.slice(source.indexOf("function setAccountPanelOpen("), source.indexOf("function setScreenMenuOpen(")), context);
context.setAccountPanelOpen(true);
assert.equal(mapArea.inert, true);
assert.equal(els.accountPanel.attrs.role, "dialog");
assert.equal(els.accountPanel.attrs["aria-modal"], "true");
assert.equal(els.accountButton.attrs["aria-expanded"], "true");
assert.equal(els.accountBackdrop.hidden, false);
assert.equal(els.closeAccountButton.focused, true);
context.setAccountPanelOpen(false);
assert.equal(mapArea.inert, false);
assert.equal(els.accountPanel.attrs.role, undefined);
assert.equal(els.accountPanel.attrs["aria-modal"], undefined);
assert.equal(els.accountBackdrop.hidden, true);
assert.equal(els.accountButton.focused, true);
for (const scenario of ["desktop", "kids", "logged-out"]) {
  media.matches = scenario !== "desktop";
  state.auth.loggedIn = scenario !== "logged-out";
  classes.delete("kids-screen-active");
  if (scenario === "kids") classes.add("kids-screen-active");
  context.setAccountPanelOpen(true);
  assert.equal(classes.has("account-panel-open"), false, scenario);
  assert.equal(mapArea.inert, false, scenario);
}
console.log("PASS: mobile account open/close, focus, inert map, desktop/kids/auth guards");
