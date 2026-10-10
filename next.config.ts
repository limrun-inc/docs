import { withDocs } from "@farming-labs/next/config";
import { SITE_URL } from "./lib/site";

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

// The config Link header replaces the one the Markdown handler sets, so / and
// /docs restate the canonical URL of the Introduction the handler would send.
const introductionHeaders = [
  { key: "Link", value: `${agentDiscoveryHeaders[0].value}, <${SITE_URL}/docs>; rel="canonical"` },
];

// Markdown is negotiated by the Accept header alone. The framework also
// serves Markdown when a request carries a Signature-Agent header (Web Bot
// Auth), but signed agents send it on every request, including real browsers
// that ask for text/html; those must get the HTML page and its scripts.
const markdownAccept = { type: "header" as const, key: "accept", value: ".*text/markdown.*" };

type Rewrite = { has?: { type: string; key?: string }[] };
type Rewrites = Rewrite[] | { beforeFiles?: Rewrite[]; afterFiles?: Rewrite[]; fallback?: Rewrite[] };

// Drops framework rewrites that switch to Markdown on any header but Accept.
function acceptOnly<T extends Rewrites>(rewrites: T): T {
  const keep = (rule: Rewrite) =>
    !rule.has?.some((condition) => condition.type === "header" && condition.key !== "accept");
  if (Array.isArray(rewrites)) return rewrites.filter(keep) as T;
  return {
    ...rewrites,
    beforeFiles: rewrites.beforeFiles?.filter(keep),
    afterFiles: rewrites.afterFiles?.filter(keep),
    fallback: rewrites.fallback?.filter(keep),
  };
}

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
  "/docs/reference/egress-ip-addresses": "/docs/networking/egress-ip-addresses",
  "/docs/tutorials": "/docs/guides",
  "/docs/tutorials/ios-bazel-claude-code-web": "/docs/guides/ios-bazel-claude-code-web",
};

const config = withDocs({
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", has: [markdownAccept], destination: "/api/docs?format=markdown" },
      ],
      afterFiles: [],
      // Only paths no page or route matched reach this: a Markdown 404 for
      // agents, while browsers keep the HTML not-found page.
      fallback: [
        { source: "/:path*", has: [markdownAccept], destination: "/api/not-found?path=:path*" },
      ],
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
      { source: "/", headers: introductionHeaders },
      { source: "/docs", headers: introductionHeaders },
      { source: "/.well-known/:path*", headers: corsHeaders },
      { source: "/auth.md", headers: corsHeaders },
      { source: "/AGENTS.md", headers: corsHeaders },
      { source: "/skill.md", headers: corsHeaders },
      { source: "/llms.txt", headers: corsHeaders },
      { source: "/llms-full.txt", headers: corsHeaders },
    ];
  },
});

const docsRewrites = config.rewrites!;
config.rewrites = async () => acceptOnly(await docsRewrites());

export default config;
