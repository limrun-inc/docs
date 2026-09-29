import Negotiator from "negotiator";
import { DOC_SECTIONS, SITE_URL } from "./site.ts";

export function wantsMarkdown(accept: string | null): boolean {
  return (
    new Negotiator({ headers: { accept: accept || "*/*" } }).mediaType([
      "text/html; charset=utf-8",
      "text/markdown; charset=utf-8",
    ]) === "text/markdown; charset=utf-8"
  );
}

export function varyOnAccept(headers: Headers) {
  const vary =
    headers
      .get("Vary")
      ?.split(",")
      .map((value) => value.trim().toLowerCase()) ?? [];
  if (!vary.includes("accept") && !vary.includes("*"))
    headers.append("Vary", "Accept");
}

// The directory aliases resolve to the same document, never a second source.
export function documentPath(path: string): string | null {
  path = path.replace(/\/+$/, "") || "/";
  if (
    path === "/" ||
    path === "/index.md" ||
    path === "/docs.md" ||
    path === "/docs/index.md"
  )
    return "/docs";
  if (path === "/docs" || path.startsWith("/docs/")) {
    const canonical = path.replace(/(?:\/index)?\.md$/, "");
    if (/^\/docs(?:\/[a-z0-9-]+)*$/.test(canonical)) return canonical;
  }
  return null;
}

export function discoveryLinks(canonical?: string) {
  const section = canonical?.split("/")[2];
  const index = DOC_SECTIONS.some(({ slug }) => slug === section)
    ? `/docs/${section}/llms.txt`
    : "/llms.txt";
  return [
    `<${SITE_URL}${index}>; rel="describedby"`,
    `<${SITE_URL}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${SITE_URL}/.well-known/mcp/server-card.json>; rel="service-desc"`,
    ...(canonical
      ? [`<${SITE_URL}${canonical}.md>; rel="alternate"; type="text/markdown"`]
      : []),
  ].join(", ");
}

export function canonicalRequest(request: Request): Request {
  const url = new URL(request.url);
  const canonical = new URL(SITE_URL);
  url.protocol = canonical.protocol;
  url.host = canonical.host;
  url.port = canonical.port;
  const page = documentPath(url.pathname);
  if (page) {
    // Route handlers can see the original URL instead of the rewrite query.
    url.pathname = "/api/docs";
    url.search = "";
    url.searchParams.set("format", "markdown");
    url.searchParams.set("path", page.slice("/docs".length));
  }
  const headers = new Headers(request.headers);
  // Identity is not a format preference. Explicit API formats still work.
  headers.delete("Signature-Agent");
  for (const name of [
    "If-None-Match",
    "If-Modified-Since",
    "Range",
    "If-Range",
  ])
    headers.delete(name);
  return new Request(url, { method: request.method, headers });
}

export async function agentResponse(
  response: Response,
  method = "GET",
): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Expose-Headers",
    "Link, Content-Location, X-Markdown-Tokens, Content-Signal",
  );
  const canonical = /<([^>]+)>;\s*rel="canonical"/.exec(
    headers.get("Link") ?? "",
  )?.[1];
  headers.append(
    "Link",
    discoveryLinks(canonical ? new URL(canonical).pathname : undefined),
  );
  const markdown = headers.get("Content-Type")?.startsWith("text/markdown");
  if (!markdown)
    return new Response(method === "HEAD" ? null : response.body, {
      status: response.status,
      headers,
    });
  varyOnAccept(headers);
  for (const name of [
    "Content-Length",
    "Content-Encoding",
    "Content-Range",
    "Accept-Ranges",
    "Transfer-Encoding",
    "ETag",
    "Last-Modified",
  ])
    headers.delete(name);
  let body = await response.text();
  if (canonical && response.ok) {
    body = `Source: ${canonical}\n\n${body}`;
    headers.set("Content-Location", `${canonical}.md`);
  }
  headers.set("X-Markdown-Tokens", String(Math.ceil(body.length / 4)));
  return new Response(method === "HEAD" ? null : body, {
    status: response.status,
    headers,
  });
}
