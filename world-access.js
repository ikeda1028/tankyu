(function (root) {
  "use strict";
  const radius = 100;
  const maxAge = 60000;
  function requiresLocation() {
    return root.WAKUWAKU_CONFIG?.worldAccess?.requireLocation !== false;
  }
  function assessWorld(target, fix, now = Date.now()) {
    return requiresLocation() ? assess(target, fix, now) : { allowed: true, reason: "unrestricted" };
  }
  function position(value) {
    if (!value || value.lat === null || value.lng === null || value.lat === "" || value.lng === "") return null;
    const lat = Number(value.lat), lng = Number(value.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  }
  function assess(target, fix, now = Date.now()) {
    const entrance = position(target);
    if (!entrance) return { allowed: false, reason: "entrance" };
    const current = position({ lat: fix?.coords?.latitude, lng: fix?.coords?.longitude });
    if (!current || !Number.isFinite(fix?.timestamp) || now - fix.timestamp > maxAge || fix.timestamp > now + 5000) return { allowed: false, reason: "location" };
    const accuracy = fix.coords.accuracy;
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 50) return { allowed: false, reason: "accuracy" };
    const rad = Math.PI / 180;
    const h = Math.sin((current.lat - entrance.lat) * rad / 2) ** 2 + Math.cos(current.lat * rad) * Math.cos(entrance.lat * rad) * Math.sin((current.lng - entrance.lng) * rad / 2) ** 2;
    const distance = 12742000 * Math.asin(Math.sqrt(Math.min(1, h)));
    return { allowed: distance <= radius, reason: distance <= radius ? "near" : "far", distance };
  }
  function message(result, kids = false) {
    if (result.reason === "entrance") return kids ? "いりぐちの ばしょを じゅんびちゅうです。" : "入口の位置が未設定です。管理者による設定をお待ちください。";
    if (result.reason === "accuracy") return kids ? "いまいる ばしょが はっきりしません。あんぜんな ところで もういちど ためしてね。" : "現在地の精度が不足しています。安全な場所で再確認してください。";
    if (result.reason === "far") return kids ? `ここから やく${Math.round(result.distance)}m。いりぐちから ${radius}mいないで はいれるよ。` : `入口まで約${Math.round(result.distance)}m。${radius}m以内で入れます。`;
    return kids ? `このせかいは げんちで はいれるよ。いりぐちから ${radius}mいないで いまいる ばしょを たしかめてね。` : `このワールドは現地限定です。入口から${radius}m以内で現在地を確認すると入れます。`;
  }
  function locate() {
    return new Promise((resolve, reject) => {
      if (!root.navigator?.geolocation) return reject(new Error("現在地を取得できません。HTTPSの公開版と端末の位置情報設定を確認してください。"));
      root.navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
    });
  }
  root.WorldAccess = { radius, maxAge, position, assess, assessWorld, requiresLocation, message, locate };
})(globalThis);
