import * as THREE from "three";

export function isGuildTree(source) {
  try { return /\/MANABI_Shibuya_3F\.glb$/i.test(new URL(source || ".", "https://world.local/").pathname); }
  catch { return false; }
}

export const guildFloors = [
  { name: "緑の入口・冒険ギルド", height: .2, spawn: [0, 3.025] },
  { name: "青のフロア・発見", height: 3.724333, spawn: [3.025 * Math.sin(2.18 * Math.PI), 3.025 * Math.cos(2.18 * Math.PI)] },
  { name: "紫のフロア・探究", height: 6.278667, spawn: [3.025 * Math.sin(3.76 * Math.PI), 3.025 * Math.cos(3.76 * Math.PI)] },
  { name: "金のフロア・新しい冒険", height: 9.835333, spawn: [3.025 * Math.sin(5.96 * Math.PI), 3.025 * Math.cos(5.96 * Math.PI)] },
];

export function isLearningTree(source, title = "") {
  return /(?:^|\/)learning-tree\.glb(?:[?#]|$)/i.test(source || "") || /子(?:供|ども)の探究の聖地/.test(title);
}

export function learningTreeMeshRole(name) {
  const readable = name.replaceAll("_", " ");
  if (/^(Single continuous ramp|Circular stone plinth|Front step)|(?:threshold landing|interior floor)$/.test(readable)) return "floor";
  if (/^(Hollow trunk|Spiral railings)|(?:open door|colored door jamb|colored lintel| table|Table leg)$/.test(readable)) return "wall";
  if (/^(Forest island|Ground entrance deck|Entrance step|Main learning hall floor|Hall floor tile|Upper hall gallery|Learning floor [23]|Level porch|Walkable spiral deck plank)/.test(readable)) return "floor";
  if (/^(Sculpted hollow tree bark|Open wooden door|Doorway jamb|Continuous ramp handrail|Spiral railing post|Railing rail|Railing post|Bookshelf|Team worktable|Curved welcome counter)/.test(readable)) return "wall";
  return "decoration";
}

export function createLearningTreeNavigation(floors, collisions) {
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
  const normalMatrix = new THREE.Matrix3();
  let blockedReason = "";
  function heightAt(x, z, currentHeight) {
    ray.set(new THREE.Vector3(x, currentHeight + .36, z), down);
    ray.far = .72;
    const hit = ray.intersectObjects(floors, false).find(hit => {
      const normal = hit.face.normal.clone().applyNormalMatrix(normalMatrix.getNormalMatrix(hit.object.matrixWorld));
      return normal.y > .5 && hit.point.y >= currentHeight - .32;
    });
    return hit?.point.y;
  }
  function step(player, delta) {
    const foot = player.start.y - player.radius;
    const x = player.start.x + delta.x, z = player.start.z + delta.z;
    const height = heightAt(x, z, foot);
    if (height === undefined) { blockedReason = "no-floor"; return false; }
    // Require support around the feet as well as the centre, including at ramp edges.
    for (const [dx, dz] of [[.15, 0], [-.15, 0], [0, .15], [0, -.15]]) {
      const edge = heightAt(x + dx, z + dz, height);
      if (edge === undefined || Math.abs(edge - height) > .35) { blockedReason = "edge"; return false; }
    }
    const candidate = player.clone();
    candidate.translate(new THREE.Vector3(delta.x, height - foot + .002, delta.z));
    const hit = collisions.capsuleIntersect(candidate);
    if (hit && hit.depth > .015) { blockedReason = "wall"; return false; }
    player.copy(candidate);
    return true;
  }
  const guildRamp = floors.find(mesh => /^Single.continuous.ramp/.test(mesh.name));
  const path = guildRamp ? Array.from({ length: 241 }, (_, index) => {
    // Stop at the top doorway, leaving a safe standing margin before the ramp end.
    const t = 5.96 * Math.PI * index / 240;
    return guildRamp.localToWorld(new THREE.Vector3(3.025 * Math.sin(t), .2 + 9.7 * t / (6 * Math.PI), 3.025 * Math.cos(t)));
  }) : floors.filter(mesh => /^Walkable.spiral.deck.plank/.test(mesh.name)).sort((a, b) => {
    const number = name => Number(name.match(/plank[._]?(\d+)$/)?.[1] || 0);
    return number(a.name) - number(b.name);
  }).map(mesh => {
    const bounds = new THREE.Box3().setFromObject(mesh), centre = bounds.getCenter(new THREE.Vector3());
    centre.y = heightAt(centre.x, centre.z, bounds.max.y) ?? bounds.max.y;
    return centre;
  });
  return { step, heightAt, path, get blockedReason() { return blockedReason; } };
}
