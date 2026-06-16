import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");

const publicFiles = ["index.html", "styles.css", "app.js", "database.js", "firebase-sync.js"];

await mkdir(dist, { recursive: true });

for (const file of publicFiles) {
  await copyFile(join(root, file), join(dist, file));
}

const config = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  driveApiUrl: process.env.GOOGLE_DRIVE_API_URL || "",
  adminEmails: (process.env.ADMIN_EMAILS || "ikeda@manabinomichi.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || "",
  },
};

await writeFile(
  join(dist, "public-config.js"),
  `window.WAKUWAKU_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  "utf8"
);
