// RFC 9727 API catalog. A route handler instead of a public/ file because the
// spec requires the application/linkset+json media type.

const catalog = {
  linkset: [
    {
      anchor: "https://api.limrun.com",
      "service-doc": [
        {
          href: "https://docs.limrun.com/docs/reference/sdk.md",
          type: "text/markdown",
        },
      ],
      describedby: [
        {
          href: "https://docs.limrun.com/llms.txt",
          type: "text/plain",
        },
      ],
    },
    {
      anchor: "https://docs.limrun.com/mcp",
      "service-desc": [
        {
          href: "https://docs.limrun.com/.well-known/mcp/server-card.json",
          type: "application/json",
        },
      ],
    },
  ],
};

export function GET() {
  return new Response(`${JSON.stringify(catalog, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
