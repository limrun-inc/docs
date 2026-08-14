import { withDocs } from "@farming-labs/next/config";

// RFC 8288 Link header pointing agents at the machine-readable surfaces.
// Served on / and every docs page so deep links also carry discovery.
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

export default withDocs({
  async headers() {
    return [
      { source: "/", headers: agentDiscoveryHeaders },
      { source: "/docs/:path*", headers: agentDiscoveryHeaders },
    ];
  },
});
