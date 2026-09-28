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

// The root is a short summary page that sends browsers on to /docs (see
// app/page.tsx), so agents fetching the bare domain get content. It names
// /docs as canonical, and varies on Accept because Markdown requests are
// rewritten to the Introduction as Markdown.
const rootHeaders = [
  {
    key: "Link",
    value: `${agentDiscoveryHeaders[0].value}, <https://docs.limrun.com/docs>; rel="canonical"`,
  },
  { key: "Vary", value: "Accept" },
];

// Requests that ask for Markdown in their Accept header. Unlike the
// framework's /docs rules, the Web Bot Auth Signature-Agent header alone does
// not switch to Markdown here: signed crawlers send it on every request, and
// one that asks for text/html must still get the HTML page.
const wantsMarkdown = [[{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }]];

// The discovery artifacts are public read-only text; the Agent Skills
// Discovery RFC recommends CORS so browser-based agents can fetch them.
const corsHeaders = [{ key: "Access-Control-Allow-Origin", value: "*" }];

// Baseline security headers, served on every response. The CSP carries only
// frame-ancestors: a resource policy would have to name every script, style
// and font the docs load, and one written without testing breaks the page
// rather than protecting it. Clickjacking is what the missing header actually
// exposed, and frame-ancestors closes it on its own.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // X-Frame-Options says the same thing to browsers predating frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

// Pages that moved in the docs restructure. Each old URL, and its markdown
// twin, keeps resolving so external links and agent caches do not break.
const movedPages: Record<string, string> = {
  "/docs/agents/cloud-agents": "/docs/agents/claude-code-web",
  "/docs/agents/cloud-agents/claude-code-web": "/docs/agents/claude-code-web",
  "/docs/ios/test-with-xctest": "/docs/testing/xctest",
  "/docs/ios/pr-previews": "/docs/ci/pr-previews",
  "/docs/tutorials": "/docs/guides",
  "/docs/tutorials/ios-bazel-claude-code-web": "/docs/guides/ios-bazel-claude-code-web",
};

export default withDocs({
  async rewrites() {
    return {
      beforeFiles: [
        ...wantsMarkdown.map((has) => ({ source: "/", has, destination: "/api/docs?format=markdown" })),
      ],
      afterFiles: [],
      // Only paths no page or route matched reach this: a Markdown 404 for
      // agents, while browsers keep the HTML not-found page.
      fallback: wantsMarkdown.map((has) => ({
        source: "/:path*",
        has,
        destination: "/api/not-found?path=:path*",
      })),
    };
  },
  async redirects() {
    return Object.entries(movedPages).flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      { source: `${source}.md`, destination: `${destination}.md`, permanent: true },
    ]);
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/", headers: rootHeaders },
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
