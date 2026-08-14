import { withDocs } from "@farming-labs/next/config";

// RFC 8288 Link header pointing agents at the machine-readable surfaces.
// Served on / and every docs page so deep links also carry discovery.
const agentDiscoveryHeaders = [
  {
    key: "Link",
    value: [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</.well-known/agent-skills/index.json>; rel="describedby"',
      '</.well-known/mcp/server-card.json>; rel="service-desc"',
      '</llms.txt>; rel="llms.txt"',
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
