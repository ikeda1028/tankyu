import * as THREE from "three";

export const animatedAvatars = ["shisa", "professor", "miu", "coral"];

// The same baked poses and facial targets used by the Katsuren worlds.
export async function loadAvatarMotion(id) {
  const base = `assets/avatar-motion/${id}`;
  async function read(suffix, json = false) {
    const response = await fetch(base + suffix);
    if (!response.ok) throw new Error(`Avatar motion: ${response.status}`);
    return json ? response.json() : response.arrayBuffer();
  }
  const meta = await read(".json", true);
  const data = await read(".bin"), skin = await read("-skin.bin"), motion = await read("-motion.bin");
  const geometry = new THREE.BufferGeometry();
  const vertices = new THREE.InterleavedBuffer(new Float32Array(data, 0, meta.vertices * 8), 8);
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(vertices, 3, 0));
  geometry.setAttribute("normal", new THREE.InterleavedBufferAttribute(vertices, 3, 3));
  geometry.setAttribute("uv", new THREE.InterleavedBufferAttribute(vertices, 2, 6));
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(data, meta.indexOffset, meta.indices), 1));
  const weights = new THREE.InterleavedBuffer(new Float32Array(skin), 8);
  geometry.setAttribute("jointIds", new THREE.InterleavedBufferAttribute(weights, 4, 0));
  geometry.setAttribute("jointWeights", new THREE.InterleavedBufferAttribute(weights, 4, 4));
  const face = meta.morphTargets ? new Float32Array(await read("-face.bin")) : new Float32Array(meta.vertices * 18);
  const targets = new THREE.InterleavedBuffer(face, 18);
  ["blinkP", "blinkN", "smileP", "smileN", "mouthP", "mouthN"].forEach((name, i) => geometry.setAttribute(name, new THREE.InterleavedBufferAttribute(targets, 3, i * 3)));
  const bones = Array.from({ length: meta.jointCount }, () => new THREE.Matrix4());
  const texture = await new THREE.TextureLoader().loadAsync(base + ".jpg");
  texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { bones: { value: bones }, face: { value: new THREE.Vector3() }, map: { value: texture } },
    vertexShader: `attribute vec4 jointIds, jointWeights;
      attribute vec3 blinkP, blinkN, smileP, smileN, mouthP, mouthN;
      uniform mat4 bones[28]; uniform vec3 face; varying vec2 tex; varying vec3 norm;
      void main(){mat4 skin = bones[int(jointIds.x)]*jointWeights.x + bones[int(jointIds.y)]*jointWeights.y + bones[int(jointIds.z)]*jointWeights.z + bones[int(jointIds.w)]*jointWeights.w;
      norm = mat3(modelMatrix)*mat3(skin)*(normal+face.x*blinkN+face.y*smileN+face.z*mouthN);
      tex=uv; gl_Position=projectionMatrix*modelViewMatrix*skin*vec4(position+face.x*blinkP+face.y*smileP+face.z*mouthP,1.);}`,
    fragmentShader: `uniform sampler2D map; varying vec2 tex; varying vec3 norm;
      void main(){vec4 c=texture2D(map,tex); float light=.72+.28*max(dot(normalize(norm),normalize(vec3(-.4,1.,.8))),0.); gl_FragColor=vec4(c.rgb*light,c.a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material); mesh.rotation.y = Math.PI;
  mesh.frustumCulled = false;
  const clips = Object.fromEntries(Object.entries(meta.clips).map(([name, clip]) => [name, { ...clip, data: new Float32Array(motion, clip.offset, clip.frames * meta.jointCount * 16) }]));
  const settings = { blink: true, smile: 0, mouth: 0, idle: "auto" };
  const capabilities = { blink: !!meta.morphTargets?.[0], smile: !!meta.morphTargets?.[1], mouth: !!meta.morphTargets?.[2], idles: Object.keys(clips).filter(name => name.startsWith("idle") || name === "dance") };
  let previous, clock = 0, state = "idle";
  return {
    mesh, settings, capabilities,
    animate(time, speed) {
      const dt = previous === undefined ? 0 : Math.max(0, Math.min(.1, (time - previous) / 1000)); previous = time; clock += dt;
      let name = speed > 2.7 ? "running" : speed > .05 ? "walking" : null;
      if (!name && settings.idle !== "auto" && settings.idle !== "still") name = settings.idle;
      if (!name && settings.idle === "auto") {
        const first = clips.idle_03, second = clips.idle_02;
        if (first) name = second && clock % (first.duration + second.duration) >= first.duration ? "idle_02" : "idle_03";
      }
      state = name || "still";
      const clip = clips[name], stride = meta.jointCount * 16;
      const rate = speed > .05 ? Math.max(.35, Math.min(1.3, speed / (name === "running" ? 3.6 : 1.8))) : 1;
      const frame = clip ? ((clock * rate) % clip.duration) / clip.duration * (clip.frames - 1) : 0;
      const a = Math.floor(frame), b = clip ? Math.min(clip.frames - 1, a + 1) : 0, mix = 1 - Math.exp(-dt * 18);
      for (let joint = 0; joint < bones.length; joint++) for (let i = 0; i < 16; i++) {
        const index = joint * 16 + i;
        const target = clip ? THREE.MathUtils.lerp(clip.data[a * stride + index], clip.data[b * stride + index], frame - a) : (i % 5 === 0 ? 1 : 0);
        bones[joint].elements[i] += (target - bones[joint].elements[i]) * mix;
      }
      const blink = settings.blink ? Math.max(0, 1 - Math.abs((clock % 3.6) - .18) / .16) : 0;
      material.uniforms.face.value.set(blink, settings.smile, settings.mouth);
      mesh.userData.motion = state; mesh.userData.blink = blink;
    },
  };
}
