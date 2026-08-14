// RFC 9727 API catalog. A route handler instead of a public/ file because the
// spec requires the application/linkset+json media type.

import { SITE_URL } from "@/lib/site";

const catalog = {
  linkset: [
    {
      anchor: "https://api.limrun.com",
      "service-doc": [
        {
          href: `${SITE_URL}/docs/reference/sdk.md`,
          type: "text/markdown",
        },
      ],
      describedby: [
        {
          href: `${SITE_URL}/llms.txt`,
          type: "text/plain",
        },
      ],
    },
    {
      anchor: `${SITE_URL}/mcp`,
      "service-desc": [
        {
          href: `${SITE_URL}/.well-known/mcp/server-card.json`,
          type: "application/json",
        },
      ],
    },
  ],
};

const body = `${JSON.stringify(catalog, null, 2)}\n`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
