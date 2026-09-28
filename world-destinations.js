(function (root) {
  const oceanUrl = "https://ocean-expo-future-island.luketesla4.chatgpt.site/";
  function hostedUrl(source) {
    try {
      const url = new URL(source, "https://tankyu-five.vercel.app/");
      if (!["https:", "http:"].includes(url.protocol)) return "";
      if (url.origin === new URL(oceanUrl).origin && ["/", "/index.html"].includes(url.pathname)) return oceanUrl;
      return /\/Katsuren_Future_Castle\.glb$/i.test(url.pathname)
        ? "https://katsuren-quest-visit.luketesla4.chatgpt.site/" : "";
    } catch { return ""; }
  }
  const points = [{
    id: "ocean-expo-future-world", title: "海洋博公園・未来ワールド", index: 70,
    description: "海洋博公園の実際の立地を参考にした非公式の3D未来構想。やんばる、夜の自然、星空、環境学習、北部の食、離島の6エリアをアバターで巡ります。実際の開催イベントや施設計画ではありません。",
    impact: "海と森の未来を考える", locationName: "沖縄県本部町・海洋博公園",
    eventType: "permanent", tags: ["海", "自然", "沖縄", "3Dワールド"], keywords: ["海洋博", "美ら海", "やんばる", "未来"],
    position: {lat: 26.6908431, lng: 127.8757401}, color: "#087f89", publicReadOnly: true,
    sourceUrl: oceanUrl, sourceTitle: "海洋博公園・未来ワールド",
    model3d: {title: "海洋博公園・未来ワールド", modelUrl: oceanUrl, provider: "hosted-world", status: "saved"},
    character: {name: "海洋ナビ", role: "海と森の案内人", message: "海洋博公園の未来を探究しよう", symbol: "海", color: "#087f89"},
    questionPath: ["海と森にはどんなつながりがある？", "海を守るために何ができる？", "地域の食は自然とどうつながる？", "島どうしで何を共有できる？", "未来の公園で何を実現したい？"],
    boost: {joy: 4, distance: 4, reflection: 3}
  }];
  root.WorldDestinations = { hostedUrl, points };
})(window);
