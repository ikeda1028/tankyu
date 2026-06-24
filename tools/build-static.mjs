import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");

const publicFiles = ["index.html", "styles.css", "app.js", "database.js", "firebase-sync.js"];
const assetFiles = ["opening-kids.mp4"];

await mkdir(dist, { recursive: true });
await mkdir(join(dist, "assets"), { recursive: true });

for (const file of publicFiles) {
  await copyFile(join(root, file), join(dist, file));
}

for (const file of assetFiles) {
  await copyFile(join(root, "assets", file), join(dist, "assets", file));
}

function getEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim()) return String(value).trim();
  }
  return "";
}

function parseJsonEnv(name) {
  const value = getEnv(name);
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    console.warn(`${name} is not valid JSON. Falling back to individual Firebase env vars.`);
    return {};
  }
}

async function readSourcePublicConfig() {
  try {
    const source = await readFile(join(root, "public-config.js"), "utf8");
    const context = { window: {} };
    vm.runInNewContext(source, context, { filename: "public-config.js", timeout: 1000 });
    return context.window.WAKUWAKU_CONFIG && typeof context.window.WAKUWAKU_CONFIG === "object"
      ? context.window.WAKUWAKU_CONFIG
      : {};
  } catch {
    return {};
  }
}

function fallbackEnv(value, fallback = "") {
  return value || String(fallback || "").trim();
}

const firebaseJson = parseJsonEnv("FIREBASE_CONFIG_JSON");
const sourceConfig = await readSourcePublicConfig();
const sourceFirebase = sourceConfig.firebase || {};
const config = {
  googleMapsApiKey: fallbackEnv(
    getEnv("GOOGLE_MAPS_API_KEY", "PUBLIC_GOOGLE_MAPS_API_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
    sourceConfig.googleMapsApiKey
  ),
  driveApiUrl: fallbackEnv(getEnv("GOOGLE_DRIVE_API_URL", "PUBLIC_GOOGLE_DRIVE_API_URL"), sourceConfig.driveApiUrl),
  adminEmails: (getEnv("ADMIN_EMAILS") || "ikeda@manabinomichi.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  firebase: {
    apiKey: fallbackEnv(firebaseJson.apiKey || getEnv("FIREBASE_API_KEY", "PUBLIC_FIREBASE_API_KEY"), sourceFirebase.apiKey),
    authDomain: fallbackEnv(firebaseJson.authDomain || getEnv("FIREBASE_AUTH_DOMAIN", "PUBLIC_FIREBASE_AUTH_DOMAIN"), sourceFirebase.authDomain),
    projectId: fallbackEnv(firebaseJson.projectId || getEnv("FIREBASE_PROJECT_ID", "PUBLIC_FIREBASE_PROJECT_ID"), sourceFirebase.projectId),
    storageBucket: fallbackEnv(
      firebaseJson.storageBucket || getEnv("FIREBASE_STORAGE_BUCKET", "PUBLIC_FIREBASE_STORAGE_BUCKET"),
      sourceFirebase.storageBucket
    ),
    messagingSenderId: fallbackEnv(
      firebaseJson.messagingSenderId || getEnv("FIREBASE_MESSAGING_SENDER_ID", "PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
      sourceFirebase.messagingSenderId
    ),
    appId: fallbackEnv(firebaseJson.appId || getEnv("FIREBASE_APP_ID", "PUBLIC_FIREBASE_APP_ID"), sourceFirebase.appId),
  },
  features: {
    openAiApi: Boolean(getEnv("OPENAI_API_KEY")),
    firebase: Boolean(firebaseJson.apiKey || getEnv("FIREBASE_API_KEY", "PUBLIC_FIREBASE_API_KEY") || sourceFirebase.apiKey),
    googleMaps: Boolean(
      getEnv("GOOGLE_MAPS_API_KEY", "PUBLIC_GOOGLE_MAPS_API_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") || sourceConfig.googleMapsApiKey
    ),
    googleDrive: Boolean(getEnv("GOOGLE_DRIVE_API_URL", "PUBLIC_GOOGLE_DRIVE_API_URL") || sourceConfig.driveApiUrl),
  },
};

await writeFile(
  join(dist, "public-config.js"),
  `window.WAKUWAKU_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  "utf8"
);
