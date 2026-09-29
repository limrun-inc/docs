// Run against `next start`, not mocks: Next can overwrite application headers.
import assert from "node:assert/strict";
const base = process.env.AGENT_TEST_URL || "http://localhost:8800";
const origin = "https://docs.limrun.com";
async function get(path, options = {}) {
  const response = await fetch(new URL(path, base), options);
  const body = await response.text();
  return { response, body };
}
function markdown({ response, body }, status = 200) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("Content-Type"), /^text\/markdown/);
  assert.match(response.headers.get("Vary"), /(?:^|,\s*)Accept(?:,|$)/i);
  assert.ok(Number(response.headers.get("X-Markdown-Tokens")) > 0);
  assert.doesNotMatch(response.headers.get("Link") || "", /localhost|:8800/);
  assert.doesNotMatch(body, /Source:.*localhost|Source:.*:8800/);
}
const index = await get("/llms.txt");
assert.equal(index.response.status, 200);
let indexes = index.body;
for (const match of index.body.matchAll(
  /\]\(https:\/\/docs.limrun.com(\/docs\/[a-z0-9-]+\/llms.txt)\)/g,
)) {
  const scoped = await get(match[1]);
  assert.equal(scoped.response.status, 200);
  indexes += "\n" + scoped.body;
}
const paths = [
  ...new Set(
    [
      ...indexes.matchAll(
        /\]\(https:\/\/docs.limrun.com(\/docs(?:\/[a-z0-9-]+)*\.md)\)/g,
      ),
    ].map((match) => match[1]),
  ),
];
assert.ok(paths.length > 25, "Index must expose all published Markdown pages");
for (const path of paths) {
  const page = path.slice(0, -3);
  const html = await get(page);
  assert.equal(html.response.status, 200, page);
  assert.match(html.response.headers.get("Content-Type"), /^text\/html/, page);
  assert.match(
    html.response.headers.get("Vary"),
    /(?:^|,\s*)Accept(?:,|$)/i,
    page,
  );
  assert.match(html.response.headers.get("Vary"), /rsc/i, page);
  assert.ok(html.body.includes('rel="describedby"'), page);
  assert.ok(html.body.includes('type="text/markdown"'), page);
  const md = await get(page, { headers: { Accept: "text/markdown" } });
  markdown(md);
  assert.equal(md.response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(md.response.headers.get("Content-Location"), origin + path);
  const direct = await get(path);
  markdown(direct);
  const alias = await get(page + "/index.md");
  markdown(alias);
  assert.equal(md.body, direct.body, page);
  assert.equal(md.body, alias.body, page);
}
for (const headers of [
  { Accept: "text/markdown;q=0,*/*" },
  { Accept: "text/html;q=0.9,text/markdown;q=0.1" },
  { Accept: "text/html", "Signature-Agent": "test-crawler" },
  { Accept: "text/html", "x-limrun-wants-markdown": "1" },
]) {
  const { response } = await get("/docs/quickstart", { headers });
  assert.match(response.headers.get("Content-Type"), /^text\/html/);
}
for (const path of ["/", "/docs", "/docs/quickstart", "/docs/reference/sdk"]) {
  markdown(
    await get(path, { headers: { Accept: "TEXT/MARKDOWN; charset=utf-8" } }),
  );
  const head = await get(path, {
    method: "HEAD",
    headers: {
      Accept: "text/markdown",
      "If-None-Match": '"html"',
      Range: "bytes=0-2",
    },
  });
  markdown(head);
  assert.equal(head.body, "");
  const conditional = await get(path, {
    headers: {
      Accept: "text/markdown",
      "If-None-Match": '"html"',
      Range: "bytes=0-2",
    },
  });
  markdown(conditional);
  assert.equal(conditional.response.headers.get("Content-Range"), null);
}
for (const path of ["/does-not-exist", "/docs/does-not-exist"]) {
  const missing = await get(path, { headers: { Accept: "text/markdown" } });
  markdown(missing, 404);
  assert.doesNotMatch(missing.response.headers.get("Link"), /rel="canonical"/);
  assert.equal(
    (await get(path, { headers: { Accept: "text/markdown;q=0,*/*" } })).response
      .status,
    404,
  );
}
for (const section of [
  "ios",
  "android",
  "agents",
  "testing",
  "ci",
  "guides",
  "platform",
  "reference",
]) {
  const scoped = await get(`/docs/${section}/llms.txt`);
  assert.match(scoped.response.headers.get("Content-Type"), /^text\/plain/);
  assert.ok(scoped.body.includes(`/docs/${section}/`));
}
for (const path of [
  "/docs/ios/test-with-xctest",
  "/docs/ios/test-with-xctest.md",
]) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual",
    headers: { Accept: "text/markdown" },
  });
  assert.equal(response.status, 308);
  assert.match(response.headers.get("Location"), /\/docs\/testing\/xctest/);
}
const navigation = await get("/docs/quickstart", {
  headers: { RSC: "1", Accept: "text/markdown" },
});
assert.match(
  navigation.response.headers.get("Content-Type"),
  /^text\/x-component/,
);
const search = await get("/api/docs?query=xcode");
assert.match(search.response.headers.get("Content-Type"), /application\/json/);
assert.ok(Array.isArray(JSON.parse(search.body)));
for (const path of [
  "/robots.txt",
  "/.well-known/agent.json",
  "/.well-known/mcp/server-card.json",
  "/.well-known/ai-catalog.json",
  "/AGENTS.md",
  "/sitemap.xml",
  "/auth.md",
]) {
  assert.equal(
    (await get(path, { headers: { Accept: "text/markdown" } })).response.status,
    200,
    path,
  );
}
console.log(
  `Agent HTTP checks passed for ${paths.length} documentation pages, aliases, negotiation, discovery, navigation, and redirects.`,
);
