// Markdown 404 for agents. next.config.ts rewrites unmatched paths here only
// when the request asks for text/markdown, so browsers keep the HTML 404.

import { agentResponse } from "@/lib/agent-http";
import { SITE_URL } from "@/lib/site";

export function GET(request: Request) {
  // Route handlers see the original request URL, not the rewrite destination,
  // so the missing path is the request's own pathname.
  const url = new URL(request.url);
  const path = (url.searchParams.get("path") || url.pathname).replace(
    /^\/+/,
    "",
  );
  const body = `# Page not found

There is no page at \`/${path}\` on ${SITE_URL}.

Find the right page through one of these:

- [Documentation index](${SITE_URL}/llms.txt): every page with a one-line description.
- [Full documentation](${SITE_URL}/llms-full.txt): all pages as one Markdown file.
- [Sitemap](${SITE_URL}/sitemap.md): canonical page URLs.
- Search: \`GET ${SITE_URL}/api/docs?query=<words>\` returns matching pages as JSON.
`;
  return agentResponse(
    new Response(body, {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    }),
    request.method,
  );
}

export const HEAD = GET;
