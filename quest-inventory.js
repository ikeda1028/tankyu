(function () {
  let records = [], grade = "", backend = null, stop = null, generation = 0;
  let status = "よみこみちゅう…", activeItem = null, busy = false, highlight = "";
  const model = document.querySelector("#world-model");
  const params = new URLSearchParams(location.search);
  const source = params.get("src") || "";
  const world = source ? QuestItems.worldKey(source) : "";
  const title = params.get("title") || "3Dワールド";
  const dialog = document.createElement("dialog");
  dialog.className = "quest-dialog";
  dialog.setAttribute("aria-label", "もちものとクエスト");
  dialog.innerHTML = '<button class="quest-close" type="button" aria-label="とじる" title="とじる"><img src="assets/close.svg" alt="" width="24" height="24"></button><div class="quest-content"></div>';
  document.body.append(dialog);
  const content = dialog.querySelector(".quest-content");
  dialog.querySelector(".quest-close").onclick = () => dialog.close();
  dialog.addEventListener("close", () => { activeItem = null; highlight = ""; });
  function element(tag, text, className) {
    const el = document.createElement(tag);
    if (text != null) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function art(item, size = 48) {
    const img = document.createElement("img");
    img.src = `assets/quest-${item.id}.svg`;
    img.alt = item.name;
    img.width = img.height = size;
    return img;
  }
  function isKids() { return /^(年|未就学|小[1-4])/.test(grade) || params.get("kids") === "1"; }
  function label(item) { return isKids() ? item.kidsStat : item.stat; }
  function inventory() {
    content.replaceChildren();
    const added = records.find((entry) => entry.key === highlight);
    if (added) {
      const item = QuestItems.definitions.find((entry) => entry.id === added.itemId);
      const reward = element("div", null, "quest-reward");
      reward.append(art(item, 144), element("h2", "てにいれた！"), element("p", `${item.name} / ${label(item)} +${item.value}`));
      content.append(reward);
    }
    content.append(element("h2", `もちもの ${records.length}こ`));
    const scores = element("div", null, "quest-totals");
    const totals = QuestItems.totals(records);
    QuestItems.definitions.forEach((item) => scores.append(element("span", `${label(item)} ${totals[item.id]}`)));
    content.append(scores);
    content.append(element("p", status, "quest-status"));
    const table = element("table", null, "quest-table");
    const header = element("tr");
    [isKids() ? "あいてむ" : "アイテム", "みつけたばしょ", "ちから"].forEach((text) => header.append(element("th", text)));
    const head = element("thead"); head.append(header); table.append(head);
    const body = element("tbody");
    [...records].reverse().forEach((record) => {
      const item = QuestItems.definitions.find((entry) => entry.id === record.itemId);
      if (!item) return;
      const row = element("tr", null, record.key === highlight ? "quest-new" : "");
      const cell = element("td"); cell.append(art(item), element("span", item.name));
      if (record.key === highlight) cell.append(element("strong", isKids() ? "ふえた！ +1" : "NEW +1", "quest-new-label"));
      row.append(cell, element("td", record.worldTitle), element("td", `${label(item)} +${item.value}`));
      body.append(row);
    });
    table.append(body); content.append(table);
    if (!records.length) content.append(element("p", "まだ アイテムは ありません。"));
  }
  function openInventory() { activeItem = null; inventory(); if (!dialog.open) dialog.showModal(); }
  function updateButtons() {
    document.querySelectorAll("[data-quest-inventory]").forEach((button) => button.setAttribute("aria-label", `もちもの ${records.length}こ`));
    model?.querySelectorAll("[data-quest-item]").forEach((button) => {
      const owned = records.some((record) => record.key === `${world}::${button.dataset.questItem}`);
      button.classList.toggle("quest-owned", owned);
      button.setAttribute("aria-label", `${QuestItems.definitions.find((item) => item.id === button.dataset.questItem).name}${owned ? " / もっている" : ""}`);
    });
  }
  async function claim(item, answer) {
    if (!backend || busy || document.body.classList.contains("entry-locked")) return;
    const session = backend, epoch = generation;
    busy = true;
    const message = content.querySelector(".quest-answer-status");
    content.querySelectorAll(".quest-choice").forEach((button) => { button.disabled = true; });
    message.textContent = "せいかい！ ほぞんしています…";
    try {
      const result = await QuestItems.saveAward(session, world, title, item.id, grade, answer);
      if (epoch !== generation) return;
      records = result.records;
      highlight = result.added ? result.key : "";
      status = result.added ? "もちものに 1こ ふえました。ほぞんできました。" : "このアイテムは もう もっています。";
      updateButtons(); openInventory();
    } catch (error) {
      if (epoch === generation) {
        message.textContent = "ほぞんできませんでした。つうしんを たしかめて、もういちど えらんでね。";
        content.querySelectorAll(".quest-choice").forEach((button) => { button.disabled = false; });
      }
    } finally { busy = false; }
  }
  function openQuiz(item) {
    if (document.body.classList.contains("entry-locked")) return;
    if (records.some((record) => record.key === `${world}::${item.id}`)) { highlight = ""; openInventory(); return; }
    activeItem = item;
    content.replaceChildren(art(item, 96), element("h2", item.name), element("p", `${label(item)} +${item.value}`));
    const quiz = QuestItems.question(item.id, grade);
    if (!backend || !quiz) {
      content.append(element("p", backend ? "アカウントで がくねんを せっていしてね。" : status));
      const back = element("a", "ちずに もどる"); back.href = "/?return=map"; content.append(back);
    } else {
      content.append(element("p", isKids() ? "もんだい" : `${grade}のクエスト`, "quest-grade"), element("h3", quiz.text));
      const message = element("p", "", "quest-answer-status"); message.setAttribute("role", "status");
      quiz.choices.forEach((choice, index) => {
        const button = element("button", choice, "quest-choice");
        button.type = "button";
        button.onclick = () => {
          if (index !== quiz.answer) { message.textContent = quiz.hint; return; }
          claim(item, index);
        };
        content.append(button);
      });
      content.append(message);
    }
    if (!dialog.open) dialog.showModal();
  }
  function addHotspots() {
    if (!model?.loaded || !world || document.body.classList.contains("entry-locked")) return;
    model.querySelectorAll("[data-quest-item]").forEach((el) => el.remove());
    const dimensions = model.getDimensions(), center = model.getBoundingBoxCenter();
    QuestItems.definitions.forEach((item) => {
      const button = element("button", null, "quest-hotspot");
      button.type = "button"; button.slot = `hotspot-quest-${item.id}`;
      button.dataset.questItem = item.id;
      button.dataset.position = ["x", "y", "z"].map((axis, index) => `${center[axis] + dimensions[axis] * item.position[index]}m`).join(" ");
      button.dataset.normal = "0m 1m 1m";
      button.append(art(item, 48)); button.onclick = () => openQuiz(item);
      model.append(button);
    });
    updateButtons();
  }
  document.querySelectorAll("[data-quest-inventory]").forEach((button) => button.addEventListener("click", openInventory));
  if (model) {
    model.addEventListener("load", addHotspots);
    if (model.loaded) addHotspots();
    new MutationObserver(() => {
      if (document.body.classList.contains("entry-locked")) { dialog.close(); model.querySelectorAll("[data-quest-item]").forEach((button) => button.remove()); }
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  async function connect() {
    try {
      const connection = await connectFirebase(window.WAKUWAKU_CONFIG?.firebase);
      connection.auth.onAuthStateChanged(connection.authInstance, (user) => {
        const epoch = ++generation;
        stop?.(); stop = null; backend = null; records = []; grade = ""; highlight = "";
        status = "ちずで ログインしてから あそんでね。";
        if (dialog.open) { activeItem = null; inventory(); } updateButtons();
        if (!user?.emailVerified) return;
        status = "よみこみちゅう…";
        const ref = connection.firestore.doc(connection.db, "wakuwakuUsers", getFirebaseUserId({ auth: { email: user.email } }));
        stop = connection.firestore.onSnapshot(ref, { includeMetadataChanges: true }, (doc) => {
          if (epoch !== generation) return;
          if (doc.metadata.hasPendingWrites) return;
          const data = doc.data() || {};
          backend = doc.exists() && !doc.metadata.fromCache ? { ...connection, ref } : null;
          records = data.questInventory?.records || [];
          grade = (data.memberProfile?.member || data.snapshot?.member)?.grade || "";
          status = backend ? "クラウドに つながっています。" : "つうしんを たしかめてね。";
          updateButtons();
          if (dialog.open && !busy) { if (activeItem) openQuiz(activeItem); else inventory(); }
        }, () => {
          if (epoch !== generation) return;
          backend = null; status = "よみこめませんでした。つうしんを たしかめてね。";
          if (dialog.open) inventory();
        });
      });
    } catch { status = "クラウドに つながりません。ちずで ログインを たしかめてね。"; if (dialog.open) inventory(); }
  }
  connect();
})();
