import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from '../assets/vendor/three/addons/loaders/GLTFLoader.js';
import { Octree } from '../assets/vendor/three/addons/math/Octree.js';
import { Capsule } from '../assets/vendor/three/addons/math/Capsule.js';
import { isGuildTree, guildFloors, learningTreeMeshRole, createLearningTreeNavigation } from '../learning-tree-navigation.js';

assert(isGuildTree('assets/MANABI_Shibuya_3F.glb'));
assert(!isGuildTree('assets/learning-tree.glb'));
const file=fs.readFileSync(new URL('../assets/MANABI_Shibuya_3F.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');
gltf.scene.updateMatrixWorld(true);
assert(!gltf.scene.getObjectByName('MANABI_Guild_Display_3F'),'Miniature removed');
assert(!gltf.scene.getObjectByName('MANABI_Shibuya_|_three-storey_concept'),'Previous building replaced');
const floors=[],collider=new THREE.Group();
gltf.scene.traverse(mesh=>{
 if(!mesh.isMesh)return;
 const role=learningTreeMeshRole(mesh.name);
 if(role==='floor')floors.push(mesh);
 if(role==='wall'){const copy=new THREE.Mesh(mesh.geometry);copy.applyMatrix4(mesh.matrixWorld);collider.add(copy);}
});
const nav=createLearningTreeNavigation(floors,new Octree().fromGraphNode(collider));
assert.equal(nav.path.length,241);
const player=new Capsule(new THREE.Vector3(0,.42,3.025),new THREE.Vector3(0,1.62,3.025),.22);
function follow(points){let count=0;for(const [index,target] of points.entries()){
 for(let guard=0;guard<100;guard++){
  const delta=new THREE.Vector3(target.x-player.start.x,0,target.z-player.start.z);
  if(delta.length()<.025)break;
  delta.setLength(Math.min(.025,delta.length()));
  const old=player.start.y;
  assert(nav.step(player,delta),`Blocked ${nav.blockedReason} at ${index}: ${player.start.toArray()} -> ${target.toArray()}`);
  assert(Math.abs(player.start.y-old)<.15,'No teleport between levels');count++;
  assert(guard<99,'Route makes progress');
 }
}return count;}
const up=follow(nav.path);const summit=player.start.y-player.radius;assert(summit>9.8);
const down=follow([...nav.path].reverse());assert(player.start.y-player.radius<.25);
for(const floor of guildFloors){const [x,z]=floor.spawn;assert(Math.abs(nav.heightAt(x,z,floor.height)-floor.height)<.03,'Each destination supported');}
console.log(JSON.stringify({pass:true,spiralWaypoints:nav.path.length,summit,upSteps:up,downSteps:down,returnedHeight:player.start.y-player.radius}));
