const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const FIREBASE_STORAGE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
const FIREBASE_AUTH_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
const FIREBASE_COLLECTION = "wakuwakuUsers";
const PUBLIC_OWNER_EMAIL = "ikeda@manabinomichi.com";
const PUBLIC_OWNER_ID = "ikeda@manabinomichi_com";
let lastPublishedContent = "";

let firebaseModulesPromise = null;
let firebaseApp = null;
let firebaseDb = null;
let firebaseStorage = null;
let firebaseAuth = null;

function hasFirebaseConfig(config) {
  return Boolean(config?.apiKey && config?.projectId && config?.appId);
}

async function loadFirebaseModules() {
  if (!firebaseModulesPromise) {
    firebaseModulesPromise = Promise.all([import(FIREBASE_APP_URL), import(FIREBASE_FIRESTORE_URL), import(FIREBASE_STORAGE_URL), import(FIREBASE_AUTH_URL)]).then(([app, firestore, storage, auth]) => ({
      app,
      firestore,
      storage,
      auth,
    }));
  }
  return firebaseModulesPromise;
}

async function connectFirebase(config) {
  if (!hasFirebaseConfig(config)) {
    throw new Error("Firebase設定を入力してください");
  }

  const { app, firestore, storage, auth } = await loadFirebaseModules();
  if (!firebaseApp) {
    firebaseApp = app.initializeApp(config, "wakuwakuQuest");
    firebaseDb = firestore.getFirestore(firebaseApp);
    firebaseStorage = storage.getStorage(firebaseApp);
    firebaseStorage.maxUploadRetryTime = 30000;
    firebaseStorage.maxOperationRetryTime = 15000;
    firebaseAuth = auth.getAuth(firebaseApp);
  }
  return { firestore, storage, auth, db: firebaseDb, storageBucket: firebaseStorage, authInstance: firebaseAuth };
}

function isAuthenticated(email) {
  const user = firebaseAuth?.currentUser;
  return Boolean(user?.emailVerified && user.email?.toLowerCase() === String(email || "").trim().toLowerCase());
}

async function getAuthenticatedUser(config) {
  const { authInstance } = await connectFirebase(config);
  await authInstance.authStateReady();
  return authInstance.currentUser;
}

async function requireAuthenticatedUser(config, state) {
  await getAuthenticatedUser(config);
  if (!isAuthenticated(state?.auth?.email)) {
    throw Object.assign(new Error("保存に使っていたGoogleアカウントで本人確認してください"), { code: "auth/identity-required" });
  }
  return firebaseAuth.currentUser;
}

async function signInGoogle(config) {
  const { auth, authInstance } = await connectFirebase(config);
  const provider = new auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await auth.signInWithPopup(authInstance, provider);
  return result.user;
}

async function signInPassword(config, email, password) {
  const { auth, authInstance } = await connectFirebase(config);
  const result = await auth.signInWithEmailAndPassword(authInstance, email, password);
  if (!result.user.emailVerified) throw Object.assign(new Error("メールアドレスの確認が必要です"), { code: "auth/unverified-email" });
  return result.user;
}

async function signOut() {
  if (!firebaseAuth) return;
  const { auth } = await loadFirebaseModules();
  await auth.signOut(firebaseAuth);
}

