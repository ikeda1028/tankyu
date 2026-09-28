import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export const POINTS = 10;
export function fail(status, message) { return Object.assign(new Error(message), { status }); }
export function hashToken(token) { return createHash("sha256").update(token).digest("hex"); }
export function validStationId(id) { return typeof id === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id); }
export function issueSecret() { return { id: randomUUID(), token: randomBytes(32).toString("base64url") }; }
export function tokenMatches(token, hash) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token) || !/^[a-f0-9]{64}$/.test(hash || "")) return false;
  return timingSafeEqual(Buffer.from(hashToken(token), "hex"), Buffer.from(hash, "hex"));
}
export function isAdmin(user, emails) {
  return user.email_verified === true && emails.includes(String(user.email || "").toLowerCase());
}
export async function claimPoints(db, user, input, timestamp) {
  const { id, token } = input;
  if (!validStationId(id) || typeof token !== "string" || token.length !== 43) throw fail(400, "QRコードが正しくありません");
  const stationRef = db.collection("visitStations").doc(id);
  const accountRef = db.collection("visitAccounts").doc(user.uid);
  const claimRef = accountRef.collection("claims").doc(id);
  return db.runTransaction(async (transaction) => {
    const [stationDoc, claimDoc, accountDoc] = await transaction.getAll(stationRef, claimRef, accountRef);
    const station = stationDoc.data();
    if (!stationDoc.exists || station.enabled !== true || !tokenMatches(token, station.tokenHash)) throw fail(404, "このQRは無効か、受付を終了しています");
    const total = accountDoc.exists ? accountDoc.data().total : 0;
    if (!Number.isSafeInteger(total) || total < 0 || total > Number.MAX_SAFE_INTEGER - POINTS) throw fail(500, "ポイント残高を確認できませんでした");
    if (claimDoc.exists) return { added: 0, total, duplicate: true, title: claimDoc.data().title };
    transaction.create(claimRef, { stationId: id, title: station.title, points: POINTS, claimedAt: timestamp() });
    transaction.set(accountRef, { total: total + POINTS, updatedAt: timestamp() }, { merge: true });
    return { added: POINTS, total: total + POINTS, duplicate: false, title: station.title };
  });
}

export function createVisitHandler({ services, makeQr, adminEmails, publicOrigin }) {
  return async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (!["GET", "POST"].includes(request.method)) { response.setHeader("Allow", "GET, POST"); return response.status(405).json({ error: "許可されていない操作です" }); }
    try {
      const bearer = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || "");
      if (!bearer) throw fail(401, "Googleアカウントでログインしてください");
      const { db, auth, timestamp } = services();
      let user;
      try { user = await auth.verifyIdToken(bearer[1], true); }
      catch { throw fail(401, "ログインの有効期限が切れました。再度ログインしてください"); }
      if (!user.uid || user.email_verified !== true) throw fail(403, "本人確認済みのアカウントが必要です");
      const admin = isAdmin(user, adminEmails);
      if (request.method === "GET") {
        if (request.query?.action === "stations") {
          if (!admin) throw fail(403, "管理者のみ操作できます");
          const snapshot = await db.collection("visitStations").orderBy("createdAt", "desc").limit(100).get();
          return response.status(200).json({ stations: snapshot.docs.map((doc) => ({ id: doc.id, title: doc.data().title, enabled: doc.data().enabled })) });
        }
        const ref = db.collection("visitAccounts").doc(user.uid);
        const account = await ref.get();
        const history = await ref.collection("claims").orderBy("claimedAt", "desc").get();
        return response.status(200).json({ total: account.data()?.total ?? 0, admin, history: history.docs.map((doc) => ({ id: doc.id, title: doc.data().title, points: doc.data().points, at: doc.data().claimedAt?.toDate().toISOString() || null })) });
      }
      const input = request.body;
      if (!input || typeof input !== "object" || Array.isArray(input)) throw fail(400, "入力が正しくありません");
      if (input.action === "claim") return response.status(200).json(await claimPoints(db, user, input, timestamp));
      if (!admin) throw fail(403, "管理者のみ操作できます");
      if (input.action === "disable") {
        if (!validStationId(input.id)) throw fail(400, "QRのIDが正しくありません");
        const ref = db.collection("visitStations").doc(input.id);
        if (!(await ref.get()).exists) throw fail(404, "QRが見つかりません");
        await ref.update({ enabled: false });
        return response.status(200).json({ disabled: true });
      }
      if (!["create", "rotate"].includes(input.action)) throw fail(400, "操作を確認してください");
      const origin = new URL(publicOrigin);
      if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/") throw fail(503, "公開URLの設定が必要です");
      const secret = issueSecret();
      const id = input.action === "rotate" ? input.id : secret.id;
      if (!validStationId(id)) throw fail(400, "QRのIDが正しくありません");
      const ref = db.collection("visitStations").doc(id);
      let title = String(input.title || "").trim();
      if (input.action === "create" && (!title || title.length > 80)) throw fail(400, "設置場所を80文字以内で入力してください");
      const url = new URL("/visit.html", origin);
      url.hash = `${id}.${secret.token}`;
      const svg = await makeQr(url.href);
      if (input.action === "rotate") {
        await db.runTransaction(async (tx) => {
          const doc = await tx.get(ref);
          if (!doc.exists) throw fail(404, "QRが見つかりません");
          title = doc.data().title;
          tx.update(ref, { tokenHash: hashToken(secret.token), enabled: true, updatedAt: timestamp() });
        });
      } else await ref.create({ title, enabled: true, tokenHash: hashToken(secret.token), createdAt: timestamp(), createdBy: user.uid });
      return response.status(200).json({ id, title, url: url.href, svg, points: POINTS });
    } catch (error) {
      // Never return credentials, SDK diagnostics, or incoming QR tokens.
      return response.status(error.status || 503).json({ error: error.status ? error.message : "ポイントサーバーに接続できませんでした。時間をおいて再試行してください" });
    }
  };
}
