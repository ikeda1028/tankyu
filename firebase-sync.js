const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const FIREBASE_COLLECTION = "wakuwakuUsers";

let firebaseModulesPromise = null;
let firebaseApp = null;
let firebaseDb = null;

function hasFirebaseConfig(config) {
  return Boolean(config?.apiKey && config?.projectId && config?.appId);
}

async function loadFirebaseModules() {
  if (!firebaseModulesPromise) {
    firebaseModulesPromise = Promise.all([import(FIREBASE_APP_URL), import(FIREBASE_FIRESTORE_URL)]).then(([app, firestore]) => ({
      app,
      firestore,
    }));
  }
  return firebaseModulesPromise;
}

async function connectFirebase(config) {
  if (!hasFirebaseConfig(config)) {
    throw new Error("Firebase設定を入力してください");
  }

  const { app, firestore } = await loadFirebaseModules();
  if (!firebaseApp) {
    firebaseApp = app.initializeApp(config, "wakuwakuQuest");
    firebaseDb = firestore.getFirestore(firebaseApp);
  }
  return { firestore, db: firebaseDb };
}

function getFirebaseUserId(state) {
  const rawId = state?.auth?.email || state?.member?.name || "demo-student";
  return String(rawId).trim().replace(/[/.#[\]\s]/g, "_") || "demo-student";
}

async function saveSnapshot(config, state, snapshot) {
  const { firestore, db } = await connectFirebase(config);
  const userId = getFirebaseUserId(state);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
  await firestore.setDoc(
    ref,
    {
      userId,
      email: state?.auth?.email || "",
      displayName: state?.member?.name || "",
      snapshot,
      updatedAt: firestore.serverTimestamp(),
    },
    { merge: true }
  );
  return { userId };
}

async function loadSnapshot(config, state) {
  const { firestore, db } = await connectFirebase(config);
  const userId = getFirebaseUserId(state);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
  const snap = await firestore.getDoc(ref);
  return snap.exists() ? { userId, ...snap.data() } : null;
}

window.WakuwakuFirebase = {
  hasFirebaseConfig,
  saveSnapshot,
  loadSnapshot,
};
