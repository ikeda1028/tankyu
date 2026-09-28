(() => {
  const button = document.getElementById("map-qr-camera");
  const input = document.getElementById("map-qr-file");
  button.onclick = () => input.click();
  let decoder;
  input.onchange = async () => {
    const file = input.files[0]; input.value = "";
    if (!file) return;
    button.disabled = true;
    let objectUrl;
    try {
      if (file.size > 25 * 1024 * 1024) throw Error("25MB以下の写真を選んでください");
      if (!decoder) decoder = new Promise((resolve, reject) => {
        const script = document.createElement("script"); script.src = "assets/vendor/jsQR.js";
        script.onload = resolve; script.onerror = () => { decoder = null; reject(Error("QR読み取りを準備できませんでした")); }; document.head.append(script);
      });
      await decoder;
      const image = new Image(); objectUrl = URL.createObjectURL(file); image.src = objectUrl; await image.decode();
      const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
      const ctx = canvas.getContext("2d"); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(pixels.data, pixels.width, pixels.height);
      if (!code) throw Error("QRが見つかりません。全体が鮮明に写るよう撮影してください");
      const url = new URL(code.data);
      if (!/^https?:$/.test(url.protocol) || !/\/visit(?:\.html)?$/.test(url.pathname) || !/^#[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.[A-Za-z0-9_-]{43}$/.test(url.hash)) throw Error("訪問ポイント用のQRではありません");
      location.href = `visit.html${url.hash}`;
    } catch (error) { alert(error.message || "写真を読み取れませんでした"); }
    finally { if (objectUrl) URL.revokeObjectURL(objectUrl); button.disabled = false; }
  };
})();
