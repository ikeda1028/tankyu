/* The Hongo sanctuary shares its GLB with other places: scope scenery to its entrance. */
(function (root) {
  const image = 'assets/hongo-tokyo-sky.jpg';
  function matches(params, base) {
    const src = params.get('src') || '';
    let model;
    try { model = new URL(src, base).pathname; } catch { return false; }
    if (!/\/MANABI_Shibuya_3F\.glb$/i.test(model)) return false;
    const lat = Number(params.get('lat')), lng = Number(params.get('lng'));
    const atHongo = params.has('lat') && params.has('lng') && Math.abs(lat - 35.706795) < .001 && Math.abs(lng - 139.762661) < .001;
    return atHongo || /^子(?:供|ども)の探究の聖地$/.test((params.get('title') || '').trim());
  }
  root.SanctuarySky = Object.freeze({ image, matches });
})(globalThis);
