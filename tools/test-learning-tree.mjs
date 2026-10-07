import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from '../assets/vendor/three/addons/loaders/GLTFLoader.js';
import { Octree } from '../assets/vendor/three/addons/math/Octree.js';
import { Capsule } from '../assets/vendor/three/addons/math/Capsule.js';
import { createLearningTreeNavigation, learningTreeMeshRole } from '../learning-tree-navigation.js';
const file=fs.readFileSync(new URL('../assets/learning-tree.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const floors=[], collider=new THREE.Group();
gltf.scene.traverse(mesh=>{if(!mesh.isMesh)return;const role=learningTreeMeshRole(mesh.name);if(role==='floor')floors.push(mesh);if(role==='wall'){const copy=new THREE.Mesh(mesh.geometry);copy.applyMatrix4(mesh.matrixWorld);collider.add(copy);}});
const nav=createLearningTreeNavigation(floors,new Octree().fromGraphNode(collider));
assert.equal(nav.path.length,240);
const player=new Capsule(new THREE.Vector3(0,.65+.22,8),new THREE.Vector3(0,.65+1.42,8),.22);
function follow(path){let count=0;for(const [index,target] of path.entries()){
  for(let guard=0;guard<100;guard++){
    const delta=new THREE.Vector3(target.x-player.start.x,0,target.z-player.start.z);
    if(delta.length()<.04)break;
    delta.setLength(Math.min(.035,delta.length()));
    const old=player.start.y;
    const passed=nav.step(player,delta);
    if(!passed&&nav.blockedReason==='wall')for(const mesh of collider.children){const bounds=new THREE.Box3().setFromObject(mesh);if(bounds.expandByScalar(.3).containsPoint(player.start)||bounds.containsPoint(player.end))console.log('Nearby wall',mesh.userData.name,bounds.min.toArray(),bounds.max.toArray());}
    assert(passed,`Blocked (${nav.blockedReason}) at waypoint ${index}: ${player.start.toArray()} target ${target.toArray()}`);
    assert(Math.abs(player.start.y-old)<.38,'No floor teleport');count++;
    assert(guard<99);
  }
}return count;}
const up=follow(nav.path);assert(player.start.y-player.radius>18.5);
const top=player.start.y-player.radius;
const down=follow([...nav.path].reverse());assert(player.start.y-player.radius<.8);
const edge=player.clone();edge.start.set(9.12,1,0);edge.end.set(9.12,2.2,0);
assert(!nav.step(edge,new THREE.Vector3(1,0,0)),'Cannot walk off ramp edge');
console.log(JSON.stringify({planks:nav.path.length,top,upSteps:up,downSteps:down,returnedHeight:player.start.y-player.radius}));
