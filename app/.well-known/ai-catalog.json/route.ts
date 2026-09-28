// Agentic Resource Discovery (ARD) catalog: one manifest that points agents at
// every machine-readable Limrun surface. See https://agenticresourcediscovery.org/
// and the ai-catalog data model. Each entry names exactly one `url`.

import { SITE_URL } from "@/lib/site";

const host = new URL(SITE_URL).host;

const catalog = {
  specVersion: "1.0",
  host: {
    displayName: "Limrun",
    identifier: `did:web:${host}`,
  },
  entries: [
    {
      identifier: `urn:air:${host}:server:limrun`,
      displayName: "Limrun MCP server",
      type: "application/mcp-server-card+json",
      url: "https://mcp.limrun.com/.well-known/mcp/server-card.json",
      representativeQueries: [
        "create a cloud iOS simulator",
        "start an Android emulator and take a screenshot",
        "tap a button on a remote simulator by accessibility label",
      ],
    },
    {
      identifier: `urn:air:${host}:server:docs`,
      displayName: "Limrun docs MCP server",
      type: "application/mcp-server-card+json",
      url: `${SITE_URL}/.well-known/mcp/server-card.json`,
      representativeQueries: [
        "how do I build an iOS app without a Mac",
        "search the Limrun documentation",
        "which lim command installs an app on a simulator",
      ],
    },
    {
      identifier: `urn:air:${host}:skills:limrun`,
      displayName: "Limrun agent skills",
      type: "application/json",
      url: `${SITE_URL}/.well-known/agent-skills/index.json`,
      representativeQueries: [
        "build an Xcode project from Linux",
        "run Maestro flows on a cloud iOS simulator",
        "build an Android app with remote Gradle",
      ],
    },
  ],
};

const body = `${JSON.stringify(catalog, null, 2)}\n`;

export function GET() {
  return new Response(body, {
    // CORS comes from the /.well-known/:path* rule in next.config.ts.
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
