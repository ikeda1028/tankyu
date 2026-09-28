const $ = (selector) => document.querySelector(selector);
const config = window.WAKUWAKU_CONFIG?.firebase;
let user, pending, busy = false;
let newestId;

function parseQR(value) {
  const url = new URL(value, location.href);
  if (!["http:", "https:"].includes(url.protocol) || !/\/visit(?:\.html)?$/.test(url.pathname)) throw new Error("訪問ポイント用のQRではありません");
  const match = /^#([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})\.([A-Za-z0-9_-]{43})$/.exec(url.hash);
  if (!match) throw new Error("QRコードの内容を確認してください");
  return { id: match[1], token: match[2] };
}
function captureQR() {
  if (!location.hash) return;
  try { pending = parseQR(location.href); $("#status").textContent = ""; }
  catch (error) { pending = null; $("#status").textContent = error.message; }
  history.replaceState(null, "", location.pathname);
  updateControls();
}
function updateControls() {
  $("#claim-panel").hidden = !pending;
  $("#claim").disabled = busy || !user || !pending;
  $("#refresh").disabled = busy || !user;
  $("#login").hidden = Boolean(user);
  $("#login").disabled = busy;
  $("#create button").disabled = busy;
  $("#qr-input button").disabled = busy;
  for (const input of document.querySelectorAll('.photo-actions input')) input.disabled = busy;
  for (const button of $("#stations").querySelectorAll("button")) button.disabled = busy;
}
async function request(action, body) {
  if (!user) throw new Error("Googleでログインしてください");
  const token = await user.getIdToken();
  const response = await fetch(`/api/visit-points${action ? `?action=${encodeURIComponent(action)}` : ""}`, {
    method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => { throw new Error("ポイントAPIが利用できません。公開設定を確認してください"); });
  if (!response.ok) throw new Error(data.error || "ポイントを確認できませんでした");
  return data;
}
async function run(action) {
  if (busy) return;
  busy = true; $("#status").textContent = "確認中…"; updateControls();
  try { await action(); $("#status").textContent = ""; }
  catch (error) { $("#status").textContent = error.name === "TimeoutError" ? "通信を確認できませんでした。再試行しても二重加算にはなりません" : error.message; }
  finally { busy = false; updateControls(); }
}
function renderBalance(data) {
  $("#balance").textContent = data.total.toLocaleString("ja-JP");
  $("#admin").hidden = !data.admin;
  $("#collection-count").textContent = `${data.history.length}か所`;
  $("#history-note").textContent = data.history.length ? "訪れた場所" : "まだ訪問コレクションはありません";
  $("#history").replaceChildren();
  for (const entry of data.history) {
    const li = document.createElement("li"), title = document.createElement("span"), date = document.createElement("small"), points = document.createElement("strong");
    title.textContent = entry.title; date.textContent = entry.at ? new Date(entry.at).toLocaleString("ja-JP") : "";
    const stamp = document.createElement("span");
    stamp.className = "visit-stamp"; stamp.textContent = "✓"; stamp.setAttribute("aria-label", "訪問済み");
    li.append(stamp);
    if (entry.id === newestId) { li.className = "new-visit"; const badge = document.createElement("small"); badge.textContent = "NEW · コレクションに追加"; title.prepend(badge); }
    title.append(date); points.textContent = `+${entry.points} pt`; li.append(title, points); $("#history").append(li);
  }
}
async function refresh() {
  const data = await request(); renderBalance(data);
  if (data.admin) await loadStations();
}
async function loadStations() {
  const data = await request("stations"); $("#stations").replaceChildren();
  for (const station of data.stations) {
    const li = document.createElement("li"), name = document.createElement("span"), rotate = document.createElement("button"), disable = document.createElement("button");
    name.textContent = `${station.title}（${station.enabled ? "受付中" : "停止中"}）`;
    rotate.textContent = "再発行"; disable.textContent = "停止";
    rotate.onclick = () => { if (confirm("以前の印刷QRは使えなくなります。再発行しますか？")) run(async () => { showIssued(await request("", { action: "rotate", id: station.id })); await loadStations(); }); };
    disable.onclick = () => run(async () => { await request("", { action: "disable", id: station.id }); await loadStations(); });
    li.append(name, rotate); if (station.enabled) li.append(disable); $("#stations").append(li);
  }
}
function showIssued(data) {
  $("#issued").hidden = false; $("#issued-title").textContent = data.title;
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`;
  $("#qr-image").src = imageUrl; $("#download").href = imageUrl; $("#issued-url").textContent = data.url;
  $("#issued").scrollIntoView({ behavior: "smooth", block: "center" });
}
$("#login").onclick = () => run(async () => {
  user = await window.WakuwakuFirebase.signInGoogle(config);
  $("#identity").textContent = user.email; await refresh();
});
$("#refresh").onclick = () => run(refresh);
$("#claim").onclick = () => run(async () => {
  const claimedId = pending.id;
  const data = await request("", { action: "claim", ...pending });
  newestId = data.duplicate ? null : claimedId;
  $("#receipt").hidden = false; $("#receipt-title").textContent = data.title;
  $("#award").textContent = data.duplicate ? "獲得済みです" : `+${data.added} pt`;
  $("#receipt-total").textContent = `合計 ${data.total.toLocaleString("ja-JP")} pt`;
  $("#balance").textContent = data.total.toLocaleString("ja-JP");
  pending = null; $("#receipt").scrollIntoView({ behavior: "smooth", block: "center" });
  await refresh();
  if (newestId) $("#history").scrollIntoView({ behavior: "smooth", block: "center" });
});
async function readPhoto(file) {
  if (!file) return;
  await run(async () => {
    pending = null;
    if (file.size > 25 * 1024 * 1024) throw new Error("25MB以下の写真を選んでください");
    const url = URL.createObjectURL(file), image = new Image();
    try {
      image.src = url;
      await image.decode().catch(() => { throw new Error("写真を開けませんでした。JPEGまたはPNGでお試しください"); });
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: "attemptBoth" });
      if (!code) throw new Error("QRが見つかりませんでした。QR全体が大きく鮮明に写るよう撮影してください");
      pending = parseQR(code.data);
      $("#receipt").hidden = true;
    } finally { URL.revokeObjectURL(url); }
  });
  if (pending) $("#claim-panel").scrollIntoView({ behavior: "smooth", block: "center" });
}
for (const id of ["#qr-camera", "#qr-photo"]) $(id).onchange = async (event) => {
  const file = event.target.files[0]; event.target.value = ""; await readPhoto(file);
};
$("#create").onsubmit = (event) => {
  event.preventDefault(); run(async () => { showIssued(await request("", { action: "create", title: $("#station-title").value })); await loadStations(); });
};
$("#qr-input").onsubmit = (event) => {
  event.preventDefault();
  try { pending = parseQR($("#qr-url").value); $("#qr-url").value = ""; $("#receipt").hidden = true; $("#status").textContent = ""; }
  catch (error) { pending = null; $("#status").textContent = error.message; }
  updateControls();
};
$("#print").onclick = () => window.print();
addEventListener("hashchange", captureQR);
await run(async () => {
  user = await window.WakuwakuFirebase.getAuthenticatedUser(config);
  if (user) { $("#identity").textContent = user.email; await refresh(); }
});
captureQR();
