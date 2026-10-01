import { NextResponse, type NextRequest } from "next/server";

// The site root redirects browsers to /docs. Requests that ask for Markdown
// pass through to the rewrite in next.config.ts, which serves the
// Introduction. The redirect lives here rather than in next.config.ts
// redirects so it can carry Vary: Accept, which config headers never reach.
export function proxy(request: NextRequest) {
  if (request.headers.get("accept")?.includes("text/markdown")) return;
  const url = request.nextUrl.clone();
  url.pathname = "/docs";
  const response = NextResponse.redirect(url, 307);
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = { matcher: "/" };
