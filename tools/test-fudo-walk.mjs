import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");
const root = new URL("../", import.meta.url).pathname;
const server = createServer(async(req,res) => {
  try {
    const path = new URL(req.url, "http://localhost").pathname;
    const body = path === "/public-config.js" ? 'window.WAKUWAKU_CONFIG={worldAccess:{requireLocation:false}};' : await readFile(join(root, path));
    res.setHeader("Content-Type", ({".js":"text/javascript",".html":"text/html",".css":"text/css",".svg":"image/svg+xml"})[extname(path)] || "application/octet-stream");
    res.end(body);
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({headless:true,channel:"chrome"});
try {
  for (const mobile of [false,true]) {
    const page = await browser.newPage({viewport: mobile ? {width:390,height:844} : {width:1280,height:800}});
    const errors = [];
    page.on("pageerror", e=> errors.push(e.message));
    page.on("console", msg => { if(msg.type()==="warning") console.log("WARN",msg.text().slice(0,200)); });
    await page.route("https://**/*",route=>route.abort());
    await page.goto(origin + "/model-world.html?src=assets/fudo.glb&title=不動尊&qa=1&avatar=shisa");
    await page.locator(".castle-enter").click();
    await page.waitForFunction(()=>document.querySelector(".castle-interior")?.dataset.qa,{},{timeout:60000});
    await page.waitForFunction(()=>JSON.parse(document.querySelector(".castle-interior").dataset.qa).avatarLoaded,{},{timeout:60000});
    const before=JSON.parse(await page.locator(".castle-interior").getAttribute("data-qa"));
    assert.equal(before.avatarId,"shisa");
    if(mobile) {
      const b=await page.locator('[data-move="forward"]').boundingBox();
      await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(1300);await page.mouse.up();
    } else { await page.keyboard.down("w");await page.waitForTimeout(1300);await page.keyboard.up("w"); }
    await page.waitForTimeout(150);
    const after=JSON.parse(await page.locator(".castle-interior").getAttribute("data-qa"));
    assert.ok(Math.abs(after.position[2]-before.position[2])>.4, "avatar moves");
    const data=await page.locator(".castle-interior canvas").evaluate(c=>c.toDataURL());
    const png=PNG.sync.read(Buffer.from(data.split(",")[1],"base64"));
    const colors=new Set();
    for(let i=0;i<png.data.length;i+=400)colors.add(png.data.subarray(i,i+3).toString("hex"));
    assert.ok(colors.size>40,"nonblank 3D scene");
    await page.screenshot({path: "/private/tmp/fudo-walk-"+(mobile?"mobile":"desktop")+".png"});
    if (!mobile) {
      await page.keyboard.down("w"); await page.waitForTimeout(6500); await page.keyboard.up("w");
      const blocked=JSON.parse(await page.locator(".castle-interior").getAttribute("data-qa"));
      assert.ok(blocked.avatar[2]>-2,"altar blocks passage");
      assert.ok(blocked.avatar[1]<1,"avatar stays on walkway");
      await page.keyboard.down("d"); await page.waitForTimeout(1400); await page.keyboard.up("d");
      const edge=JSON.parse(await page.locator(".castle-interior").getAttribute("data-qa"));
      assert.ok(Math.abs(edge.avatar[0])<1.7,"pool edge prevents falling");
      await page.evaluate(()=>document.body.classList.add("entry-locked"));
      assert.equal(await page.locator(".castle-interior").isVisible(),false);
      await page.evaluate(()=>document.body.classList.remove("entry-locked"));
      await page.locator(".castle-enter").click();
    }
    await page.getByRole("button",{name:"入口に戻る",exact:true}).click();
    await page.waitForTimeout(150);
    const reset=JSON.parse(await page.locator(".castle-interior").getAttribute("data-qa"));
    assert.ok(Math.abs(reset.position[2]-before.position[2])<.3,"reset returns to entrance");
    await page.getByRole("button",{name:"ぜんけいにもどる",exact:true}).click();
    assert.equal(await page.locator(".castle-interior").isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({mobile,before,after,colors:colors.size,errors}));
    await page.close();
  }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
