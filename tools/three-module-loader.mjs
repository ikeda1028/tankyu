export function resolve(specifier, context, nextResolve) {
  if (specifier === "three") return { url: new URL("../assets/vendor/three/three.module.js", import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
}
