import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const lucide = require("lucide");
for (const [name, icon] of Object.entries({ up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", exit: "LogOut", hand: "Hand" })) {
  const children = lucide[icon].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ")} />`).join("");
  await writeFile(new URL(`../assets/walk-${name}.svg`, import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#223c36" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>\n`);
}
