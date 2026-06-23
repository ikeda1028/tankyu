const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const FIREBASE_STORAGE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
const FIREBASE_COLLECTION = "wakuwakuUsers";

let firebaseModulesPromise = null;
let firebaseApp = null;
let firebaseDb = null;
let firebaseStorage = null;

function hasFirebaseConfig(config) {
  return Boolean(config?.apiKey && config?.projectId && config?.appId);
}

async function loadFirebaseModules() {
  if (!firebaseModulesPromise) {
    firebaseModulesPromise = Promise.all([import(FIREBASE_APP_URL), import(FIREBASE_FIRESTORE_URL), import(FIREBASE_STORAGE_URL)]).then(([app, firestore, storage]) => ({
      app,
      firestore,
      storage,
    }));
  }
  return firebaseModulesPromise;
}

async function connectFirebase(config) {
  if (!hasFirebaseConfig(config)) {
    throw new Error("Firebase設定を入力してください");
  }

  const { app, firestore, storage } = await loadFirebaseModules();
  if (!firebaseApp) {
    firebaseApp = app.initializeApp(config, "wakuwakuQuest");
    firebaseDb = firestore.getFirestore(firebaseApp);
    firebaseStorage = storage.getStorage(firebaseApp);
  }
  return { firestore, storage, db: firebaseDb, storageBucket: firebaseStorage };
}

function getFirebaseUserId(state) {
  const rawId = state?.auth?.email || state?.member?.name || "demo-student";
  return String(rawId).trim().replace(/[/.#[\]\s]/g, "_") || "demo-student";
}

function getFirebaseUserIdAliases(state) {
  const rawId = String(state?.auth?.email || state?.member?.name || "demo-student").trim() || "demo-student";
  return [
    getFirebaseUserId(state),
    rawId,
    rawId.toLowerCase(),
    rawId.replace(/[^a-zA-Z0-9_-]/g, "_"),
    rawId.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "_"),
  ]
    .filter((id) => id && !id.includes("/"))
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

function dataUrlToBlob(dataUrl) {
  const [meta = "", base64 = ""] = String(dataUrl).split(",");
  const contentType = meta.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: contentType });
}

async function uploadFieldPostImages(firebase, userId, snapshot) {
  const posts = Array.isArray(snapshot?.fieldPosts) ? snapshot.fieldPosts : [];
  const uploadedPosts = [];

  for (const post of posts) {
    const image = post?.image;
    if (!image?.dataUrl) {
      uploadedPosts.push(post);
      continue;
    }

    const safePostId = String(post.id || `post-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    const storagePath = `fieldPosts/${userId}/${safePostId}.jpg`;
    const imageRef = firebase.storage.ref(firebase.storageBucket, storagePath);
    const blob = dataUrlToBlob(image.dataUrl);
    await firebase.storage.uploadBytes(imageRef, blob, {
      contentType: image.type || blob.type || "image/jpeg",
      customMetadata: {
        originalName: image.name || "",
        eventId: post.eventId || "",
      },
    });
    const downloadUrl = await firebase.storage.getDownloadURL(imageRef);
    uploadedPosts.push({
      ...post,
      image: {
        name: image.name || "",
        type: image.type || blob.type || "image/jpeg",
        size: image.size || blob.size || 0,
        hasPhoto: true,
        storagePath,
        downloadUrl,
      },
    });
  }

  return {
    ...snapshot,
    fieldPosts: uploadedPosts,
  };
}

async function uploadMemberAvatar(firebase, userId, snapshot) {
  const avatar = snapshot?.member?.avatar;
  if (!avatar?.imageDataUrl) return snapshot;

  const storagePath = `avatars/${userId}/avatar.jpg`;
  const imageRef = firebase.storage.ref(firebase.storageBucket, storagePath);
  const blob = dataUrlToBlob(avatar.imageDataUrl);
  await firebase.storage.uploadBytes(imageRef, blob, {
    contentType: blob.type || "image/jpeg",
    customMetadata: {
      userId,
      generationStage: avatar.generationStage || "simple",
      aura: avatar.aura || "",
    },
  });
  const downloadUrl = await firebase.storage.getDownloadURL(imageRef);

  return {
    ...snapshot,
    member: {
      ...(snapshot.member || {}),
      avatar: {
        ...avatar,
        imageDataUrl: "",
        hasImage: true,
        storagePath,
        downloadUrl,
        uploadedAt: new Date().toISOString(),
      },
    },
  };
}

async function saveSnapshot(config, state, snapshot) {
  const firebase = await connectFirebase(config);
  const { firestore, db } = firebase;
  const userId = getFirebaseUserId(state);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
  const avatarSnapshot = await uploadMemberAvatar(firebase, userId, snapshot);
  const uploadedSnapshot = await uploadFieldPostImages(firebase, userId, avatarSnapshot);
  const avatar = uploadedSnapshot.member?.avatar || {};
  const childProfile = uploadedSnapshot.childProfile || {};
  const permissions = childProfile.permissions || {};
  const stats = {
    quest: Number(state?.quest || 0),
    hp: Number(state?.quest || 0),
    joy: Number(state?.joy || 0),
    drive: Number(state?.drive || 0),
    thanks: Number(state?.thanks || 0),
    streak: Number(state?.streak || 0),
  };
  await firestore.setDoc(
    ref,
    {
      userId,
      email: state?.auth?.email || "",
      displayName: state?.member?.name || "",
      childProfile: {
        id: childProfile.id || "",
        nickname: childProfile.nickname || "",
        age: Number(childProfile.age || 0),
        region: childProfile.region || "",
        favoriteThings: childProfile.favoriteThings || "",
        favoriteColor: childProfile.favoriteColor || "",
        guardianId: childProfile.guardianId || "",
        permissions: {
          photoPost: Boolean(permissions.photoPost),
          locationSave: Boolean(permissions.locationSave),
          publicShare: Boolean(permissions.publicShare),
          aiSuggestions: Boolean(permissions.aiSuggestions),
          driveSync: Boolean(permissions.driveSync),
        },
        onboardingComplete: Boolean(childProfile.onboardingComplete),
        onboardingCompletedAt: childProfile.onboardingCompletedAt || "",
        updatedAt: childProfile.updatedAt || "",
      },
      guardian: {
        id: uploadedSnapshot.guardian?.id || "",
      },
      stats,
      avatar: {
        symbol: avatar.symbol || "",
        color: avatar.color || "",
        aura: avatar.aura || "",
        prompt: avatar.prompt || "",
        hasImage: Boolean(avatar.downloadUrl || avatar.imageDataUrl),
        storagePath: avatar.storagePath || "",
        downloadUrl: avatar.downloadUrl || "",
        generationStage: avatar.generationStage || "simple",
        generatedAt: avatar.generatedAt || "",
        uploadedAt: avatar.uploadedAt || "",
      },
      snapshot: uploadedSnapshot,
      updatedAt: firestore.serverTimestamp(),
    },
    { merge: true }
  );
  return { userId, snapshot: uploadedSnapshot };
}

async function loadSnapshot(config, state) {
  const { firestore, db } = await connectFirebase(config);
  const userIds = getFirebaseUserIdAliases(state);
  for (const userId of userIds) {
    const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
    const snap = await firestore.getDoc(ref);
    if (snap.exists()) return { userId, ...snap.data() };
  }
  return null;
}

window.WakuwakuFirebase = {
  hasFirebaseConfig,
  saveSnapshot,
  loadSnapshot,
};
