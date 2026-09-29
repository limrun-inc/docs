import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentResponse,
  canonicalRequest,
  documentPath,
  varyOnAccept,
  wantsMarkdown,
} from "../lib/agent-http.ts";

test("negotiation respects weights, exclusions, specificity, and HTML defaults", () => {
  for (const [accept, expected] of [
    [null, false],
    ["*/*", false],
    ["text/*", false],
    ["text/markdown", true],
    ["TEXT/MARKDOWN; charset=utf-8", true],
    ["text/markdown;q=0,*/*", false],
    ["text/markdown;q=0.1,text/html;q=0.9", false],
    ["text/markdown;q=0.9,text/html;q=0.1", true],
    ["text/html;q=0,text/*", true],
  ])
    assert.equal(wantsMarkdown(accept), expected, accept);
});

test("Markdown aliases share a canonical page without touching APIs or discovery files", () => {
  for (const path of ["/", "/docs", "/docs.md", "/docs/index.md", "/index.md"])
    assert.equal(documentPath(path), "/docs");
  for (const path of [
    "/docs/ios/run-simulator",
    "/docs/ios/run-simulator.md",
    "/docs/ios/run-simulator/index.md",
  ])
    assert.equal(documentPath(path), "/docs/ios/run-simulator");
  for (const path of [
    "/api/docs",
    "/docs/ios/llms.txt",
    "/images/example.png",
    "/docs/../private",
    "/docs/%2e%2e/private",
  ])
    assert.equal(documentPath(path), null);
});

test("canonical requests discard local origin and representation validators", () => {
  const req = canonicalRequest(
    new Request("http://localhost:8800/docs/quickstart/index.md?tracking=yes", {
      headers: {
        "If-None-Match": '"html"',
        Range: "bytes=0-5",
        "Signature-Agent": "crawler",
      },
    }),
  );
  const url = new URL(req.url);
  assert.equal(url.origin, "https://docs.limrun.com");
  assert.equal(url.pathname, "/api/docs");
  assert.equal(url.searchParams.get("path"), "/quickstart");
  assert.equal(url.searchParams.get("format"), "markdown");
  for (const name of ["If-None-Match", "Range", "Signature-Agent"])
    assert.equal(req.headers.get(name), null);
  assert.equal(
    new URL(
      canonicalRequest(
        new Request("http://localhost:8800/api/docs?query=xcode"),
      ).url,
    ).searchParams.get("query"),
    "xcode",
  );
});

test("responses preserve policies and discovery, clear stale validators, and support HEAD", async () => {
  const make = () =>
    new Response("# Quickstart\n", {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Link: '<https://docs.limrun.com/docs/quickstart>; rel="canonical"',
        Vary: "Origin",
        ETag: '"html"',
        "Content-Length": "1",
        "Cache-Control": "public, max-age=0",
      },
    });
  const response = await agentResponse(make());
  assert.equal(response.headers.get("Vary"), "Origin, Accept");
  assert.equal(response.headers.get("ETag"), null);
  assert.equal(response.headers.get("Content-Length"), null);
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=0");
  assert.equal(
    response.headers.get("Content-Location"),
    "https://docs.limrun.com/docs/quickstart.md",
  );
  assert.match(response.headers.get("Link"), /rel="describedby"/);
  assert.match(
    await response.text(),
    /^Source: https:\/\/docs.limrun.com\/docs\/quickstart/,
  );
  const head = await agentResponse(make(), "HEAD");
  assert.equal(await head.text(), "");
  assert.ok(Number(head.headers.get("X-Markdown-Tokens")) > 0);
  for (const vary of ["*", "Origin, accept"]) {
    const headers = new Headers({ Vary: vary });
    varyOnAccept(headers);
    assert.equal(headers.get("Vary"), vary);
  }
});
