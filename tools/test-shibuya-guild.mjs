import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from '../assets/vendor/three/addons/loaders/GLTFLoader.js';

const file=fs.readFileSync(new URL('../assets/MANABI_Shibuya_3F.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const display=gltf.scene.getObjectByName('MANABI_Guild_Display_3F');
assert(display,'Shibuya scene includes guild display');
const box=new THREE.Box3().setFromObject(display);
assert(Math.abs(box.min.y-8.32)<.005,'Display rests on third-floor surface');
assert(box.max.y<11.7,'Tree fits below third-floor ceiling');
assert(box.min.x>-1 && box.max.x<1.1,'Display stays clear of consultation pods');
assert(box.min.z>5.5 && box.max.z<8,'Display leaves room around third-floor spawn');
const ray=new THREE.Raycaster();
const floorMeshes=[];
gltf.scene.traverse(mesh=>{if(mesh.isMesh && /3F_oak_finish/.test(mesh.name)) floorMeshes.push(mesh);});
assert(floorMeshes.length,'Original third floor preserved');
for (const [x,z] of [[0,7],[0,10],[-1.5,7],[1.5,7]]) {
  ray.set(new THREE.Vector3(x,9,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(floorMeshes,false)[0];
  assert(hit && Math.abs(hit.point.y-8.32)<.02,`Floor support at ${x},${z}`);
}
const doors=[];display.traverse(o=>{if(/open_door$/.test(o.name))doors.push(o);});
assert.equal(doors.length,4,'All four open door leaves preserved');
assert(gltf.scene.getObjectByName('MANABI_Shibuya_|_three-storey_concept'),'Original building retained');
console.log(JSON.stringify({pass:true,displayBounds:{min:box.min.toArray(),max:box.max.toArray()},openDoors:doors.length,thirdFloorSupported:true}));
