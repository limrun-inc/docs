import { withDocs } from "@farming-labs/next/config";

// RFC 8288 Link header pointing agents at the machine-readable surfaces.
// Served on / and /docs only: a wildcard /docs/:path* source would replace the
// framework's per-page rel=canonical Link header on /docs/{slug}.md responses
// (Next config headers overwrite handler headers for non-mergeable names).
const agentDiscoveryHeaders = [
  {
    key: "Link",
    // Registered relation types only: RFC 8288 requires unregistered rels to
    // be absolute URIs, so no bare "llms.txt" rel here. llms.txt stays
    // discoverable via robots.txt, AGENTS.md, and agent.json.
    value: [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</.well-known/agent-skills/index.json>; rel="describedby"',
      '</.well-known/mcp/server-card.json>; rel="service-desc"',
    ].join(", "),
  },
];

// The discovery artifacts are public read-only text; the Agent Skills
// Discovery RFC recommends CORS so browser-based agents can fetch them.
const corsHeaders = [{ key: "Access-Control-Allow-Origin", value: "*" }];

export default withDocs({
  async headers() {
    return [
      { source: "/", headers: agentDiscoveryHeaders },
      { source: "/docs", headers: agentDiscoveryHeaders },
      { source: "/.well-known/:path*", headers: corsHeaders },
      { source: "/auth.md", headers: corsHeaders },
      { source: "/AGENTS.md", headers: corsHeaders },
      { source: "/skill.md", headers: corsHeaders },
      { source: "/llms.txt", headers: corsHeaders },
      { source: "/llms-full.txt", headers: corsHeaders },
    ];
  },
});
