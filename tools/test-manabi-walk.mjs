import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { PNG }=createRequire(import.meta.url)("pngjs");
const root=new URL("../",import.meta.url).pathname;
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const body=path==='/public-config.js'?'window.WAKUWAKU_CONFIG={worldAccess:{requireLocation:false}};':await readFile(join(root,path));res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(body);}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
  await page.goto(origin+'/model-world.html?src=assets/MANABI_Shibuya_3F.glb&title='+encodeURIComponent(mobile?'子供の探究の聖地':'MANABI渋谷3F')+'&avatar=shisa&qa=1');
  await page.getByRole('button',{name:'アバターで入る',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(document.querySelector('.castle-interior')?.dataset.qa||'{}').avatarLoaded,{},{timeout:60000});
  const pose=()=>page.locator('.castle-interior').getAttribute('data-qa').then(JSON.parse);
  const before=await pose();
  if(mobile){const b=await page.locator('[data-move="left"]').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(1000);await page.mouse.up();}
  else{await page.keyboard.down('a');await page.waitForTimeout(1000);await page.keyboard.up('a');}
  assert.ok(Math.abs((await pose()).avatar[0]-before.avatar[0])>.5,'avatar can walk');
  for(let floor=0;floor<3;floor++){
   if(floor)await page.getByRole('button',{name:'うえのかい',exact:true}).click();
   await page.waitForTimeout(250);const state=await pose();assert.equal(state.floor,floor);assert.ok(Math.abs(state.avatar[1]-(floor*4+.32))<.25,'supported floor height');
   const data=await page.locator('.castle-interior canvas').evaluate(c=>c.toDataURL());const png=PNG.sync.read(Buffer.from(data.split(',')[1],'base64'));const colors=new Set();for(let i=0;i<png.data.length;i+=400)colors.add(png.data.subarray(i,i+3).toString('hex'));assert.ok(colors.size>40,'nonblank scene');
   await page.screenshot({path:`/private/tmp/manabi-${mobile?'mobile':'desktop'}-${floor+1}.png`});
  }
  await page.getByRole('button',{name:'入口に戻る',exact:true}).click();await page.waitForTimeout(100);assert.equal((await pose()).floor,0);
  await page.evaluate(()=>document.body.classList.add('entry-locked'));assert.equal(await page.locator('.castle-interior').isVisible(),false);
  assert.deepEqual(errors,[]);await page.close();console.log('PASS '+(mobile?'mobile':'desktop')+' avatar, walking, three floors, reset and access lock');
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
