// MCP Server Card (SEP-1649). serverInfo derives from lib/site.ts, the same
// source docs.config.tsx feeds to the live /mcp server, so they cannot drift.

import { MCP_NAME, MCP_VERSION, SITE_URL } from "@/lib/site";

const card = {
  serverInfo: {
    name: MCP_NAME,
    version: MCP_VERSION,
  },
  description:
    "Search and read the Limrun documentation (cloud iOS simulators, Android emulators, remote Xcode and Gradle builds) over MCP.",
  // Both spelled out on purpose: draft server-card consumers read `endpoint`,
  // existing published cards (e.g. Cloudflare's) use `url`.
  endpoint: `${SITE_URL}/mcp`,
  url: `${SITE_URL}/mcp`,
  transport: {
    type: "streamable-http",
  },
  // Must match what the live server actually advertises in initialize.
  capabilities: {
    tools: true,
    resources: true,
    prompts: false,
  },
};

const body = `${JSON.stringify(card, null, 2)}\n`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
