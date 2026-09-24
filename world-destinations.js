(function (root) {
  function hostedUrl(source) {
    try {
      const url = new URL(source, "https://tankyu-five.vercel.app/");
      if (!["https:", "http:"].includes(url.protocol)) return "";
      return /\/Katsuren_Future_Castle\.glb$/i.test(url.pathname)
        ? "https://katsuren-quest-visit.luketesla4.chatgpt.site/" : "";
    } catch { return ""; }
  }
  root.WorldDestinations = { hostedUrl };
})(window);
