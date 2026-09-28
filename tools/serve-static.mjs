import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  if (url.pathname === "/api/visit-points") {
    const reply = { setHeader: (...args) => response.setHeader(...args), status(code) { response.statusCode = code; return this; }, json(data) { response.setHeader("Content-Type", "application/json; charset=utf-8"); response.end(JSON.stringify(data)); } };
    try {
      let body = "";
      for await (const chunk of request) { body += chunk; if (Buffer.byteLength(body) > 8192) { reply.status(413).json({ error: "入力が大きすぎます" }); return; } }
      let input;
      try { input = body ? JSON.parse(body) : undefined; }
      catch { reply.status(400).json({ error: "入力が正しくありません" }); return; }
      const { default: handler } = await import("../server/visit-service.js");
      await handler({ method: request.method, headers: request.headers, query: Object.fromEntries(url.searchParams), body: input }, reply);
    } catch { reply.status(503).json({ error: "ポイントAPIのローカル設定を確認してください" }); }
    return;
  }
  const requested = url.pathname === "/" ? "index.html" : url.pathname === "/visit" ? "visit.html" : url.pathname.slice(1);
  const file = normalize(join(root, requested));

  if (!file.startsWith(root) || requested.split("/").some((part) => part.startsWith(".")) || /^(server|api|node_modules)\//.test(requested)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${port}`);
});
