const entries = [["coral","珊瑚の精霊"],["miu","美海"],["shisa","シーサー"],["sora","星の旅人"],["rin","リン"],["professor","ハカセ"],["robot","ピコ"],["explorer","ワクワク冒険家"],["manta","海の精"],["sprite","キジムナー"]];
const params = new URLSearchParams(location.search), api = window.WakuwakuFirebase, config = window.WAKUWAKU_CONFIG.firebase;
const $ = id => document.getElementById(id);
let selected = "coral", user, busy = false;
let destination = new URL("/", location.href);
try {
  const candidate = new URL(params.get("returnTo"), location.href);
  if ([location.origin, "https://katsuren-quest-visit.luketesla4.chatgpt.site", "https://fudo-mirai-do.luketesla4.chatgpt.site"].includes(candidate.origin) && ["/", "/index.html", "/ancient.html", "/model-world.html"].includes(candidate.pathname)) destination = candidate;
} catch {}
function choose(id) {
  if (!entries.some(([key]) => key === id)) return;
  selected = id;
  for (const button of $("choices").children) button.setAttribute("aria-pressed", String(button.dataset.id === id));
}
for (const [id, name] of entries) {
  const button = document.createElement("button"); button.dataset.id = id; button.type = "button";
  const image = new Image(); image.src = `assets/avatar-presets/${id}${["rin","robot","sprite"].includes(id) ? ".png" : "-preview.jpg"}`; image.alt = "";
  const label = document.createElement("span"); label.textContent = name; button.append(image, label); button.onclick = () => choose(id); $("choices").append(button);
}
try { choose(JSON.parse(localStorage.getItem("wakuwaku-quest-state-v3"))?.member?.avatar?.presetId || "coral"); } catch { choose("coral"); }
function enter() {
  try {
    const state = JSON.parse(localStorage.getItem("wakuwaku-quest-state-v3")) || {};
    state.member ||= {}; state.member.avatar = { ...state.member.avatar, presetId: selected };
    localStorage.setItem("wakuwaku-quest-state-v3", JSON.stringify(state));
  } catch { $("status").textContent = "端末への保存ができません。選択は今回のワールドにのみ渡します。"; }
  if (destination.origin === location.origin) destination.searchParams.set("avatar", selected);
  else { const hash = new URLSearchParams(destination.hash.slice(1)); hash.set("avatar", selected); destination.hash = hash.toString(); }
  location.assign(destination.href);
}
async function load() {
  $("save").disabled = true;
  try {
    user = await api.getAuthenticatedUser(config);
    if (user?.emailVerified) {
      const saved = await api.worldAvatar(config); if (saved?.presetId) choose(saved.presetId);
      $("account").textContent = user.email;
      $("status").textContent = "アカウントに保存すると、同じGoogleアカウントで別の端末でも使えます。";
      $("save").disabled = false;
    } else { user = null; $("account").textContent = "未ログイン"; $("status").textContent = "端末間の引き継ぎにはログインが必要です。"; }
  } catch { $("status").textContent = "保存データを読み込めませんでした。ログインして再試行してください。"; user = null; }
  // An explicit incoming selection is a draft, never an automatic cloud write.
  if (params.has("avatar")) choose(params.get("avatar"));
  $("signin").hidden = Boolean(user); $("local").hidden = Boolean(user);
}
$("signin").onclick = async () => { try { await api.signInGoogle(config); await load(); } catch { $("status").textContent = "ログインできませんでした。もう一度お試しください。"; } };
$("local").onclick = enter;
$("save").onclick = async () => {
  if (busy || !user) return; busy = true; $("save").disabled = true;
  try { await api.worldAvatar(config, selected); enter(); }
  catch { $("status").textContent = "保存できませんでした。選択は残っています。もう一度保存してください。"; }
  finally { busy = false; $("save").disabled = false; }
};
await load();
