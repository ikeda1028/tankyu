import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the TLA public landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /問いを、/);
  assert.match(html, /社会を動かす/);
  assert.match(html, /企業・自治体・教育機関/);
  assert.match(html, /組織・事業を変える/);
  assert.match(html, /地域・社会を変える/);
  assert.match(html, /学びを変える/);
  assert.match(html, /ikeda@tankyu\.academy/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
