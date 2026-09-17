(() => {
  let viewerReady;
  function normalize(value, base) {
    const raw = String(value?.modelUrl || "").trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, `${base}/`);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== "https:" || url.username || url.password
        || !/\.glb$/i.test(decodeURIComponent(url.pathname))
        || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
        || host.includes(":") || host.endsWith(".local")) return null;
      return { modelUrl: url.href, title: String(value.title || "メンター").slice(0, 40) };
    } catch { return null; }
  }

  function loadViewer() {
    if (!viewerReady) {
      // Use the same Three.js-based viewer as the existing 3D world screen.
      viewerReady = import("https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js")
        .then(() => customElements.whenDefined("model-viewer"))
        .catch((error) => { viewerReady = null; throw error; });
    }
    return viewerReady;
  }

  function mount(container, model, name, onReady = () => {}) {
    container.replaceChildren();
    if (!model) { onReady(false); return; }
    const viewer = document.createElement("model-viewer");
    const status = document.createElement("p");
    viewer.setAttribute("alt", `${name || "メンター"}の3Dモデル`);
    for (const attr of ["camera-controls", "autoplay"]) viewer.setAttribute(attr, "");
    viewer.setAttribute("loading", "eager");
    viewer.setAttribute("interaction-prompt", "none");
    viewer.setAttribute("touch-action", "pan-y");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("shadow-intensity", "1");
    status.setAttribute("role", "status");
    status.textContent = "3Dを読み込み中…";
    container.append(viewer, status);
    onReady(false);
    const current = () => container.contains(viewer);
    const failed = () => {
      if (!current()) return;
      status.textContent = "3Dを読み込めません。GLBの公開URLと配信元のアクセス制限を確認してください。";
      onReady(false);
    };
    const timer = setTimeout(failed, 30000);
    viewer.addEventListener("load", () => {
      clearTimeout(timer);
      if (!current()) return;
      status.textContent = "3D表示を確認しました";
      onReady(true);
    });
    viewer.addEventListener("error", () => { clearTimeout(timer); failed(); });
    loadViewer().then(() => {
      if (current()) viewer.setAttribute("src", model.modelUrl);
      else clearTimeout(timer);
    }).catch(() => { clearTimeout(timer); failed(); });
  }
  window.MentorModels = { normalize, mount };
})();
