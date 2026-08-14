# Limrun docs, agent guide

Limrun is cloud infrastructure for mobile development. It runs iOS simulators, Android emulators, and Xcode builds in the cloud so that any process, including coding agents on Linux machines, can build, run, and drive mobile apps without local Apple or Android hardware.

This document tells you, an AI agent, how to consume this documentation site programmatically.

## Read the docs

- `/llms.txt` is a compact index of every page with a one-line description.
- `/llms-full.txt` is the full documentation as one markdown file.
- Every page is available as markdown at `/docs/{slug}.md`, for example `/docs/quickstart.md`. Requesting a page URL with `Accept: text/markdown` returns the same content.
- `/sitemap.xml` and `/sitemap.md` list canonical page URLs.
- Search: `GET /api/docs?query={query}` returns matching pages as JSON.

## MCP server

The docs are also exposed over MCP (Streamable HTTP) at `https://docs.limrun.com/mcp`. It provides tools to list, read, and search documentation pages. Discovery metadata is at `/.well-known/mcp/server-card.json`.

## Use Limrun itself

- Authentication: API keys, described at `/auth.md`. A human must create the key at [console.limrun.com](https://console.limrun.com); set it as the `LIM_API_KEY` environment variable.
- The `lim` CLI is the agent-facing interface. Start at `/docs/agents/cli.md`.
- Ready-made agent skills for Limrun workflows live in the public [limrun-inc/skills](https://github.com/limrun-inc/skills) repository, installable with `lim skills install`. A discovery index is at `/.well-known/agent-skills/index.json`.
- The REST API and SDKs (TypeScript, Python, Go) are documented at `/docs/reference/sdk.md`.

## Crawling policy

`/robots.txt` allows AI crawlers and declares content signals: search, AI input, and AI training are all permitted.
