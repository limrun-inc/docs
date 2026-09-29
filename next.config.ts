import { withDocs } from "@farming-labs/next/config";

// Public read-only documentation can be fetched by browser-based agents.
const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Expose-Headers",
    value: "Link, Content-Location, X-Markdown-Tokens, Content-Signal",
  },
];

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
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

// Pages that moved in the docs restructure. Each old URL, and its markdown
// twin, keeps resolving so external links and agent caches do not break.
const movedPages: Record<string, string> = {
  "/docs/agents/cloud-agents": "/docs/agents/claude-code-web",
  "/docs/agents/cloud-agents/claude-code-web": "/docs/agents/claude-code-web",
  "/docs/ios/test-with-xctest": "/docs/testing/xctest",
  "/docs/ios/pr-previews": "/docs/ci/pr-previews",
  "/docs/tutorials": "/docs/guides",
  "/docs/tutorials/ios-bazel-claude-code-web":
    "/docs/guides/ios-bazel-claude-code-web",
};

const config = withDocs({
  // Proxy must see Next's RSC headers before deciding whether this is a document read.
  skipProxyUrlNormalize: true,
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/:path*",
          has: [{ type: "header", key: "x-limrun-wants-markdown", value: "1" }],
          destination: "/api/not-found?path=:path*",
        },
      ],
    };
  },
  async redirects() {
    return Object.entries(movedPages).flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      {
        source: `${source}.md`,
        destination: `${destination}.md`,
        permanent: true,
      },
    ]);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Signal",
            value: "ai-train=yes, search=yes, ai-input=yes",
          },
        ],
      },
      { source: "/", headers: corsHeaders },
      { source: "/docs/:path*", headers: corsHeaders },
      { source: "/.well-known/:path*", headers: corsHeaders },
      { source: "/:path*.md", headers: corsHeaders },
      { source: "/llms.txt", headers: corsHeaders },
      { source: "/llms-full.txt", headers: corsHeaders },
    ];
  },
});

// Keep framework discovery routes and direct .md routes. Proxy owns negotiation:
// substring Accept matching and Signature-Agent cannot select a representation.
const frameworkRewrites = config.rewrites;
config.rewrites = async () => {
  const rewrites = await frameworkRewrites!();
  const keep = (rule: { destination: string; has?: { key?: string }[] }) =>
    !(
      rule.destination.startsWith("/api/docs?format=markdown") &&
      rule.has?.some(
        (condition) =>
          condition.key === "accept" || condition.key === "signature-agent",
      )
    );
  if (Array.isArray(rewrites)) return rewrites.filter(keep);
  return {
    beforeFiles: rewrites.beforeFiles?.filter(keep) ?? [],
    afterFiles: rewrites.afterFiles?.filter(keep) ?? [],
    fallback: rewrites.fallback?.filter(keep) ?? [],
  };
};
export default config;
