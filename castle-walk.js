import * as THREE from "three";
import { GLTFLoader } from "./assets/vendor/three/addons/loaders/GLTFLoader.js";
import { Octree } from "./assets/vendor/three/addons/math/Octree.js";
import { Capsule } from "./assets/vendor/three/addons/math/Capsule.js";
import { isFudoModel, createFudoAvatar } from "./fudo-avatar.js";

import { windowFocusAmount, smoothWindowFocus, isExteriorWindow } from "./window-view.js";

const params = new URLSearchParams(location.search);
const source = params.get("src");
const fudo = isFudoModel(source);
const manabi = /\/MANABI_Shibuya_3F\.glb$/i.test(new URL(source || ".", location.href).pathname);
const avatarWorld = fudo || manabi;
const skyline = window.SanctuarySky?.resolve(params, location.href);
const sanctuary = Boolean(skyline);
const clearWindowView = true;
const world = QuestItems.worldKey(source);
const viewer = document.querySelector("#world-model");
const floors = fudo ? [{ name: "不動尊・堂内", height: .65, spawn: [0, 10] }] : manabi ? [
  { name: "1階・交流と対話", height: .32, spawn: [0, 10] },
  { name: "2階・実験ラボ", height: 4.32, spawn: [0, 10] },
  { name: "3階・相談と探究", height: 8.32, spawn: [0, 10] },
] : [
  { name: "こうりゅうのま", height: 9.95, spawn: [-11.7, 4.2], match: "Future layer 6" },
  { name: "じっけんのま", height: 18.58, spawn: [-5.7, -16.4], match: "Future layer 7" },
  { name: "てんぼうのま", height: 26.33, spawn: [-4.7, -36.4], match: "Future layer 8" },
];
const enter = document.createElement("button");
const enterLabel = avatarWorld ? "アバターで入る" : "しろにはいる";
enter.type = "button"; enter.className = "castle-enter"; enter.textContent = enterLabel;
document.body.append(enter);
const surface = document.createElement("section");
surface.className = "castle-interior"; surface.hidden = true;
surface.setAttribute("aria-label", avatarWorld ? `${params.get("title") || "ワールド"}を歩く` : "かつれんじょうの なか");
surface.classList.toggle("fudo-interior", avatarWorld);
surface.innerHTML = `<div class="castle-floor" role="status"></div><div class="castle-reticle" aria-hidden="true"></div>
<div class="castle-move" aria-label="あるく">
${[["forward", "up", "まえへ"], ["left", "left", "ひだりへ"], ["back", "down", "うしろへ"], ["right", "right", "みぎへ"]].map(([direction, icon, text]) => `<button type="button" data-move="${direction}" aria-label="${text}" title="${text}"><img src="assets/walk-${icon}.svg" alt="" width="24" height="24"></button>`).join("")}</div>
<div class="castle-actions"><button type="button" data-floor="up" aria-label="うえのかい" title="うえのかい"><img src="assets/walk-up.svg" alt="" width="24" height="24"></button><button type="button" data-floor="down" aria-label="したのかい" title="したのかい"><img src="assets/walk-down.svg" alt="" width="24" height="24"></button><button type="button" class="castle-leave" aria-label="ぜんけいにもどる" title="ぜんけいにもどる"><img src="assets/walk-exit.svg" alt="" width="24" height="24"></button></div>
<button type="button" class="castle-inspect" hidden><img src="assets/walk-hand.svg" alt="" width="20" height="20">しらべる</button>`;
document.body.append(surface);
const status = surface.querySelector(".castle-floor");
const inspect = surface.querySelector(".castle-inspect");
let renderer, scene, camera, castle, collisions, floor = 0, active = false, loading = false;
let items = [], target = null, yaw = 0, pitch = -.32, lastTime = 0;
let stepPulse = null;
let avatar;
let windowFocus = 0;
const exteriorWindows = [], windowMaterials = [];
const keys = new Set(), held = new Set();
const player = new Capsule(new THREE.Vector3(), new THREE.Vector3(), .22);
const velocity = new THREE.Vector3();
const ray = new THREE.Raycaster(), opaque = [], floorMeshes = [];
const materials = {
  stone: new THREE.MeshStandardMaterial({ color: 0xa9aea0, roughness: .98, metalness: 0 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0x73958a, roughness: .38, metalness: .05 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xa29564, roughness: .5, metalness: .55 }),
  etching: new THREE.MeshStandardMaterial({ color: 0x52685d, roughness: .8 }),
};

