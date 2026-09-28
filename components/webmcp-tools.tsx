"use client";

import { useEffect } from "react";

// WebMCP (https://webmachinelearning.github.io/webmcp/) lets an agent running
// in the browser call page tools directly. These wrap the same public
// endpoints the docs MCP server and llms.txt already serve, so they expose
// nothing new. Browsers without the API skip registration.

type ToolResult = { content: { type: "text"; text: string }[] };

type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<ToolResult>;
};

type ModelContext = {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};

async function fetchText(url: string, signal?: AbortSignal, accept = "text/markdown"): Promise<ToolResult> {
  const response = await fetch(url, { headers: { Accept: accept }, signal });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return { content: [{ type: "text", text }] };
}

const tools: ModelContextTool[] = [
  {
    name: "search_docs",
    title: "Search the docs",
    description:
      "Search the Limrun documentation (cloud iOS simulators, Android emulators, remote Xcode and Gradle builds). Returns matching pages and sections as JSON with their URLs.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Words to search for, such as \"install app on simulator\"." } },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
    execute: ({ query }, options) =>
      fetchText(`/api/docs?query=${encodeURIComponent(String(query))}`, options?.signal, "application/json"),
  },
  {
    name: "read_docs_page",
    title: "Read a docs page",
    description:
      "Read one Limrun documentation page as Markdown. Pass the page path without the /docs prefix, such as \"quickstart\" or \"ios/run-simulator\"; an empty path returns the introduction.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Page path, such as \"reference/cli\"." } },
      required: ["path"],
    },
    annotations: { readOnlyHint: true },
    execute: ({ path }, options) => {
      const slug = String(path).replace(/^\/+|\/+$/g, "").replace(/^docs\/?/, "").replace(/\.md$/, "");
      return fetchText(slug ? `/docs/${slug}.md` : "/docs.md", options?.signal);
    },
  },
  {
    name: "list_docs_pages",
    title: "List all docs pages",
    description: "List every Limrun documentation page with a one-line description (the llms.txt index).",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute: (_input, options) => fetchText("/llms.txt", options?.signal, "text/plain"),
  },
];

export function WebMcpTools() {
  useEffect(() => {
    const contexts = new Set(
      [
        (navigator as Navigator & { modelContext?: ModelContext }).modelContext,
        (document as Document & { modelContext?: ModelContext }).modelContext,
      ].filter((context): context is ModelContext => Boolean(context?.registerTool)),
    );
    if (contexts.size === 0) return;

    const controller = new AbortController();
    for (const context of contexts) {
      for (const tool of tools) {
        Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(() => {
          // Already registered by another mount, or rejected by the browser.
        });
      }
    }
    return () => controller.abort();
  }, []);

  return null;
}
