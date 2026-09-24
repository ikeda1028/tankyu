import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2];if(!root)throw Error('Pass Katsuren public directory');
const server=createServer(async(req,res)=>{try{let path=new URL(req.url,'http://localhost').pathname;if(path==='/')path='/index.html';res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(join(root,path)));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 for(const path of ['/#avatar=miu','/ancient.html#avatar=robot']){
  const page=await browser.newPage({viewport:{width:1280,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+path);await page.getByRole('link',{name:'共通アバターを読み込む',exact:true}).waitFor({timeout:60000});
  const ancient=path.includes('ancient');const select=page.locator(ancient?'#avatar':'#avatarChoice');
  assert.equal(await select.inputValue(),ancient?'robot':'miu');
  await select.selectOption('shisa');
  const href=await page.getByRole('link',{name:'選択を共通設定に保存',exact:true}).getAttribute('href');
  assert.equal(new URL(href).searchParams.get('avatar'),'shisa');
  if(ancient)assert.equal(await select.locator('option').count(),10);
  await page.screenshot({path:`/private/tmp/shared-${ancient?'ancient':'katsuren'}.png`});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS Katsuren and ancient world avatar handoff and all ten choices');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
