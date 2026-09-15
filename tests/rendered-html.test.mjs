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
  assert.match(html, /AIとの対話を始める/);
  const plainText = html.replace(/<[^>]*>/g, "");
  assert.ok(plainText.includes("組織はどんな問いで変わるのか。"));
  assert.ok(plainText.includes("社会は、どんな問いで動き出すのか。"));
  assert.ok(plainText.includes("社会の未来をひらく問いとは何か。"));
  assert.doesNotMatch(html, /制度だけではない|動き出す人です/);
  assert.doesNotMatch(html, /founder-quote-controls|founder-quote-select|founder-quote-pause|自動切替を停止|自動切替を再開/);
  for (const person of ["炭谷 俊樹", "牧山 昭郎", "岡田 大士郎", "池田 哲哉"]) {
    assert.ok(html.includes(person), `Member missing: ${person}`);
  }
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
