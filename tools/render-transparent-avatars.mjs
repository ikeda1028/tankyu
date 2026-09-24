import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { PNG } = createRequire(import.meta.url)("pngjs");
const root = new URL("../", import.meta.url).pathname;
const ids = ["coral", "miu", "shisa", "sora", "rin", "professor", "robot", "explorer", "manta", "sprite"];
const html = `<style>body{margin:0;background:transparent}</style><script type="importmap">{"imports":{"three":"/assets/vendor/three/three.module.js"}}</script><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from '/assets/vendor/three/addons/loaders/GLTFLoader.js';
window.renderAvatar=async id=>{
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(384,480);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 document.body.replaceChildren(renderer.domElement);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x8694a8,2.5));
 const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(3,5,6);scene.add(key);
 const gltf=await new GLTFLoader().loadAsync('/assets/world-avatars/'+id+'.glb');scene.add(gltf.scene);
 const bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const halfHeight=Math.max(size.y/2,size.x/(2*.8))*1.12;
 const camera=new THREE.OrthographicCamera(-halfHeight*.8,halfHeight*.8,halfHeight,-halfHeight,.01,Math.max(100,size.length()*20));
 camera.position.set(center.x,center.y,center.z+size.length()*3);camera.lookAt(center);renderer.render(scene,camera);
 const png=renderer.domElement.toDataURL('image/png');
 scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}});
 renderer.dispose();renderer.forceContextLoss();return png;
};</script>`;
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;if(path==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':'application/octet-stream');res.end(await readFile(join(root,path)));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 for(const id of ids){
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.renderAvatar);
  const uri=await page.evaluate(id=>window.renderAvatar(id),id),data=Buffer.from(uri.split(',')[1],'base64');
  const png=PNG.sync.read(data);let clear=0,solid=0;
  for(let i=3;i<png.data.length;i+=4){if(png.data[i]===0)clear++;if(png.data[i]>200)solid++;}
  assert.ok(clear>png.width*png.height*.25 && solid>png.width*png.height*.04,id+' has transparent background and visible model');
  assert.equal(png.data[3],0,id+' corner transparent');
  await writeFile(join(root,'assets/avatar-presets',id+'-transparent.png'),data);
  console.log(id,JSON.stringify({clear,solid,bytes:data.length}));await page.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
