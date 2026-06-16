const DB_NAME = "wakuwakuQuestDB";
const DB_VERSION = 2;
const USER_ID = "demo-student";

const STORE_NAMES = [
  "profiles",
  "events",
  "sparks",
  "activities",
  "participations",
  "reflections",
  "feedbacks",
  "fieldPosts",
  "meta",
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sparks")) {
        db.createObjectStore("sparks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("activities")) {
        db.createObjectStore("activities", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("participations")) {
        db.createObjectStore("participations", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("reflections")) {
        db.createObjectStore("reflections", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("feedbacks")) {
        db.createObjectStore("feedbacks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("fieldPosts")) {
        db.createObjectStore("fieldPosts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizeRecords(records, prefix) {
  return records.map((record, index) => ({
    ...record,
    id: record.id || `${prefix}-${record.at || index}-${index}`,
    userId: USER_ID,
  }));
}

async function clearAndPut(db, storeName, records) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.clear();
  records.forEach((record) => store.put(record));
  await txDone(tx);
}

async function getAll(db, storeName) {
  const tx = db.transaction(storeName, "readonly");
  return requestToPromise(tx.objectStore(storeName).getAll());
}

async function seedEvents(db, events) {
  const existing = await getAll(db, "events");
  if (existing.length === events.length) return;
  await clearAndPut(
    db,
    "events",
    events.map((event) => ({
      ...event,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );
}

function toProfile(state) {
  return {
    id: USER_ID,
    auth: state.auth,
    member: state.member,
    quest: state.quest,
    joy: state.joy,
    drive: state.drive,
    thanks: state.thanks,
    selected: state.selected,
    interests: state.interests,
    joyActions: state.joyActions || [],
    selectedReflection: state.selectedReflection,
    streak: state.streak,
    lastActiveDate: state.lastActiveDate,
    updatedAt: new Date().toISOString(),
  };
}

function fromProfile(defaultState, profile) {
  return profile
    ? {
        ...defaultState,
        auth: profile.auth || defaultState.auth,
        member: profile.member || defaultState.member,
        quest: profile.quest,
        joy: profile.joy,
        drive: profile.drive,
        thanks: profile.thanks,
        selected: profile.selected,
        interests: profile.interests || defaultState.interests,
        joyActions: profile.joyActions || defaultState.joyActions || [],
        selectedReflection: profile.selectedReflection || "",
        streak: profile.streak || 0,
        lastActiveDate: profile.lastActiveDate || "",
      }
    : { ...defaultState };
}

async function readState(db, defaultState) {
  const profileTx = db.transaction("profiles", "readonly");
  const profile = await requestToPromise(profileTx.objectStore("profiles").get(USER_ID));
  const [events, sparks, activities, participations, reflections, feedbacks, fieldPosts] = await Promise.all([
    getAll(db, "events"),
    getAll(db, "sparks"),
    getAll(db, "activities"),
    getAll(db, "participations"),
    getAll(db, "reflections"),
    getAll(db, "feedbacks"),
    getAll(db, "fieldPosts"),
  ]);

  return {
    ...fromProfile(defaultState, profile),
    customEvents: events.filter((event) => event.userCreated).sort(sortByAtDesc),
    sparks: sparks.sort(sortByAtDesc),
    activity: activities.sort(sortByAtDesc),
    completed: participations.sort(sortByAtDesc).map((item) => item.eventId),
    reflections: reflections.sort(sortByAtDesc),
    feedbacks: feedbacks.sort(sortByAtDesc),
    fieldPosts: fieldPosts.sort(sortByAtDesc),
  };
}

function sortByAtDesc(a, b) {
  return String(b.at || "").localeCompare(String(a.at || ""));
}

async function writeState(db, state, events) {
  await clearAndPut(
    db,
    "events",
    events.map((event) => ({
      ...event,
      updatedAt: new Date().toISOString(),
      createdAt: event.createdAt || new Date().toISOString(),
    }))
  );

  const profileTx = db.transaction(["profiles", "meta"], "readwrite");
  profileTx.objectStore("profiles").put(toProfile(state));
  profileTx.objectStore("meta").put({
    key: "lastSyncedAt",
    value: new Date().toISOString(),
  });
  await txDone(profileTx);

  await Promise.all([
    clearAndPut(db, "sparks", normalizeRecords(state.sparks, "spark")),
    clearAndPut(db, "activities", normalizeRecords(state.activity, "activity")),
    clearAndPut(
      db,
      "participations",
      state.completed.map((eventId, index) => ({
        id: `participation-${eventId}`,
        userId: USER_ID,
        eventId,
        at: state.activity.find((item) => item.text?.includes(eventId))?.at || new Date(Date.now() - index).toISOString(),
      }))
    ),
    clearAndPut(db, "reflections", normalizeRecords(state.reflections, "reflection")),
    clearAndPut(db, "feedbacks", normalizeRecords(state.feedbacks, "feedback")),
    clearAndPut(db, "fieldPosts", normalizeRecords(state.fieldPosts || [], "field-post")),
  ]);
}

async function getCounts(db) {
  const pairs = await Promise.all(
    STORE_NAMES.map(async (storeName) => {
      const tx = db.transaction(storeName, "readonly");
      const count = await requestToPromise(tx.objectStore(storeName).count());
      return [storeName, count];
    })
  );
  return Object.fromEntries(pairs);
}

async function exportSnapshot(db) {
  const result = {};
  await Promise.all(
    STORE_NAMES.map(async (storeName) => {
      result[storeName] = await getAll(db, storeName);
    })
  );
  return result;
}

window.WakuwakuDB = {
  openDatabase,
  readState,
  writeState,
  getCounts,
  exportSnapshot,
  seedEvents,
};
