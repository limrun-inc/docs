import { NextRequest, NextResponse } from "next/server";
import {
  discoveryLinks,
  documentPath,
  varyOnAccept,
  wantsMarkdown,
} from "./lib/agent-http";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  // The fallback rewrite may trust only the preference computed here.
  headers.delete("x-limrun-wants-markdown");
  const read = request.method === "GET" || request.method === "HEAD";
  const markdown = read && wantsMarkdown(headers.get("Accept"));

  const path = request.nextUrl.pathname;
  const canonical = documentPath(path);
  // RSC and prefetch requests belong to Next's navigation protocol.
  const navigation =
    headers.has("RSC") ||
    headers.has("Next-Router-State-Tree") ||
    headers.has("Next-Router-Prefetch");
  if (markdown && !navigation) headers.set("x-limrun-wants-markdown", "1");
  if (read && canonical && !navigation && (markdown || path.endsWith(".md"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/docs";
    url.search = "";
    url.searchParams.set("format", "markdown");
    url.searchParams.set("path", canonical.slice("/docs".length));
    for (const name of [
      "If-None-Match",
      "If-Modified-Since",
      "Range",
      "If-Range",
    ])
      headers.delete(name);
    return NextResponse.rewrite(url, { request: { headers } });
  }
  const response = NextResponse.next({ request: { headers } });
  if (read) varyOnAccept(response.headers);
  if (read && canonical) {
    response.headers.append("Link", discoveryLinks(canonical));
  }
  return response;
}

export const config = { matcher: ["/((?!_next/).*)"] };
