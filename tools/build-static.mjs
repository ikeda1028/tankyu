import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

const firebaseJson = parseJsonEnv("FIREBASE_CONFIG_JSON");
const config = {
  googleMapsApiKey: getEnv("GOOGLE_MAPS_API_KEY", "PUBLIC_GOOGLE_MAPS_API_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
  driveApiUrl: getEnv("GOOGLE_DRIVE_API_URL", "PUBLIC_GOOGLE_DRIVE_API_URL"),
  adminEmails: (getEnv("ADMIN_EMAILS") || "ikeda@manabinomichi.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  firebase: {
    apiKey: firebaseJson.apiKey || getEnv("FIREBASE_API_KEY", "PUBLIC_FIREBASE_API_KEY"),
    authDomain: firebaseJson.authDomain || getEnv("FIREBASE_AUTH_DOMAIN", "PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: firebaseJson.projectId || getEnv("FIREBASE_PROJECT_ID", "PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: firebaseJson.storageBucket || getEnv("FIREBASE_STORAGE_BUCKET", "PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: firebaseJson.messagingSenderId || getEnv("FIREBASE_MESSAGING_SENDER_ID", "PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: firebaseJson.appId || getEnv("FIREBASE_APP_ID", "PUBLIC_FIREBASE_APP_ID"),
  },
  features: {
    openAiApi: Boolean(getEnv("OPENAI_API_KEY")),
    firebase: Boolean(firebaseJson.apiKey || getEnv("FIREBASE_API_KEY", "PUBLIC_FIREBASE_API_KEY")),
    googleMaps: Boolean(getEnv("GOOGLE_MAPS_API_KEY", "PUBLIC_GOOGLE_MAPS_API_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")),
    googleDrive: Boolean(getEnv("GOOGLE_DRIVE_API_URL", "PUBLIC_GOOGLE_DRIVE_API_URL")),
  },
};

await writeFile(
  join(dist, "public-config.js"),
  `window.WAKUWAKU_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  "utf8"
);
