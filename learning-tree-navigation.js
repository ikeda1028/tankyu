import * as THREE from "three";

export function isLearningTree(source, title = "") {
  return /(?:^|\/)learning-tree\.glb(?:[?#]|$)/i.test(source || "") || /子(?:供|ども)の探究の聖地/.test(title);
}

export function learningTreeMeshRole(name) {
  const readable = name.replaceAll("_", " ");
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
  const path = floors.filter(mesh => /^Walkable.spiral.deck.plank/.test(mesh.name)).sort((a, b) => {
    const number = name => Number(name.match(/plank[._]?(\d+)$/)?.[1] || 0);
    return number(a.name) - number(b.name);
  }).map(mesh => {
    const bounds = new THREE.Box3().setFromObject(mesh), centre = bounds.getCenter(new THREE.Vector3());
    centre.y = heightAt(centre.x, centre.z, bounds.max.y) ?? bounds.max.y;
    return centre;
  });
  return { step, heightAt, path, get blockedReason() { return blockedReason; } };
}
