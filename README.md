# Limrun documentation

Use Node.js 22.18 or newer and the pinned pnpm version:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm build
corepack pnpm start --port 8800
```

In a second terminal, run `corepack pnpm check:agent-http`. Set `AGENT_TEST_URL`
to check a different local server. The check follows the root and section indexes
and verifies every published page through HTML, negotiated Markdown, and both
Markdown aliases. It also checks redirects, 404s, HEAD, quality weights, conditional
requests, canonical origins, policy headers, search, and RSC navigation.

## Agent access

`proxy.ts` selects Markdown for GET and HEAD requests according to the `Accept`
header. `Signature-Agent` identifies a crawler and does not select a format. Next's
RSC and prefetch requests retain their navigation protocol. The framework still
owns source rendering, search, MCP, and discovery endpoints; its substring-based
negotiation rules are removed from the final rewrite configuration.

The API wrapper preserves framework headers, adds a canonical source URL and an
approximate token count, and keeps HTML validators and ranges out of Markdown
responses. API requests use `SITE_URL`, including its port, so local or proxy hosts
never become canonical URLs. Public read responses allow cross-origin access.
HTTP Content-Signal repeats the existing robots.txt policy.

`DOC_SECTIONS` generates scoped llms.txt indexes through the framework. HTTP Link
headers point each article at its section index and Markdown alternative. HTML
also advertises Markdown and the root discovery index. The existing WebMCP and
MCP tools remain available.

## Next.js Vary patch

Next.js 16.3.7 is pinned with a small pnpm patch for
[upstream issue #85999](https://github.com/vercel/next.js/issues/85999).
Its page runtime overwrites application Vary headers, which drops Accept from
HTML responses and allows a cache to confuse HTML and Markdown. The patch merges
existing fields with Next's RSC fields, deduplicates case-insensitively, and
preserves a wildcard. Both CommonJS and ESM build templates are patched.

Remove the patch when an upstream release includes the fix, then run the HTTP
check against a fresh production build. A successful build or route unit test
alone cannot detect this regression.
