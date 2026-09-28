import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import QRCode from "qrcode";
import { createVisitHandler, fail } from "./visit-core.js";

function services() {
  let app = getApps().find((entry) => entry.name === "visit-points");
  if (!app) {
    try {
      const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "null");
      if (!account?.project_id || !account?.client_email || !account?.private_key) throw new Error("missing");
      app = initializeApp({ credential: cert(account), projectId: account.project_id }, "visit-points");
    } catch { throw fail(503, "ポイント機能のサーバー設定が未完了です。管理者によるFirebase設定が必要です"); }
  }
  return { auth: getAuth(app), db: getFirestore(app), timestamp: () => FieldValue.serverTimestamp() };
}
export default createVisitHandler({
  services,
  makeQr: (url) => QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 4, width: 512 }),
  adminEmails: (process.env.ADMIN_EMAILS || "ikeda@manabinomichi.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean),
  publicOrigin: process.env.VISIT_PUBLIC_ORIGIN || "https://tankyu-five.vercel.app",
});
