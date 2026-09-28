// WebMCP (https://webmachinelearning.github.io/webmcp/) lets an agent running
// in the browser call page tools directly. These wrap the same public
// endpoints the docs MCP server and llms.txt already serve, so they expose
// nothing new. The root layout inlines this in <head> rather than registering
// from a React effect: scanners check right after load, before hydration, and
// the site root navigates on to /docs before it hydrates at all. Browsers
// without the API skip registration.

export const webMcpScript = `
(function () {
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
      description: "List every Limrun documentation page with a one-line description (the llms.txt index).",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: function (input, options) {
        return fetchText("/llms.txt", options && options.signal, "text/plain");
      }
    }
  ];

  // The API is still in flux: the current draft registers tools one at a
  // time, and older implementations only take them all through provideContext.
  // The API object can appear after this script runs (an extension or test
  // harness may inject it late), so try now, at DOMContentLoaded, and at load,
  // registering with each object once.
  var done = [];
  function register() {
    [navigator.modelContext, document.modelContext].forEach(function (context) {
      if (!context || done.indexOf(context) !== -1) return;
      if (typeof context.provideContext !== "function" && typeof context.registerTool !== "function") return;
      done.push(context);
      try {
        if (typeof context.registerTool === "function") {
          tools.forEach(function (tool) {
            Promise.resolve(context.registerTool(tool)).catch(function () {});
          });
        } else {
          context.provideContext({ tools: tools });
        }
      } catch (e) {}
    });
  }
  register();
  document.addEventListener("DOMContentLoaded", register);
  window.addEventListener("load", register);
})();
`;
