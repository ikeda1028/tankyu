(function (root) {
  const definitions = [
    { id: "lens", name: "はっけんのレンズ", stat: "観察力", kidsStat: "みつけるちから", value: 5, color: "#14866f", position: [-0.28, -0.1, 0.4] },
    { id: "scroll", name: "ときのまきもの", stat: "歴史理解", kidsStat: "むかしをしるちから", value: 5, color: "#b75c37", position: [0.26, 0.05, 0.3] },
    { id: "prism", name: "みらいのかけら", stat: "発想力", kidsStat: "かんがえるちから", value: 5, color: "#446db6", position: [0, 0.34, 0.05] },
  ];
  // Each row contains a question, three choices, the correct choice and a retry hint.
  const questions = {
    lens: [
      ["かたちを しりたいときは？", ["めを とじる", "よく みくらべる", "すぐ わすれる"], 1, "どこが おなじで、どこが ちがうかな？"],
      ["たてものの ちがいを みつけるには？", ["いろや かたちを みくらべる", "なまえだけで きめる", "みないで あてる"], 0, "じぶんの めで たしかめよう。"],
      ["建物を比べる記録として、いちばん確かめやすいものは？", ["なんとなく大きい", "きっと古い", "同じ場所から撮った写真と大きさ"], 2, "ほかの人が比べ直せる記録を選ぼう。"],
      ["建物の変化を調べるとき、条件をそろえる理由は？", ["必ず同じ結果にするため", "比べたい変化を見分けるため", "記録を減らすため"], 1, "時間以外の違いが結果に混ざらないようにします。"],
      ["修復が建物の耐久性に与える影響を調べるには？", ["最もきれいな一例だけ選ぶ", "印象だけで判断する", "材質や環境条件を記録し、修復前後を比較する"], 2, "修復以外の要因も区別できる調査を考えよう。"],
    ],
    scroll: [
      ["むかしの ことを しりたいときは？", ["しっている ひとに きく", "なんでも きめつける", "きかない"], 0, "むかしの おはなしを きいてみよう。"],
      ["むかしの たてものを しらべるには？", ["いまの いろだけで きめる", "おもいつきを ほんとうにする", "ふるい しゃしんや おはなしを さがす"], 2, "むかしの てがかりは どこにあるかな？"],
      ["昔の建物の使われ方を調べる手がかりは？", ["今の天気だけ", "古い地図や記録", "自分の好みだけ"], 1, "その時代に残された資料に注目しよう。"],
      ["同じ出来事について資料の説明が違うときは？", ["作られた時期や書き手の立場を比べる", "好きな説明だけ選ぶ", "全部捨てる"], 0, "誰が、いつ、何のために残した資料でしょう？"],
      ["交易と城の発展の関係を検証するには？", ["城の大きさだけで結論を出す", "年代の合う出土品・交易記録・周辺地域を照合する", "伝説をそのまま証拠とする"], 1, "独立した複数の資料で仮説を確かめよう。"],
    ],
    prism: [
      ["みんなが つかいやすくするには？", ["じぶんだけで きめる", "こまったことを かくす", "みんなの おはなしを きく"], 2, "どんなことに こまっているかな？"],
      ["あたらしい あそびばを かんがえるなら？", ["すぐ ぜんぶ つくる", "つかう ひとの こえを きく", "ほかの ひとは きにしない"], 1, "だれが あそぶ ばしょかな？"],
      ["建物をもっと使いやすくする最初の一歩は？", ["使う人の困りごとを調べる", "全部こわす", "値段だけで決める"], 0, "誰のどんな問題を解くのか考えよう。"],
      ["改善案の効果を確かめる方法は？", ["完成まで誰にも見せない", "小さな試作品を使ってもらい意見を集める", "思いついた時点で成功とする"], 1, "小さく試すと何がわかるでしょう？"],
      ["文化財の保全と活用を両立する案を試すには？", ["来場者数だけを最大にする", "保全への影響を調べない", "保全・利用者の指標を定め、小規模に試して改善する"], 2, "成功の基準を複数設定して検証しよう。"],
    ],
  };
  function band(grade) {
    if (/^(年少|年中|年長|未就学)$/.test(grade)) return 0;
    if (/^小[1-2]$/.test(grade)) return 1;
    if (/^小[3-6]$/.test(grade)) return 2;
    if (/^中[1-3]$/.test(grade)) return 3;
    if (/^(高[1-3]|大学|社会人|その他)$/.test(grade)) return 4;
    return null;
  }
  function question(id, grade) {
    const castleItem = definitions.find((item) => item.id === id && item.castle);
    if (castleItem) return window.CastleQuests.question(castleItem, grade);
    const level = band(grade);
    if (level === null || !questions[id]) return null;
    // Kids through grade 4 use the hiragana question set.
    const row = questions[id][/^小[3-4]$/.test(grade) ? 1 : level];
    return { text: row[0], choices: row[1], answer: row[2], hint: row[3] };
  }
  function worldKey(src) {
    const url = new URL(src, "https://tankyu-five.vercel.app");
    const ownHost = ["tankyu-five.vercel.app", "localhost", "127.0.0.1"].includes(url.hostname);
    return `${ownHost ? "" : url.origin}${url.pathname}`; // Signed URL tokens and our host aliases must not duplicate rewards.
  }
  function award(records, world, title, id, grade, answer, now = Date.now()) {
    const item = definitions.find((entry) => entry.id === id);
    const quiz = question(id, grade);
    if (!item || !quiz || answer !== quiz.answer) throw new Error("もういちど かんがえてみよう。");
    const key = `${world}::${id}`;
    if (records.some((entry) => entry.key === key)) return { records, added: false, key };
    if (item.castle && !window.CastleQuests.unlocked(records, world, item)) throw new Error("まえの だんかいを さがしてね。");
    return { records: [...records, { key, world, worldTitle: title, itemId: id, grade, acquiredAt: now }], added: true, key };
  }
  function totals(records) {
    return Object.fromEntries(definitions.filter((item) => !item.castle).map((track) => [track.id, records.reduce((sum, record) => {
      const item = definitions.find((entry) => entry.id === record.itemId);
      return sum + (item && (item.track || item.id) === track.id ? item.value : 0);
    }, 0)]));
  }
  async function saveAward(session, world, title, id, grade, answer) {
    return session.firestore.runTransaction(session.db, async (transaction) => {
      const doc = await transaction.get(session.ref);
      const data = doc.data() || {};
      const latestGrade = (data.memberProfile?.member || data.snapshot?.member)?.grade || "";
      if (!doc.exists() || latestGrade !== grade) throw new Error("がくねんが かわりました。もういちど ひらいてね。");
      const result = award(data.questInventory?.records || [], world, title, id, latestGrade, answer);
      if (result.added) transaction.set(session.ref, { questInventory: { records: result.records, updatedAt: Date.now() } }, { merge: true });
      return result;
    });
  }
  root.QuestItems = { definitions, tracks: definitions.slice(), band, question, worldKey, award, totals, saveAward };
})(window);
