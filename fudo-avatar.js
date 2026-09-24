import * as THREE from "three";

export function isFudoModel(source) {
  try {
    const url = new URL(source, location.href);
    return ["http:", "https:"].includes(url.protocol) && /\/fudo\.glb$/i.test(url.pathname);
  }
  catch { return false; }
}

export function createFudoAvatar() {
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem("wakuwaku-quest-state-v3"))?.member?.avatar || {}; } catch {}
  const group = new THREE.Group();
  const color = /^#[0-9a-f]{6}$/i.test(profile.color) ? profile.color : "#348ab3";
  const suit = new THREE.MeshStandardMaterial({ color, roughness: .8 });
  const dark = new THREE.MeshStandardMaterial({ color: "#283e49", roughness: .9 });
  const skin = new THREE.MeshStandardMaterial({ color: "#f3d5bb", roughness: .9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .42, 4, 12), suit);
  body.position.y = .91; group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.23, 16, 12), skin);
  head.position.y = 1.48; group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dark);
  hair.position.y = 1.52; group.add(hair);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(.34, .4, .17), dark);
  pack.position.set(0, .95, .22); group.add(pack);
  const limbs = [];
  for (const side of [-1, 1]) {
    for (const leg of [true, false]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (leg ? .13 : .33), leg ? .55 : 1.15, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(leg ? .095 : .075, leg ? .34 : .31, 3, 8), leg ? dark : suit);
      limb.position.y = leg ? -.28 : -.2; pivot.add(limb); group.add(pivot);
      limbs.push({ pivot, sign: side * (leg ? 1 : -1) });
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  function draw(image) {
    context.clearRect(0, 0, 128, 128);
    context.save(); context.beginPath(); context.arc(64, 64, 60, 0, Math.PI * 2); context.clip();
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, 128, 128);
    if (image) context.drawImage(image, 4, 4, 120, 120);
    else { context.fillStyle = color; context.font = "bold 48px system-ui"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(String(profile.symbol || "自分").slice(0, 2), 64, 64); }
    context.restore(); texture.needsUpdate = true;
  }
  draw();
  const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
  badge.position.y = 2.05; badge.scale.set(.52, .52, 1); group.add(badge);
  const presets = ["coral", "miu", "shisa", "sora", "rin", "professor", "robot", "explorer", "manta", "sprite"];
  const preset = presets.includes(profile.presetId) ? profile.presetId : "";
  const imageSrc = preset ? `assets/avatar-presets/${preset}${["rin", "robot", "sprite"].includes(preset) ? ".png" : "-preview.jpg"}` : profile.imageDataUrl || profile.downloadUrl || "";
  if (imageSrc && /^(assets\/|data:image\/|https?:\/\/)/i.test(imageSrc)) {
    const image = new Image(); image.crossOrigin = "anonymous";
    image.onload = () => draw(image); image.src = imageSrc;
  }
  return {
    group,
    animate(time, speed) {
      for (const { pivot, sign } of limbs) pivot.rotation.x = Math.sin(time * .009) * .48 * sign * Math.min(speed / 2.1, 1);
    },
  };
}
