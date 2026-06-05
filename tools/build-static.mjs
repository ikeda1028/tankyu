import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");

const publicFiles = ["index.html", "styles.css", "app.js", "database.js"];

await mkdir(dist, { recursive: true });

for (const file of publicFiles) {
  await copyFile(join(root, file), join(dist, file));
}

const config = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  driveApiUrl: process.env.GOOGLE_DRIVE_API_URL || "",
};

await writeFile(
  join(dist, "public-config.js"),
  `window.WAKUWAKU_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  "utf8"
);
