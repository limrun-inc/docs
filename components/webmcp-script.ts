// WebMCP (https://webmachinelearning.github.io/webmcp/) lets an agent running
// in the browser call page tools directly. These wrap the same public
// endpoints the docs MCP server and llms.txt already serve, so they expose
// nothing new. The root layout inlines this in <head> so the tools exist while
// the page is still parsing: scanners check right after load, before React
// hydrates, and the site root navigates on to /docs before hydration at all.
// Browsers without the API skip registration.

export const webMcpScript = `
(function () {
  var contexts = [navigator.modelContext, document.modelContext].filter(function (c, i, all) {
    return c && typeof c.registerTool === "function" && all.indexOf(c) === i;
  });
  if (!contexts.length) return;

  function fetchText(url, signal, accept) {
    return fetch(url, { headers: { Accept: accept }, signal: signal }).then(function (response) {
      return response.text().then(function (text) {
        if (!response.ok) throw new Error(response.status + " " + response.statusText + ": " + text.slice(0, 500));
        return { content: [{ type: "text", text: text }] };
      });
    });
  }

  var tools = [
    {
      name: "search_docs",
      title: "Search the docs",
      description: "Search the Limrun documentation (cloud iOS simulators, Android emulators, remote Xcode and Gradle builds). Returns matching pages and sections as JSON with their URLs.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "Words to search for, such as \\"install app on simulator\\"." } },
        required: ["query"]
      },
      annotations: { readOnlyHint: true },
      execute: function (input, options) {
        return fetchText("/api/docs?query=" + encodeURIComponent(String(input.query)), options && options.signal, "application/json");
      }
    },
    {
      name: "read_docs_page",
      title: "Read a docs page",
      description: "Read one Limrun documentation page as Markdown. Pass the page path without the /docs prefix, such as \\"quickstart\\" or \\"ios/run-simulator\\"; an empty path returns the introduction.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string", description: "Page path, such as \\"reference/cli\\"." } },
        required: ["path"]
      },
      annotations: { readOnlyHint: true },
      execute: function (input, options) {
        var slug = String(input.path).replace(/^\\/+|\\/+$/g, "").replace(/^docs\\/?/, "").replace(/\\.md$/, "");
        return fetchText(slug ? "/docs/" + slug + ".md" : "/docs.md", options && options.signal, "text/markdown");
      }
    },
    {
      name: "list_docs_pages",
      title: "List all docs pages",
      description: "List every Limrun documentation page with a one-line description (the llms.txt index).",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: function (input, options) {
        return fetchText("/llms.txt", options && options.signal, "text/plain");
      }
    }
  ];

  contexts.forEach(function (context) {
    tools.forEach(function (tool) {
      try {
        Promise.resolve(context.registerTool(tool)).catch(function () {});
      } catch (e) {}
    });
  });
})();
`;
