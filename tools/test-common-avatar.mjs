import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url).pathname;
const server = createServer(async (req, res) => {
  try { const file = new URL(req.url, "http://localhost").pathname; res.setHeader("Content-Type", ({".js":"text/javascript",".html":"text/html"})[extname(file)] || "application/octet-stream"); res.end(await readFile(join(root,file))); }
  catch { res.statusCode=404;res.end(); }
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:"chrome",headless:true});
try {
  for(const width of [1280,390]) {
    const page=await browser.newPage({viewport:{width,height:844}});
    await page.route("**/firebase-sync.js",route=>route.fulfill({contentType:"text/javascript",body:`window.WakuwakuFirebase={getAuthenticatedUser:async()=>({email:'test@example.com',emailVerified:true}),worldAvatar:async(c,id)=>{if(id===undefined)return {presetId:'shisa'};if(window.failSave)throw Error('offline');window.savedAvatar=id;return {presetId:id};}};`}));
    await page.goto(origin+"/world-avatar.html?returnTo="+encodeURIComponent("https://evil.example/"));
    await page.waitForFunction(()=>!document.querySelector('#save').disabled);
    assert.equal(await page.locator('[data-id="shisa"]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-id="miu"]').click();
    await page.evaluate(()=>window.failSave=true);
    await page.locator('#save').click();
    await page.getByText('保存できませんでした。選択は残っています。もう一度保存してください。').waitFor();
    assert.equal(await page.locator('[data-id="miu"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`/private/tmp/common-avatar-${width}.png`});
    await page.evaluate(()=>window.failSave=false);
    await page.route(origin+'/?avatar=miu',route=>route.fulfill({body:'done'}));
    await page.locator('#save').click();
    await page.waitForURL(origin+'/?avatar=miu');
    assert.equal(new URL(page.url()).origin,origin,'external return URL rejected');
    const cached=await page.evaluate(()=>JSON.parse(localStorage.getItem('wakuwaku-quest-state-v3')));
    assert.equal(cached.member.avatar.presetId,'miu');
    await page.close();
  }
  console.log('PASS common avatar selection, cloud restore, failed-save recovery, safe return URLs, desktop/mobile layout');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