function makeRelic(item) {
  const relic = new THREE.Group();
  const shape = new THREE.Shape();
  [[-.1, -.075], [.025, -.1], [.12, -.015], [.065, .095], [-.085, .08]].forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .025, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .009, bevelThickness: .005 }), materials[item.material]);
  body.rotation.x = -Math.PI / 2; relic.add(body);
  const engraving = new THREE.Mesh(new THREE.TorusGeometry(.037, .0028, 4, item.track === "lens" ? 4 : 20), materials.etching);
  engraving.rotation.x = -Math.PI / 2; engraving.position.y = .036; relic.add(engraving);
  if (item.track === "prism") engraving.scale.set(1, .6, 1);
  relic.rotation.y = item.level * .72;
  relic.userData.item = item;
  return relic;
}
function placeItems() {
  if (!castle || avatarWorld) return;
  for (const object of items) {
    scene.remove(object);
    object.traverse((child) => child.geometry?.dispose());
  }
  items = CastleQuests.next(QuestInventory.getRecords(), world).map((item) => {
    const object = makeRelic(item), room = floors[item.floor];
    const [x, z] = item.ground;
    ray.set(new THREE.Vector3(x, room.height + .8, z), new THREE.Vector3(0, -1, 0));
    const hits = ray.intersectObjects(floorMeshes.filter((mesh) => mesh.userData.castleFloor === item.floor));
    const hit = hits.find((entry) => Math.abs(entry.point.y - room.height) < .4);
    // Place on the visible bench/display surface when furniture covers the floor.
    ray.set(new THREE.Vector3(x, room.height + 1.1, z), new THREE.Vector3(0, -1, 0));
    const support = ray.intersectObjects(opaque, false).find((entry) => entry.point.y >= room.height - .2 && entry.point.y <= room.height + 1.05);
    object.position.set(x, (support?.point.y ?? hit?.point.y ?? room.height) + .012, z);
    object.visible = Boolean(hit); // Never suspend an item over a gap in the supplied GLB.
    scene.add(object);
    return object;
  });
}
function verifyPlacements() {
  return CastleQuests.items.map((item) => {
    const room = floors[item.floor], [x, z] = item.ground;
    ray.set(new THREE.Vector3(x, room.height + .8, z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObjects(floorMeshes.filter((mesh) => mesh.userData.castleFloor === item.floor)).find((entry) => Math.abs(entry.point.y - room.height) < .4);
    return { id: item.id, supported: Boolean(hit) };
  });
}
function resize() {
  if (!renderer) return;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}
function respawn(index) {
  floor = Math.max(0, Math.min(floors.length - 1, index));
  const room = floors[floor], [x, z] = room.spawn;
  player.start.set(x, room.height + .3, z);
  player.end.set(x, room.height + 1.5, z);
  velocity.set(0, 0, 0); windowFocus = 0; if (avatar) avatar.group.visible = true; yaw = 0; pitch = sanctuary ? .02 : -.32;
  status.textContent = fudo ? room.name : `${floor + 1} / 3　${room.name}`;
  surface.querySelector('[data-floor="up"]').disabled = floor === floors.length - 1;
  surface.querySelector('[data-floor="down"]').disabled = floor === 0;
}
function visibleItem(object) {
  if (!active || !object.visible || object.userData.item.floor !== floor) return false;
  const point = object.position.clone().add(new THREE.Vector3(0, .04, 0));
  const screen = point.clone().project(camera);
  if (Math.abs(screen.x) > .96 || Math.abs(screen.y) > .96 || screen.z < -1 || screen.z > 1) return false;
  const direction = point.sub(camera.position), distance = direction.length();
  if (distance > 2.4) return false;
  direction.normalize();
  if (camera.getWorldDirection(new THREE.Vector3()).dot(direction) < .55) return false;
  ray.set(camera.position, direction);
  ray.far = distance - .06;
  const blocked = ray.intersectObjects(opaque, false).length > 0;
  ray.far = Infinity;
  return !blocked;
}
function findTarget() {
  target = items.filter(visibleItem).sort((a, b) => a.position.distanceTo(camera.position) - b.position.distanceTo(camera.position))[0] || null;
  inspect.hidden = !target;
  inspect.setAttribute("aria-label", target ? `ちいさなかけらを しらべる` : "しらべる");
}
let runMode = false;
function addAvatarControls() {
  const panel = document.createElement("details");
  panel.className = "avatar-motion-controls";
  panel.innerHTML = `<summary>動作・表情</summary><label><input type="checkbox" data-run>走る</label>
    <label>待機<select data-idle><option value="auto">自動</option><option value="still">静止</option></select></label>
    <label><input type="checkbox" data-blink checked disabled>まばたき</label>
    <label>笑顔<input type="range" data-smile min="0" max="1" step=".05" value="0" disabled></label>
    <label>口の開き<input type="range" data-mouth min="0" max="1" step=".05" value="0" disabled></label>`;
  surface.append(panel);
  panel.querySelector('[data-run]').onchange = event => { runMode = event.target.checked; };
  panel.querySelector('[data-idle]').disabled = true;
  avatar.ready.then(motion => {
    if (!motion) return;
    const select = panel.querySelector('[data-idle]'); select.disabled = false;
    for (const name of motion.capabilities.idles) {
      const option = document.createElement('option'); option.value = name;
      option.textContent = name === 'dance' ? 'ダンス' : name === 'idle_02' ? '待機 02' : '待機 03'; select.append(option);
    }
    select.onchange = () => { motion.settings.idle = select.value; };
    for (const name of ['blink', 'smile', 'mouth']) {
      const input = panel.querySelector(`[data-${name}]`); input.disabled = !motion.capabilities[name];
      if (input.disabled && name === 'blink') input.checked = false;
      input.oninput = () => { motion.settings[name] = name === 'blink' ? input.checked : Number(input.value); };
    }
  });
}
function updateWindowFocus(target, dt) {
  if (!clearWindowView || !exteriorWindows.length) return;
  const direction = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  let nearest = Infinity;
  // Also sample below eye level so the low terrace glazing can be approached.
  for (const height of [0, -.75]) {
    const origin = target.clone(); origin.y += height;
    ray.set(origin, direction); ray.far = 2.2;
    const windowHit = ray.intersectObjects(exteriorWindows, false)[0];
    const wallHit = ray.intersectObjects(opaque, false)[0];
    if (windowHit && (!wallHit || windowHit.distance < wallHit.distance)) nearest = Math.min(nearest, windowHit.distance);
  }
  ray.far = Infinity;
  windowFocus = smoothWindowFocus(windowFocus, windowFocusAmount(nearest), dt);
  for (const material of windowMaterials) material.opacity = THREE.MathUtils.lerp(.10, .008, windowFocus);
}
function clearInput() { held.clear(); keys.clear(); stepPulse = null; velocity.x = velocity.z = 0; }
function leave() {
  active = false; clearInput(); surface.hidden = true;
  if (document.body.classList.contains("castle-walking")) document.body.classList.remove("castle-walking");
  if (renderer) renderer.setAnimationLoop(null);
}
function frame(time) {
  if (!active) return;
  const dt = Math.min((time - lastTime) / 1000 || .016, .045); lastTime = time;
  if (!document.querySelector("dialog[open]") && !document.hidden) {
    const pressed = (direction) => held.has(direction) || (stepPulse?.direction === direction && time < stepPulse.until);
    const forward = (pressed("forward") || keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (pressed("back") || keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const side = (pressed("right") || keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (pressed("left") || keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
    const move = new THREE.Vector3(side * Math.cos(yaw) - forward * Math.sin(yaw), 0, -side * Math.sin(yaw) - forward * Math.cos(yaw));
    if (move.lengthSq()) move.normalize().multiplyScalar(runMode || keys.has('ShiftLeft') || keys.has('ShiftRight') ? 3.6 : 2.1);
    velocity.x = move.x; velocity.z = move.z;
    const before = player.start.clone();
    // Three.js's capsule/Octree resolves walls and floors; small substeps prevent tunnelling.
    for (let step = 0; step < 3; step++) {
      velocity.y -= 14 * dt / 3;
      player.translate(velocity.clone().multiplyScalar(dt / 3));
      const hit = collisions.capsuleIntersect(player);
      if (hit) {
        player.translate(hit.normal.multiplyScalar(hit.depth));
        if (hit.normal.y > 0) velocity.y = 0;
      }
    }
    if (avatarWorld) {
      // Step onto the model's low platforms; never allow a capsule to sink into them.
      const foot = player.start.y - player.radius;
      ray.set(new THREE.Vector3(player.start.x, foot + .36, player.start.z), new THREE.Vector3(0, -1, 0));
      const support = ray.intersectObjects(floorMeshes, false).find(hit => hit.point.y >= foot - .4 && hit.point.y <= foot + .32);
      if (support && velocity.y <= 0) {
        player.translate(new THREE.Vector3(0, support.point.y - foot + .002, 0)); velocity.y = 0;
      }
      // A missing floor or the reflecting pool is not a walking surface.
      if (!support && before.y > -.5) {
        player.translate(new THREE.Vector3(before.x - player.start.x, 0, before.z - player.start.z));
      }
      if (move.lengthSq()) avatar.group.rotation.y = Math.atan2(-move.x, -move.z);
    }
    if (player.start.y < floors[floor].height - 2) respawn(floor);
  } else clearInput();
  if (avatarWorld) {
    avatar.group.position.set(player.start.x, player.start.y - player.radius, player.start.z);
    avatar.animate(time, Math.hypot(velocity.x, velocity.z));
    const target = player.start.clone().add(new THREE.Vector3(0, 1.1, 0));
    updateWindowFocus(target, dt);
    // At the glass, approach eye height without moving the player's collider.
    target.y += windowFocus * .33;
    avatar.group.visible = windowFocus < .72;
    const elevation = THREE.MathUtils.clamp(-pitch + .18, clearWindowView ? -.7 : .12, 1.1);
    const offset = new THREE.Vector3(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation)).multiplyScalar((manabi ? 2.8 : 4.5) * (1 - windowFocus));
    ray.set(target, offset.clone().normalize()); ray.far = Math.max(.001, offset.length());
    const obstruction = ray.intersectObjects(opaque, false)[0]; ray.far = Infinity;
    if (obstruction) offset.setLength(Math.min(offset.length(), Math.max(.04, obstruction.distance - .15)));
    camera.position.copy(target).add(offset);
    // A separate look direction remains valid even when the follow offset reaches zero.
    camera.lookAt(camera.position.clone().add(new THREE.Vector3(-Math.sin(yaw) * Math.cos(elevation), -Math.sin(elevation), -Math.cos(yaw) * Math.cos(elevation))));
  } else { updateWindowFocus(player.end, dt); camera.position.copy(player.end); camera.rotation.set(pitch, yaw, 0, "YXZ"); }
  camera.updateMatrixWorld();
  findTarget(); renderer.render(scene, camera);
  if (params.get("qa") === "1") surface.dataset.qa = JSON.stringify({ windowFocus, exteriorWindowCount: exteriorWindows.length, position: camera.position.toArray(), avatar: avatar?.group.position.toArray(), avatarId: avatar?.group.userData.avatarId, avatarLoaded: avatar?.group.userData.modelLoaded, motion: avatar?.group.userData.motion, blink: avatar?.group.userData.blink, floor, items: items.map((item) => ({id:item.userData.item.id,position:item.position.toArray(),visible:item.visible})), target: target?.userData.item.id || null });
}
async function enterCastle() {
  if (loading || document.body.classList.contains("entry-locked")) return;
  loading = true; enter.disabled = true; enter.textContent = "よみこみちゅう…";
  try {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: params.get("qa") === "1" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.domElement.setAttribute("aria-label", avatarWorld ? "ワールドを見回す" : "しろのなかを みまわす");
      renderer.domElement.tabIndex = 0; surface.prepend(renderer.domElement);
      scene = new THREE.Scene(); scene.background = new THREE.Color(0xc9e0e5); scene.fog = new THREE.Fog(0xc9e0e5, 110, 260);
      camera = new THREE.PerspectiveCamera(65, 1, .04, 400);
      if (sanctuary) {
        scene.fog = null;
        const sky = await new THREE.TextureLoader().loadAsync(skyline.image);
        sky.mapping = THREE.EquirectangularReflectionMapping;
        sky.colorSpace = THREE.SRGBColorSpace;
        scene.background = sky;
        scene.backgroundRotation.y = skyline.rotation;
        scene.backgroundIntensity = .85;
      }
      scene.add(new THREE.HemisphereLight(0xebfaff, 0x81877b, 2.6));
      const sun = new THREE.DirectionalLight(0xffefcf, 3.2); sun.position.set(-35, 80, 30); scene.add(sun);
      const gltf = await new GLTFLoader().loadAsync(source);
      castle = gltf.scene; scene.add(castle); castle.updateMatrixWorld(true);
      const collider = new THREE.Group();
      castle.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const readable = mesh.name.replaceAll("_", " ");
        const originalMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const exterior = originalMaterials.some(material => isExteriorWindow(readable, material.name));
        if (exterior) {
          const glass = new THREE.MeshBasicMaterial({ color: 0xe4f5fa, transparent: true, opacity: .10, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
          mesh.material = glass;
          exteriorWindows.push(mesh); windowMaterials.push(glass);
        }
        if (manabi) {
          // Keep tiny display objects and foliage out of the walking collision tree.
          if (!/Foliage|Stem|Soil|luminous|light|Book\d*$|Cup|Microscope|Robot link|Robot joint|Prototype|Question tree|Inquiry branch/i.test(readable)) {
            const copy = new THREE.Mesh(mesh.geometry); copy.applyMatrix4(mesh.matrixWorld); collider.add(copy);
          }
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          if (mats.some(material => !material.transparent || material.opacity > .8)) opaque.push(mesh);
          if (/oak finish|Arrival plaza|Arrival walk|Stair tread|Lift landing|pod floor/i.test(readable)) floorMeshes.push(mesh);
          return;
        }
        if (fudo) {
          // Detailed statue/water meshes stay visual-only; architecture provides collision.
          if (/hall foundation|arrival bridge|entrance step|dry central causeway|meditation timber deck|purification stepping terrace|slender bronze support|curved glass edge|curved meditation bench|Fudo altar|cleansing basin|Swept oculus/i.test(readable)) {
            const copy = new THREE.Mesh(mesh.geometry); copy.applyMatrix4(mesh.matrixWorld); collider.add(copy);
            if (!exterior) opaque.push(mesh);
          }
          if (/arrival bridge$|entrance step|dry central causeway|meditation timber deck|purification stepping terrace/i.test(readable)) floorMeshes.push(mesh);
          return;
        }
        const room = floors.findIndex((entry) => readable.includes(entry.match));
        if (!mesh.material.transparent || mesh.material.opacity > .8) opaque.push(mesh);
        if (room >= 0) {
          const copy = new THREE.Mesh(mesh.geometry); copy.applyMatrix4(mesh.matrixWorld); collider.add(copy);
          if (/timber deck|terrazzo/i.test(readable)) { mesh.userData.castleFloor = room; floorMeshes.push(mesh); }
        }
      });
      collisions = new Octree().fromGraphNode(collider);
      if (avatarWorld) { avatar = createFudoAvatar(); scene.add(avatar.group); addAvatarControls(); }
      if (!avatarWorld && params.get("qa") === "1") surface.dataset.placements = JSON.stringify(verifyPlacements());
      placeItems();
      let drag = null;
      renderer.domElement.addEventListener("pointerdown", (event) => { drag = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 }; renderer.domElement.setPointerCapture(event.pointerId); });
      renderer.domElement.addEventListener("pointermove", (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        drag.distance += Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y);
        yaw -= (event.clientX - drag.x) * .004;
        pitch = THREE.MathUtils.clamp(pitch - (event.clientY - drag.y) * .004, -1.3, 1.1);
        drag.x = event.clientX; drag.y = event.clientY;
      });
      const release = (event) => {
        if (event.type === "pointerup" && drag && drag.distance < 6) {
          const rect = renderer.domElement.getBoundingClientRect();
          ray.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
          const hit = ray.intersectObjects(items, true)[0];
          const object = hit?.object.parent;
          if (object?.userData.item && visibleItem(object)) QuestInventory.openItem(object.userData.item.id);
        }
        drag = null;
      };
      renderer.domElement.addEventListener("pointerup", release); renderer.domElement.addEventListener("pointercancel", release);
      renderer.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); leave(); enter.disabled = true; enter.textContent = "がめんを ひらきなおしてね"; });
    }
    if (document.body.classList.contains("entry-locked")) return;
    active = true; surface.hidden = false; document.body.classList.add("castle-walking");
    respawn(floor); resize(); lastTime = performance.now(); renderer.setAnimationLoop(frame);
    renderer.domElement.focus();
  } catch (error) {
    console.warn("Castle interior unavailable", error);
    leave(); renderer?.dispose(); renderer?.domElement.remove(); renderer = null; castle = null;
    opaque.length = floorMeshes.length = 0;
    exteriorWindows.length = 0; windowMaterials.splice(0).forEach(material => material.dispose()); windowFocus = 0;
    enter.textContent = "もういちど はいる";
  } finally { loading = false; enter.disabled = false; if (castle) enter.textContent = enterLabel; }
}
enter.onclick = enterCastle;
surface.querySelector(".castle-leave").onclick = leave;
surface.querySelectorAll("[data-floor]").forEach((button) => button.onclick = () => { clearInput(); respawn(floor + (button.dataset.floor === "up" ? 1 : -1)); });
if (sanctuary) {
  const views = document.createElement('div');
  views.className = 'sanctuary-views';
  views.innerHTML = '<p></p><button type="button" data-sky="fuji"></button><button type="button" data-sky="city"></button>';
  views.querySelector('p').textContent = skyline.label;
  views.querySelector('[data-sky="fuji"]').textContent = skyline.skyline;
  views.querySelector('[data-sky="city"]').textContent = skyline.city;
  surface.append(views);
  views.querySelectorAll('[data-sky]').forEach(button => {
    button.onclick = () => {
      clearInput(); respawn(2);
      // The third-floor entrance opens toward +Z; turn out from the building.
      yaw = Math.PI; pitch = button.dataset.sky === 'city' ? -.4 : .06;
      renderer?.domElement.focus();
    };
  });
}
if (avatarWorld) {
  if (fudo) surface.querySelectorAll("[data-floor]").forEach(button => { button.hidden = true; });
  const reset = document.createElement("button");
  reset.type = "button"; reset.textContent = "入口"; reset.title = "入口に戻る"; reset.setAttribute("aria-label", "入口に戻る");
  reset.onclick = () => { clearInput(); respawn(0); };
  surface.querySelector(".castle-actions").prepend(reset);
}
surface.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => { stepPulse = { direction: button.dataset.move, until: performance.now() + 160 }; });
  button.addEventListener("pointerdown", (event) => { event.preventDefault(); held.add(button.dataset.move); button.setPointerCapture(event.pointerId); });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(event, () => held.delete(button.dataset.move));
});
inspect.onclick = () => { if (target && visibleItem(target)) { clearInput(); QuestInventory.openItem(target.userData.item.id); } };
window.addEventListener("keydown", (event) => { if (active && !document.querySelector("dialog[open]") && !event.target.closest('input, select, textarea') && /^(Key[WASD]|Arrow|Shift)/.test(event.code)) { event.preventDefault(); keys.add(event.code); } });
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", clearInput);
document.addEventListener("visibilitychange", clearInput);
window.addEventListener("resize", resize);
window.addEventListener("quest-inventory-updated", placeItems);
new MutationObserver(() => { if (document.body.classList.contains("entry-locked")) leave(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
window.CastleWalk = { canCollect: (item) => Boolean(items.find((object) => object.userData.item.id === item.id && visibleItem(object))) };

