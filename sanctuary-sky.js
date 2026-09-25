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
  function resolve(params, base) {
    if (matches(params, base)) return {
      id: 'hongo', image, rotation: -Math.PI / 2,
      label: '本郷 · 上空約500mのイメージ',
      hint: '本郷の上空約500mをイメージした空間。東京の街並み・富士山・山並み・入道雲を見渡せます。ドラッグで見回せます。',
      skyline: '富士山と空を見る', city: '東京を見下ろす',
    };
    let model;
    try { model = new URL(params.get('src') || '', base).pathname; } catch { return null; }
    // A shared model alone is insufficient to identify this separate Shibuya world.
    if (!/\/MANABI_Shibuya_3F\.glb$/i.test(model) || !/^MANABI\s*渋谷\s*3F(?:ワールド)?$/i.test((params.get('title') || '').trim())) return null;
    return {
      id: 'shibuya', image: 'assets/shibuya-40f-sky.jpg', rotation: -Math.PI / 2,
      label: '渋谷 · 40階相当の眺め',
      hint: '渋谷駅の北西側・40階相当からの眺めを再構成。Googleの入る渋谷ストリームなどを望む創作パノラマです。実写・測量による再現ではありません。',
      skyline: '渋谷の高層ビルを見る', city: '渋谷の街を見下ろす',
    };
  }
  root.SanctuarySky = Object.freeze({ image, matches, resolve });
})(globalThis);