function getFirebaseUserId(state) {
  const rawId = state?.auth?.email || state?.member?.name || "demo-student";
  return String(rawId).trim().toLowerCase().replace(/[/.#[\]\s]/g, "_") || "demo-student";
}

function getFirebaseUserIdAliases(state) {
  const rawId = String(state?.auth?.email || state?.member?.name || "demo-student").trim() || "demo-student";
  const lowerRawId = rawId.toLowerCase();
  return [
    getFirebaseUserId(state),
    rawId,
    lowerRawId,
    rawId.replace(/[/.#[\]\s]/g, "_"),
    lowerRawId.replace(/[/.#[\]\s]/g, "_"),
    rawId.replace(/[^a-zA-Z0-9_-]/g, "_"),
    lowerRawId.replace(/[^a-zA-Z0-9_-]/g, "_"),
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

async function uploadImage(firebase, uid, kind, dataUrl) {
  if (!uid) throw Object.assign(new Error("画像保存には本人確認が必要です"), { code: "auth/identity-required" });
  const blob = dataUrlToBlob(dataUrl);
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[blob.type];
  if (!extension || blob.size > 10 * 1024 * 1024) {
    throw Object.assign(new Error("画像は10MB以下のJPEG・PNG・WebP・GIFを使用してください"), { code: "storage/invalid-image" });
  }
  // Immutable paths prevent cached URLs and concurrent devices from replacing another image.
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const storagePath = `media/${uid}/${kind}/${hash}.${extension}`;
  const imageRef = firebase.storage.ref(firebase.storageBucket, storagePath);
  await firebase.storage.uploadBytes(imageRef, blob, { contentType: blob.type });
  const downloadUrl = await firebase.storage.getDownloadURL(imageRef);
  return { storagePath, downloadUrl, uploadedAt: new Date().toISOString() };
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

    const blob = dataUrlToBlob(image.dataUrl);
    const stored = await uploadImage(firebase, userId, "fieldPosts", image.dataUrl);
    uploadedPosts.push({
      ...post,
      image: {
        name: image.name || "",
        type: image.type || blob.type || "image/jpeg",
        size: image.size || blob.size || 0,
        hasPhoto: true,
        ...stored,
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

  const stored = await uploadImage(firebase, userId, "avatars", avatar.imageDataUrl);

  return {
    ...snapshot,
    member: {
      ...(snapshot.member || {}),
      avatar: {
        ...avatar,
        imageDataUrl: "",
        hasImage: true,
        ...stored,
      },
    },
  };
}

async function uploadWorldMapImages(firebase, userId, snapshot) {
  const worlds = Array.isArray(snapshot?.worlds) ? snapshot.worlds : [];
  const uploadedWorlds = [];

  for (const world of worlds) {
    const visualMap = world?.visualMap;
    if (!visualMap?.imageDataUrl) {
      uploadedWorlds.push(world);
      continue;
    }

    const stored = await uploadImage(firebase, userId, "worldMaps", visualMap.imageDataUrl);
    uploadedWorlds.push({
      ...world,
      visualMap: {
        ...visualMap,
        imageDataUrl: "",
        hasImage: true,
        ...stored,
      },
    });
  }

  return {
    ...snapshot,
    worlds: uploadedWorlds,
  };
}

async function uploadEventCharacterImages(firebase, userId, snapshot) {
  const events = Array.isArray(snapshot?.customEvents) ? snapshot.customEvents : [];
  const uploadedEvents = [];

  for (const event of events) {
    const character = event?.character;
    if (!character?.imageDataUrl) {
      uploadedEvents.push(event);
      continue;
    }

    const stored = await uploadImage(firebase, userId, "eventCharacters", character.imageDataUrl);
    uploadedEvents.push({
      ...event,
      character: {
        ...character,
        imageDataUrl: "",
        hasImage: true,
        ...stored,
      },
    });
  }

  return {
    ...snapshot,
    customEvents: uploadedEvents,
  };
}

async function saveSnapshot(config, state, snapshot) {
  const identity = { auth: { ...state.auth } };
  const user = await requireAuthenticatedUser(config, identity);
  const firebase = await connectFirebase(config);
  const { firestore, db } = firebase;
  const userId = getFirebaseUserId(identity);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
  let uploadedSnapshot = snapshot;
  let mediaUploadError = "";
  try {
    uploadedSnapshot = await uploadMemberAvatar(firebase, user.uid, uploadedSnapshot);
    uploadedSnapshot = await uploadWorldMapImages(firebase, user.uid, uploadedSnapshot);
    uploadedSnapshot = await uploadEventCharacterImages(firebase, user.uid, uploadedSnapshot);
    uploadedSnapshot = await uploadFieldPostImages(firebase, user.uid, uploadedSnapshot);
  } catch (error) {
    mediaUploadError = error?.message || "media upload failed";
    // Keep small inline images if Storage is unavailable; never replace them with empty strings.
    if (new TextEncoder().encode(JSON.stringify(uploadedSnapshot)).length > 750000) {
      throw Object.assign(new Error("画像を保存できませんでした。端末のデータは保持しています。Firebase Storageの設定を確認してください。"), { code: "storage/media-save-failed", cause: error });
    }
  }
  const avatar = uploadedSnapshot.member?.avatar || {};
  const childProfile = uploadedSnapshot.childProfile || {};
  const permissions = childProfile.permissions || {};
  const stats = {
    quest: Number(snapshot?.quest || 0),
    hp: Number(snapshot?.quest || 0),
    joy: Number(snapshot?.joy || 0),
    drive: Number(snapshot?.drive || 0),
    thanks: Number(snapshot?.thanks || 0),
    streak: Number(snapshot?.streak || 0),
  };
  await firestore.setDoc(
    ref,
    {
      userId,
      email: identity.auth.email,
      emailLower: identity.auth.email.trim().toLowerCase(),
      displayName: snapshot?.member?.name || "",
      mediaUploadError,
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
  return { userId, snapshot: uploadedSnapshot, mediaUploadError };
}

async function loadSnapshot(config, state) {
  await requireAuthenticatedUser(config, state);
  const { firestore, db } = await connectFirebase(config);
  const userIds = getFirebaseUserIdAliases(state);
  for (const userId of userIds) {
    const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
    try {
      const snap = await firestore.getDoc(ref);
      if (snap.exists()) return { userId, ...snap.data() };
    } catch (error) {
      // Legacy aliases may not exist or belong to this identity. The canonical read must succeed.
      if (userId === userIds[0] || error.code !== "permission-denied") throw error;
    }
  }
  const emailLower = String(state?.auth?.email || "").trim().toLowerCase();
  if (emailLower) {
    const collectionRef = firestore.collection(db, FIREBASE_COLLECTION);
    const emailQuery = firestore.query(collectionRef, firestore.where("emailLower", "==", emailLower), firestore.limit(1));
    const querySnap = await firestore.getDocs(emailQuery);
    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      return { userId: docSnap.id, ...docSnap.data() };
    }
  }
  return null;
}

function pickPublicFields(value, names) {
  return Object.fromEntries(names.filter((name) => value?.[name] !== undefined).map((name) => [name, value[name]]));
}

function createMemberProfile(snapshot) {
  return {
    member: pickPublicFields(snapshot.member, ["name", "age", "birthdate", "school", "grade", "region", "initialInterest", "heroRole", "partyRoles"]),
    childProfile: pickPublicFields(snapshot.childProfile, ["id", "nickname", "age", "birthdate", "region", "favoriteThings", "favoriteColor", "guardianId", "permissions", "onboardingComplete", "onboardingCompletedAt", "updatedAt"]),
  };
}

async function saveMemberProfile(config, state, snapshot, expectedRevision = null) {
  const identity = { auth: { ...state.auth } };
  const profile = JSON.parse(JSON.stringify(createMemberProfile(snapshot)));
  await requireAuthenticatedUser(config, identity);
  const { firestore, db } = await connectFirebase(config);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, getFirebaseUserId(identity));
  return firestore.runTransaction(db, async (transaction) => {
    const document = await transaction.get(ref);
    const existing = document.exists() ? document.data().memberProfile : null;
    // Initial migration must never overwrite a profile already created on another device.
    if (expectedRevision === null && existing) return existing;
    if (expectedRevision !== null && (existing?.revision || 0) !== expectedRevision) {
      throw Object.assign(new Error("別の端末で会員情報が更新されています。最新の情報を読み込んでから保存してください"), { code: "profile/conflict" });
    }
    const saved = { ...profile, revision: (existing?.revision || 0) + 1 };
    transaction.set(ref, {
      userId: getFirebaseUserId(identity),
      email: identity.auth.email,
      emailLower: identity.auth.email.trim().toLowerCase(),
      memberProfile: saved,
      memberProfileUpdatedAt: firestore.serverTimestamp(),
    }, { merge: true });
    return saved;
  });
}

async function watchMemberProfile(config, state, onChange, onError) {
  const identity = { auth: { ...state.auth } };
  await requireAuthenticatedUser(config, identity);
  const { firestore, db } = await connectFirebase(config);
  const ref = firestore.doc(db, FIREBASE_COLLECTION, getFirebaseUserId(identity));
  return firestore.onSnapshot(ref, (document) => {
    const profile = document.data()?.memberProfile;
    if (profile) onChange(profile);
  }, onError);
}

function createPublicExploration(snapshot) {
  const model = (value) => value ? pickPublicFields(value, ["title", "modelUrl", "url", "provider", "status", "addedAt"]) : null;
  const position = (value) => value && value.lat != null && value.lng != null
    && String(value.lat).trim() !== "" && String(value.lng).trim() !== ""
    && Number.isFinite(Number(value.lat)) && Number.isFinite(Number(value.lng))
    && Math.abs(Number(value.lat)) <= 90 && Math.abs(Number(value.lng)) <= 180
    ? { lat: Number(value.lat), lng: Number(value.lng) } : null;
  const points = (snapshot.customEvents || []).map((point) => ({
    ...pickPublicFields(point, ["id", "title", "description", "impact", "locationName", "tags", "keywords", "index", "color", "eventType", "startDate", "endDate", "questionPath", "createdAt", "updatedAt", "aiGenerated", "sourceUrl", "sourceTitle", "sourceType", "verificationNote", "verificationLevel", "verifiedAt"]),
    position: position(point.position),
    boost: pickPublicFields(point.boost, ["joy", "distance", "reflection"]),
    character: point.character ? { ...pickPublicFields(point.character, ["name", "role", "message", "symbol", "color", "localOnly", "radius", "mentorEnabled", "mentorLevel", "mentorProfileId", "mentorBehavior", "imageDataUrl", "downloadUrl"]), model3d: model(point.character.model3d) } : null,
    model3d: model(point.model3d),
  })).filter((point) => point.id && point.position);
  const worlds = (snapshot.worlds || []).map((world) => {
    const source = points.find((point) => point.id === world.sourcePointId || point.title === world.entrance);
    return {
      ...pickPublicFields(world, ["id", "title", "concept", "entrance", "riddle", "requiredItems", "ageMode", "sourceMode", "kidsOnly", "sourcePointId", "createdAt", "updatedAt"]),
      entrancePosition: position(world.entrancePosition) || source?.position || null,
      map: { ...pickPublicFields(world.map, ["summary", "entranceRiddle"]), zones: (world.map?.zones || []).map((zone) => pickPublicFields(zone, ["name", "clue", "item"])) },
      visualMap: pickPublicFields(world.visualMap, ["imageDataUrl", "downloadUrl"]),
      model3d: model(world.model3d),
    };
  }).filter((world) => world.id && world.entrancePosition);
  const registry=(Array.isArray(snapshot.mentorProfiles)&&snapshot.mentorProfiles.length?snapshot.mentorProfiles:[window.MentorBehavior?.sageProfile]).filter(Boolean);
  worlds.push({id:'mentor-registry-v1',kind:'mentor-registry',mentors:registry.map(p=>({...pickPublicFields(p,['id','name','role','mentorEnabled','mentorBehavior']),model3d:model(p.model3d)}))});
  return { points, worlds };
}

async function loadPublicExploration(config) {
  const { firestore, db } = await connectFirebase(config);
  const result = {};
  for (const kind of ["points", "worlds"]) {
    const collection = firestore.collection(db, "publicExplorers", PUBLIC_OWNER_ID, kind);
    const snapshot = await firestore.getDocs(collection);
    result[kind] = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter(record => record.kind !== "mentor-registry");
  }
  return result;
}

async function publishExploration(config, state, snapshot) {
  await requireAuthenticatedUser(config, state);
  if (state.auth.email.toLowerCase() !== PUBLIC_OWNER_EMAIL) return null;
  const content = createPublicExploration(snapshot);
  const signature = JSON.stringify(content);
  if (signature === lastPublishedContent) return content;
  const { firestore, db } = await connectFirebase(config);
  for (const kind of ["points", "worlds"]) {
    const collection = firestore.collection(db, "publicExplorers", PUBLIC_OWNER_ID, kind);
    const existing = await firestore.getDocs(collection);
    const ids = new Set(content[kind].map((record) => record.id));
    const operations = content[kind].map((record) => ({ ref: firestore.doc(collection, record.id), record }));
    for (const doc of existing.docs) if (!ids.has(doc.id)) operations.push({ ref: doc.ref });
    for (let start = 0; start < operations.length; start += 400) {
      const batch = firestore.writeBatch(db);
      for (const operation of operations.slice(start, start + 400)) {
        if (operation.record) batch.set(operation.ref, operation.record);
        else batch.delete(operation.ref);
      }
      await batch.commit();
    }
  }
  lastPublishedContent = signature;
  return content;
}

async function worldAvatar(config, presetId) {
  const user = await getAuthenticatedUser(config);
  await requireAuthenticatedUser(config, { auth: { email: user?.email } });
  const { firestore, db } = await connectFirebase(config);
  const userId = getFirebaseUserId({ auth: { email: user.email } });
  const ref = firestore.doc(db, FIREBASE_COLLECTION, userId);
  if (presetId === undefined) return (await firestore.getDoc(ref)).data()?.worldAvatar || null;
  if (!["", "coral", "miu", "shisa", "sora", "rin", "professor", "robot", "explorer", "manta", "sprite"].includes(presetId)) throw new Error("Unknown avatar");
  return firestore.runTransaction(db, async transaction => {
    const doc = await transaction.get(ref);
    const value = { presetId, revision: (doc.data()?.worldAvatar?.revision || 0) + 1 };
    transaction.set(ref, { userId, email: user.email, emailLower: user.email.toLowerCase(), worldAvatar: value }, { merge: true });
    return value;
  });
}

window.WakuwakuFirebase = {
  worldAvatar,
  isAuthenticated,
  getAuthenticatedUser,
  signInGoogle,
  signInPassword,
  signOut,
  hasFirebaseConfig,
  saveSnapshot,
  loadSnapshot,
  createPublicExploration,
  loadPublicExploration,
  publishExploration,
  createMemberProfile,
  saveMemberProfile,
  watchMemberProfile,
};

